import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createNotification } from "@/lib/notifications";
import { SALES_THRESHOLDS, TIER_THRESHOLDS, formatCentsToCurrency } from "@/lib/commission";
import { apiWriteLimiter } from "@/lib/rate-limit";
import { log } from "@/lib/logger";
import { ReleaseMilestoneSchema } from "@/lib/schemas/api";
import { captureException } from "@/lib/sentry";
import { Prisma } from "@prisma/client";
import { resend } from "@/lib/resend";
import { deliveryReadyEmail } from "@/lib/email-templates";
import { APP_URL } from "@/lib/app-url";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: max 60 writes per minute per user
  const rl = apiWriteLimiter.check(session.user.id);
  if (!rl.success) {
    log.warn("milestone.release_rate_limited", { userId: session.user.id });
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  try {
    const raw = await req.json();
    const parsed = ReleaseMilestoneSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn("milestone.invalid_body", { errors: parsed.error.flatten() });
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { orderId, milestoneIndex } = parsed.data;
    const idx = milestoneIndex;

    // ─── STEP 1: Atomically claim the milestone ────────────────────────────────
    // Uses a serializable transaction so two concurrent requests cannot both see
    // status "in_escrow" and both proceed to transfer.  The first one wins and
    // sets status to "releasing"; the second sees "releasing" and is rejected.
    type ClaimedOrder = Prisma.OrderGetPayload<{ include: { seller: true } }>;
    let claimedOrder: ClaimedOrder | null = null;
    let claimedMilestones: import("@/types").Milestone[] = [];
    let claimedMilestone: import("@/types").Milestone | null = null;

    try {
      await prisma.$transaction(async (tx) => {
        const current = await tx.order.findUnique({
          where: { id: orderId },
          include: { seller: true },
        });

        if (!current || current.buyerId !== session.user.id) {
          throw new Error("UNAUTHORIZED");
        }

        const milestones = (current.milestones as unknown as import("@/types").Milestone[]) || [];
        const milestone = milestones[idx];

        if (!milestone || milestone.status !== "in_escrow") {
          throw new Error("NOT_READY");
        }

        // Mark as "releasing" — blocks any concurrent release attempt
        milestones[idx] = { ...milestone, status: "releasing" };

        await tx.order.update({
          where: { id: orderId },
          data: { milestones: milestones as unknown as Prisma.InputJsonValue },
        });

        claimedOrder = current;
        claimedMilestones = milestones;
        claimedMilestone = milestone;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (txErr: unknown) {
      const msg = txErr instanceof Error ? txErr.message : "";
      if (msg === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized or Order not found" }, { status: 403 });
      }
      if (msg === "NOT_READY") {
        return NextResponse.json({ error: "Milestone not ready for release or already being processed" }, { status: 400 });
      }
      throw txErr; // unexpected — re-throw to outer catch
    }

    // Null guard: transaction would have thrown before we reach here without setting these
    if (!claimedOrder || !claimedMilestone) {
      // Should never happen — transaction would have thrown
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    const order = claimedOrder as ClaimedOrder;
    const milestones = claimedMilestones as import("@/types").Milestone[];
    const milestone = claimedMilestone as import("@/types").Milestone;

    // ─── STEP 2: Calculate payout ──────────────────────────────────────────────
    const amountCents = typeof milestone.priceCents === "number"
      ? milestone.priceCents
      : Math.round((milestone.price ?? 0) * 100);

    let feePercent = order.seller.platformFeePercentage || TIER_THRESHOLDS.STANDARD;

    const tier = order.seller.tier;
    const isFounding = order.seller.isFoundingExpert;

    if (tier === "PROVEN") {
      feePercent = Math.min(feePercent, TIER_THRESHOLDS.PROVEN);
    } else if (tier === "ELITE") {
      feePercent = Math.min(feePercent, TIER_THRESHOLDS.ELITE);
    } else {
      feePercent = Math.min(feePercent, TIER_THRESHOLDS.STANDARD);
    }

    if (isFounding) feePercent = TIER_THRESHOLDS.FOUNDING;

    if (order.seller.commissionOverridePercent) {
      feePercent = Number(order.seller.commissionOverridePercent);
    }

    // Referral discount check
    let expertDiscountApplied = false;
    let expertRewards: import("@/types").ReferralRewards = {};
    const sellerUser = await prisma.user.findUnique({
      where: { id: order.seller.userId },
      select: { referralRewards: true },
    });
    expertRewards = (sellerUser?.referralRewards as unknown as Record<string, number>) || {};
    const expertDiscountCount = expertRewards.expertDiscountCount || 0;
    if (expertDiscountCount > 0) {
      feePercent = Math.max(0, feePercent - 5);
      expertDiscountApplied = true;
    }

    const platformFee = Math.round(amountCents * (feePercent / 100));
    const transferAmount = amountCents - platformFee;

    if (!order.seller.stripeAccountId) {
      // Revert milestone back to in_escrow so it can be retried once Stripe is connected
      milestones[idx] = { ...milestone, status: "in_escrow" };
      await prisma.order.update({ where: { id: orderId }, data: { milestones: milestones as unknown as Prisma.InputJsonValue } });
      return NextResponse.json({ error: "Seller has no Stripe account" }, { status: 400 });
    }

    // ─── STEP 3: Execute Stripe transfer ──────────────────────────────────────
    // This is outside the DB transaction because Stripe is an external call.
    // If it fails, we revert the milestone to "in_escrow" so it can be retried.
    try {
      await stripe.transfers.create({
        amount: transferAmount,
        currency: "eur",
        destination: order.seller.stripeAccountId,
        description: `Release for ${order.id} - ${milestone.title}`,
      });
    } catch (stripeErr) {
      log.error("milestone.stripe_transfer_failed", { orderId, milestoneIdx: idx, error: String(stripeErr) });
      // Revert so the buyer can try again
      milestones[idx] = { ...milestone, status: "in_escrow" };
      await prisma.order.update({ where: { id: orderId }, data: { milestones: milestones as unknown as Prisma.InputJsonValue } });
      return NextResponse.json({ error: "Payment transfer failed. Please try again." }, { status: 502 });
    }

    // ─── STEP 4: Finalise DB in a single transaction ───────────────────────────
    milestones[idx] = { ...milestone, status: "released", releasedAt: new Date().toISOString() };

    const isLastMilestone = idx + 1 >= milestones.length;
    if (!isLastMilestone) {
      milestones[idx + 1].status = "waiting_for_funds";
    }

    await prisma.$transaction(async (tx) => {
      // Consume expert referral discount
      if (expertDiscountApplied) {
        await tx.user.update({
          where: { id: order.seller.userId },
          data: {
            referralRewards: {
              ...expertRewards,
              expertDiscountCount: expertDiscountCount - 1,
            },
          },
        });
      }

      // Update milestones (and order status if last)
      await tx.order.update({
        where: { id: orderId },
        data: {
          milestones: milestones as unknown as Prisma.InputJsonValue,
          ...(isLastMilestone ? { status: "delivered" } : {}),
        },
      });

      // On last milestone: create review record for double-blind review flow
      if (isLastMilestone) {
        await tx.review.create({ data: { orderId } });
      }

      // On last milestone: handle tier upgrade
      if (isLastMilestone) {
        const updatedSpecialist = await tx.specialistProfile.update({
          where: { id: order.sellerId },
          data: { completedSalesCount: { increment: 1 } },
        });

        const newCount = updatedSpecialist.completedSalesCount;
        const oldTier = order.seller.tier;
        const isFoundingExpert = order.seller.isFoundingExpert;

        let newTier: "STANDARD" | "PROVEN" | "ELITE" | null = null;
        if (newCount >= SALES_THRESHOLDS.ELITE && oldTier !== "ELITE") {
          newTier = "ELITE";
        } else if (newCount >= SALES_THRESHOLDS.PROVEN && oldTier === "STANDARD") {
          newTier = "PROVEN";
        }

        if (newTier) {
          const newFeePercent = isFoundingExpert
            ? TIER_THRESHOLDS.FOUNDING
            : newTier === "ELITE" ? TIER_THRESHOLDS.ELITE : TIER_THRESHOLDS.PROVEN;

          await tx.specialistProfile.update({
            where: { id: order.sellerId },
            data: { tier: newTier, platformFeePercentage: newFeePercent },
          });
        }
      }
    });

    // ─── STEP 5: Notifications (non-critical, outside transaction) ────────────
    const discountNote = expertDiscountApplied
      ? ` (referral discount applied: ${feePercent + 5}% → ${feePercent}% fee)` : "";

    await createNotification(
      order.seller.userId,
      "Milestone Released",
      `Milestone "${milestone.title}" approved! ${formatCentsToCurrency(transferAmount)} transferred to your Stripe account.${discountNote}`,
      "success",
      `/expert/projects/${orderId}`
    );

    // Tier-up notification (after transaction, so we know the new tier)
    if (isLastMilestone) {
      const refreshed = await prisma.specialistProfile.findUnique({ where: { id: order.sellerId } });
      if (refreshed && refreshed.tier !== order.seller.tier) {
        const tierLabel = refreshed.tier === "ELITE" ? "Elite" : "Proven";
        const isElite = refreshed.tier === "ELITE";
        const feeMessage = refreshed.isFoundingExpert
          ? `Your Founding Expert rate of ${TIER_THRESHOLDS.FOUNDING}% still applies — it's already the lowest on the platform.${isElite ? " You now have full access to Custom Projects." : ""}`
          : `Your commission rate has permanently dropped to ${refreshed.platformFeePercentage}%.${isElite ? " You now have full access to Custom Projects in the Find Work feed." : " You now have access to Discovery Scans in the Find Work feed."}`;
        await createNotification(
          order.seller.userId,
          `🎉 You've reached ${tierLabel} tier!`,
          feeMessage,
          "success",
          isElite ? "/jobs" : "/expert/earnings"
        );
      }

      // Prompt seller to leave a review (after tier notification)
      await createNotification(
        order.seller.userId,
        "Project complete — leave a review",
        "All milestones delivered! Share your experience working with this client.",
        "info",
        `/expert/reviews/${orderId}`
      );

      // ── Send delivery-ready email to the buyer (fire-and-forget) ──────────
      const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
      if (FROM_EMAIL) {
        const buyer = await prisma.user.findUnique({
          where: { id: order.buyerId },
          select: {
            email: true,
            businessProfile: { select: { firstName: true } },
          },
        });
        if (buyer?.email) {
          const solutionTitle =
            (await prisma.solution.findUnique({
              where: { id: order.solutionId ?? "" },
              select: { title: true },
            }))?.title ?? "your project";

          resend.emails
            .send({
              from: FROM_EMAIL,
              to: buyer.email,
              subject: `Your automation "${solutionTitle}" is ready for review`,
              html: deliveryReadyEmail({
                firstName: buyer.businessProfile?.firstName ?? "there",
                projectTitle: solutionTitle,
                expertName: order.seller.displayName || "Your expert",
                reviewUrl: `${APP_URL}/business/projects/${orderId}`,
              }),
            })
            .catch((e) =>
              log.error("milestone.delivery_email_failed", {
                orderId,
                error: String(e),
              })
            );
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    log.error("milestone.release_failed", { error: String(error) });
    captureException(error, { context: "release-milestone" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
