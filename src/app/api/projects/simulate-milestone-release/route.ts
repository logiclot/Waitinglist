/**
 * POST /api/projects/simulate-milestone-release
 *
 * Dev-only: releases a milestone WITHOUT executing a real Stripe transfer.
 * Mirrors the production release-milestone behaviour (commission calc, tier
 * upgrades, notifications, order_card, review record) but skips the actual
 * stripe.transfers.create() call. This lets developers test the full
 * order lifecycle when the expert's Stripe Connect account isn't a real
 * test account.
 *
 * Blocked in production — the real endpoint must be used there.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { SALES_THRESHOLDS, TIER_THRESHOLDS, formatCentsToCurrency, getCommissionPercent } from "@/lib/commission";
import type { CommissionExpert } from "@/lib/commission";
import { log } from "@/lib/logger";
import { ReleaseMilestoneSchema } from "@/lib/schemas/api";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  // ── Block in production ─────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Simulate endpoints are disabled in production" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await req.json();
    const parsed = ReleaseMilestoneSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { orderId, milestoneIndex } = parsed.data;
    const idx = milestoneIndex;

    // ─── STEP 1: Atomically claim the milestone ──────────────────────────────
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
      throw txErr;
    }

    if (!claimedOrder || !claimedMilestone) {
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    const order = claimedOrder as ClaimedOrder;
    const milestones = claimedMilestones as import("@/types").Milestone[];
    const milestone = claimedMilestone as import("@/types").Milestone;

    // ─── STEP 2: Calculate payout (same as production) ───────────────────────
    const amountCents = typeof milestone.priceCents === "number"
      ? milestone.priceCents
      : Math.round((milestone.price ?? 0) * 100);

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
      tools: [],
    };

    let feePercent = getCommissionPercent(expertForCommission);

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

    // ─── STEP 3: SKIP Stripe transfer (simulated) ───────────────────────────
    log.info("milestone.simulate_release", {
      orderId,
      milestoneIdx: idx,
      transferAmount,
      platformFee,
      note: "Stripe transfer skipped in dev mode",
    });

    // ─── STEP 4: Finalise DB in a single transaction ─────────────────────────
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

    // ── Create order_card message in conversation ────────────────────────────
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

    // ─── STEP 5: Notifications — notify BOTH parties (non-critical) ──────────
    const discountNote = expertDiscountApplied
      ? ` (referral discount applied: ${feePercent + 5}% → ${feePercent}% fee)` : "";

    // Expert: milestone payment received
    await createNotification(
      order.seller.userId,
      "💸 Milestone Released",
      `Milestone "${milestone.title}" approved! ${formatCentsToCurrency(transferAmount)} transferred (simulated).${discountNote}`,
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

    // Tier-up notification
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
          isElite ? "/jobs" : "/expert/projects"
        );
      }

      // Prompt seller to leave a review
      await createNotification(
        order.seller.userId,
        "🏁 Project complete — leave a review",
        "All milestones delivered! Share your experience working with this client.",
        "info",
        `/expert/reviews/${orderId}`
      );
    }

    return NextResponse.json({ success: true, simulated: true });

  } catch (error) {
    log.error("milestone.simulate_release_failed", { error: String(error) });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
