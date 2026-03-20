import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createNotification } from "@/lib/notifications";
import { SALES_THRESHOLDS, TIER_THRESHOLDS, formatCentsToCurrency, getCommissionPercent } from "@/lib/commission";
import type { CommissionExpert } from "@/lib/commission";
import { apiWriteLimiter } from "@/lib/rate-limit";
import { log } from "@/lib/logger";
import { ReleaseMilestoneSchema } from "@/lib/schemas/api";
import { captureException } from "@/lib/sentry";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: max 60 writes per minute per user
  const rl = await apiWriteLimiter.check(session.user.id);
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

    // ─── STEP 2: Calculate payout (single source of truth: commission.ts) ──────
    const amountCents = typeof milestone.priceCents === "number"
      ? milestone.priceCents
      : Math.round((milestone.price ?? 0) * 100);

    // Build an Expert shape for the canonical commission calculator
    const expertForCommission: CommissionExpert = {
      id: order.sellerId,
      name: order.seller.displayName || "",
      verified: true,
      founding: false,
      isFoundingExpert: order.seller.isFoundingExpert,
      completed_sales_count: order.seller.completedSalesCount,
      commission_override_percent: order.seller.commissionOverridePercent != null
        ? Number(order.seller.commissionOverridePercent)
        : undefined,
      tier: order.seller.tier,
      tools: [],
    };

    let feePercent = getCommissionPercent(expertForCommission);

    // Referral discount check — apply 5% fee reduction but never below 6% floor
    // The 6% floor protects platform margin when buyer-side discounts also apply
    const MIN_COMMISSION_PERCENT = 6;
    let expertDiscountApplied = false;
    let expertRewards: import("@/types").ReferralRewards = {};
    const sellerUser = await prisma.user.findUnique({
      where: { id: order.seller.userId },
      select: { referralRewards: true },
    });
    expertRewards = (sellerUser?.referralRewards as unknown as Record<string, number>) || {};
    const expertDiscountCount = expertRewards.expertDiscountCount || 0;
    if (expertDiscountCount > 0) {
      feePercent = Math.max(MIN_COMMISSION_PERCENT, feePercent - 5);
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

    // Verify the expert's Stripe account can actually receive transfers
    if (!order.seller.stripeChargesEnabled) {
      milestones[idx] = { ...milestone, status: "in_escrow" };
      await prisma.order.update({ where: { id: orderId }, data: { milestones: milestones as unknown as Prisma.InputJsonValue } });
      log.warn("milestone.seller_charges_disabled", { orderId, sellerId: order.sellerId });
      return NextResponse.json({ error: "Expert's Stripe account cannot receive payments. They have been notified to resolve this." }, { status: 400 });
    }

    // ─── STEP 3: Execute Stripe transfer ──────────────────────────────────────
    // This is outside the DB transaction because Stripe is an external call.
    // If it fails, we revert the milestone to "in_escrow" so it can be retried.
    // The idempotency key uses fundedAt so that after a failure-and-revert cycle,
    // a fresh attempt gets a new key. The Serializable DB transaction (Step 1)
    // is the primary guard against double-payments; the key is defense-in-depth.
    const fundedAt = milestone.fundedAt || "0";
    try {
      await stripe.transfers.create({
        amount: transferAmount,
        currency: "eur",
        destination: order.seller.stripeAccountId,
        description: `Release for ${order.id} - ${milestone.title}`,
        transfer_group: `order_${order.id}`,
      }, {
        idempotencyKey: `release-${orderId}-${idx}-${fundedAt}`,
      });
    } catch (stripeErr) {
      const stripeMessage = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
      log.error("milestone.stripe_transfer_failed", { orderId, milestoneIdx: idx, error: stripeMessage });
      // Revert so the buyer can try again
      milestones[idx] = { ...milestone, status: "in_escrow" };
      await prisma.order.update({ where: { id: orderId }, data: { milestones: milestones as unknown as Prisma.InputJsonValue } });
      const detail = process.env.NODE_ENV !== "production" ? ` (${stripeMessage})` : "";
      return NextResponse.json({ error: `Payment transfer failed.${detail}`, useSimulate: process.env.NODE_ENV !== "production" }, { status: 502 });
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

      // Update milestones and order status
      // Last milestone → "approved" (project fully complete)
      // Non-last milestone → "in_progress" (more milestones to work on)
      await tx.order.update({
        where: { id: orderId },
        data: {
          milestones: milestones as unknown as Prisma.InputJsonValue,
          status: isLastMilestone ? "approved" : "in_progress",
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

        // Auto-tier caps at PROVEN — Elite requires application + admin approval
        let newTier: "STANDARD" | "PROVEN" | null = null;
        if (newCount >= SALES_THRESHOLDS.PROVEN && oldTier === "STANDARD") {
          newTier = "PROVEN";
        }

        if (newTier) {
          const newFeePercent = isFoundingExpert
            ? TIER_THRESHOLDS.FOUNDING
            : TIER_THRESHOLDS.PROVEN;

          await tx.specialistProfile.update({
            where: { id: order.sellerId },
            data: { tier: newTier, platformFeePercentage: newFeePercent },
          });
        }
      }
    });

    // ── Create order_card message in conversation ──────────────────────────────
    try {
      const orderForCard = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          solution: { select: { title: true } },
          conversations: { select: { id: true }, take: 1 },
        },
      });
      const convId = orderForCard?.conversations[0]?.id;
      if (convId) {
        await prisma.message.create({
          data: {
            conversationId: convId,
            senderId: session.user.id,
            type: "order_card",
            body: JSON.stringify({
              type: "milestone_released",
              milestoneTitle: milestone.title,
              milestoneIndex: idx,
              priceCents: amountCents,
              projectTitle: orderForCard?.solution?.title || "Project",
              orderId,
              expertName: order.seller.displayName || "Expert",
            }),
          },
        });
      }
    } catch (cardErr) {
      log.error("milestone.order_card_failed", { orderId, error: String(cardErr) });
    }

    // ─── STEP 5: Notifications — notify BOTH parties (non-critical) ────────────
    const discountNote = expertDiscountApplied
      ? ` (referral discount applied: ${feePercent + 5}% → ${feePercent}% fee)` : "";

    // Expert: milestone payment received
    await createNotification(
      order.seller.userId,
      "💸 Milestone Released",
      `Milestone "${milestone.title}" approved! ${formatCentsToCurrency(transferAmount)} transferred to your Stripe account.${discountNote}`,
      "success",
      `/expert/projects/${orderId}`
    );

    // Buyer: confirmation of release
    if (isLastMilestone) {
      await createNotification(
        order.buyerId,
        "🏁 Project complete — leave a review",
        `All milestones on "${milestone.title}" have been released. Share your experience working with this expert!`,
        "success",
        `/business/projects`
      );
    } else {
      await createNotification(
        order.buyerId,
        "💸 Milestone released",
        `Funds for "${milestone.title}" have been released to the expert. The next milestone is ready to fund.`,
        "success",
        `/business/projects`
      );
    }

    // Tier-up notification (after transaction, so we know the new tier)
    if (isLastMilestone) {
      const refreshed = await prisma.specialistProfile.findUnique({ where: { id: order.sellerId } });
      if (refreshed && refreshed.tier !== order.seller.tier) {
        const feeMessage = refreshed.isFoundingExpert
          ? `Your Founding Expert rate of ${TIER_THRESHOLDS.FOUNDING}% still applies. You now have access to Discovery Scans and Custom Projects in the Find Work feed.`
          : `Your commission rate has dropped to ${refreshed.platformFeePercentage}%. You now have access to Discovery Scans and Custom Projects in the Find Work feed.`;
        await createNotification(
          order.seller.userId,
          "🎉 You've reached Proven tier!",
          feeMessage,
          "success",
          "/jobs"
        );
      }

      // Notify when expert hits Elite threshold — prompt them to apply
      if (refreshed && refreshed.completedSalesCount >= SALES_THRESHOLDS.ELITE && refreshed.tier === "PROVEN") {
        await createNotification(
          order.seller.userId,
          "🏆 You're eligible for Elite!",
          `You've completed ${refreshed.completedSalesCount} sales. You can now apply for Elite tier to unlock the lowest commission rate (${TIER_THRESHOLDS.ELITE}%) and priority placement.`,
          "info",
          "/dashboard"
        );
      }

      // Prompt seller to leave a review (after tier notification)
      await createNotification(
        order.seller.userId,
        "🏁 Project complete — leave a review",
        "All milestones delivered! Share your experience working with this client.",
        "info",
        `/expert/reviews/${orderId}`
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    log.error("milestone.release_failed", { error: String(error) });
    captureException(error, { context: "release-milestone" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
