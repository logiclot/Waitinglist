import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification, wasRecentlyNotified } from "@/lib/notifications";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { stripe } from "@/lib/stripe";
import type { Milestone } from "@/types";
import type { Prisma } from "@prisma/client";

// Vercel Cron: runs twice daily (9am and 4pm UTC) — see vercel.json
// Secured via CRON_SECRET env var
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, number> = {
    autoRefunded: 0,
    proposalsWaiting: 0,
    zeroBidJobs: 0,
    deliveredOrders: 0,
    expertBidsPending: 0,
    expertNewOpportunities: 0,
    expertProfileNudge: 0,
  };

  try {
    const now = new Date();
    const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const h48 = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const h72 = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const d5 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    // ─────────────────────────────────────────────
    // AUTO-REFUND: Orders not accepted within 48h
    // ─────────────────────────────────────────────
    const staleOrders = await prisma.order.findMany({
      where: {
        status: "paid_pending_implementation",
        createdAt: { lt: h48 },
        acceptedAt: null,
      },
      include: {
        seller: { include: { user: { select: { id: true } } } },
        conversations: { select: { id: true }, take: 1 },
      },
    });

    for (const order of staleOrders) {
      try {
        const milestones = (order.milestones as unknown as Milestone[]) || [];
        const conversationId = order.conversations[0]?.id;

        // Revert funded milestones back to pending_payment
        const updatedMilestones = milestones.map((m) => ({
          ...m,
          status: m.status === "in_escrow" ? "pending_payment" : m.status,
          fundedAt: m.status === "in_escrow" ? null : m.fundedAt,
        }));

        // Issue Stripe refund for each funded milestone
        for (const m of milestones) {
          if (m.status === "in_escrow" && m.stripePaymentIntentId) {
            try {
              await stripe.refunds.create({ payment_intent: m.stripePaymentIntentId });
            } catch (refundErr) {
              log.error("cron.auto_refund_stripe_failed", {
                orderId: order.id,
                pi: m.stripePaymentIntentId,
                err: String(refundErr),
              });
            }
          }
        }

        // Fallback: refund order-level PaymentIntent if no per-milestone PI
        const hasPerMilestonePi = milestones.some((m) => m.stripePaymentIntentId);
        if (!hasPerMilestonePi && order.stripePaymentIntentId) {
          try {
            await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
          } catch (refundErr) {
            log.error("cron.auto_refund_stripe_fallback_failed", {
              orderId: order.id,
              pi: order.stripePaymentIntentId,
              err: String(refundErr),
            });
          }
        }

        const txOps: Prisma.PrismaPromise<unknown>[] = [
          prisma.order.update({
            where: { id: order.id },
            data: {
              status: "refunded",
              refundedAt: new Date(),
              milestones: updatedMilestones as unknown as Prisma.InputJsonValue,
            },
          }),
        ];

        // System message in conversation
        if (conversationId) {
          txOps.push(
            prisma.message.create({
              data: {
                conversationId,
                senderId: order.buyerId,
                type: "system",
                body: "The expert did not respond within 48 hours, so your payment has been fully refunded. We apologize for the delay. If you'd like, you can reorder or browse other solutions.",
              },
            })
          );
        }

        await prisma.$transaction(txOps);

        // Notify buyer
        await createNotification(
          order.buyerId,
          "💸 Order auto-refunded",
          "The expert did not accept your order within 48 hours. Your payment has been fully refunded.",
          "alert",
          "/business/projects"
        );

        // Notify expert
        if (order.seller?.user?.id) {
          await createNotification(
            order.seller.user.id,
            "⏰ Missed order — auto-refunded",
            "A customer order was auto-refunded because you did not accept it within 48 hours. Please check your projects regularly to avoid missing orders.",
            "alert",
            "/dashboard/projects"
          );
        }

        results.autoRefunded++;
        log.info("cron.auto_refund_completed", { orderId: order.id });
      } catch (orderErr) {
        log.error("cron.auto_refund_order_failed", {
          orderId: order.id,
          err: String(orderErr),
        });
        Sentry.captureException(orderErr);
      }
    }

    // ─────────────────────────────────────────────
    // BUSINESS NOTIFICATIONS
    // ─────────────────────────────────────────────

    // 1. Jobs with unawarded bids older than 24h — remind buyer to review
    const jobsWithPendingBids = await prisma.jobPost.findMany({
      where: {
        status: "open",
        bids: {
          some: {
            status: "submitted",
            createdAt: { lte: h24 },
          },
        },
      },
      include: {
        bids: {
          where: { status: "submitted" },
          select: { id: true },
        },
      },
    });

    for (const job of jobsWithPendingBids) {
      const bidCount = job.bids.length;
      const title = "📩 Proposals waiting for your review";
      const alreadyNotified = await wasRecentlyNotified(job.buyerId, title);
      if (alreadyNotified) continue;

      await createNotification(
        job.buyerId,
        title,
        `You have ${bidCount} expert proposal${bidCount > 1 ? "s" : ""} on "${job.title}" waiting for your review. We recommend reviewing them soon so you can move forward with the best fit.`,
        "alert",
        `/business/jobs/${job.id}`
      );
      results.proposalsWaiting++;
    }

    // 2. Jobs open for 3+ days with zero bids — reassurance + nudge
    const zeroBidJobs = await prisma.jobPost.findMany({
      where: {
        status: "open",
        paidAt: { lte: h72 },
        bids: { none: {} },
      },
    });

    for (const job of zeroBidJobs) {
      const title = "💡 Your project is live — tip to attract more proposals";
      const alreadyNotified = await wasRecentlyNotified(job.buyerId, title);
      if (alreadyNotified) continue;

      await createNotification(
        job.buyerId,
        title,
        `"${job.title}" has been live for a few days. Experts are browsing — adding more detail about your current tools or daily volume can double the response rate.`,
        "info",
        `/business/jobs/${job.id}`
      );
      results.zeroBidJobs++;
    }

    // 3. Orders marked as "delivered" awaiting buyer approval for 48h+
    const deliveredOrders = await prisma.order.findMany({
      where: {
        status: "delivered",
        updatedAt: { lte: h48 },
      },
      include: {
        seller: {
          select: { displayName: true },
        },
      },
    });

    for (const order of deliveredOrders) {
      const title = "📋 Your project is ready for final sign-off";
      const alreadyNotified = await wasRecentlyNotified(order.buyerId, title);
      if (alreadyNotified) continue;

      await createNotification(
        order.buyerId,
        title,
        `${order.seller.displayName} has marked your project as delivered and is waiting for your approval. Review the work and release payment when you're happy.`,
        "alert",
        `/business/projects`
      );
      results.deliveredOrders++;
    }

    // ─────────────────────────────────────────────
    // EXPERT NOTIFICATIONS
    // ─────────────────────────────────────────────

    // 4. Expert bids pending decision for 3+ days — prompt to follow up
    const staleBids = await prisma.bid.findMany({
      where: {
        status: "submitted",
        createdAt: { lte: h72 },
      },
      include: {
        specialist: { select: { userId: true, displayName: true } },
        jobPost: { select: { title: true, id: true } },
      },
    });

    for (const bid of staleBids) {
      const userId = bid.specialist.userId;
      const title = "⏳ Your proposal is still under review";
      const alreadyNotified = await wasRecentlyNotified(userId, title);
      if (alreadyNotified) continue;

      await createNotification(
        userId,
        title,
        `Your bid on "${bid.jobPost.title}" has been with the client for over 3 days. A short follow-up message often makes the difference — clients appreciate the initiative.`,
        "info",
        `/inbox`
      );
      results.expertBidsPending++;
    }

    // 5. Experts with no profile solutions — nudge to publish
    const expertsWithNoSolutions = await prisma.specialistProfile.findMany({
      where: {
        status: "APPROVED",
        solutions: { none: {} },
        // Only nudge once per 5 days
        user: {
          notifications: {
            none: {
              title: "🚀 Add a solution to get discovered",
              createdAt: { gte: d5 },
            },
          },
        },
      },
      select: { userId: true },
    });

    for (const expert of expertsWithNoSolutions) {
      await createNotification(
        expert.userId,
        "🚀 Add a solution to get discovered",
        "Experts with at least one published solution receive 3x more profile views. It takes less than 10 minutes and puts you in front of buyers browsing the Solution Library right now.",
        "info",
        `/expert/solutions/new`
      );
      results.expertProfileNudge++;
    }

    // 6. Experts — new jobs posted in last 24h that they haven't bid on yet
    const newJobs = await prisma.jobPost.findMany({
      where: {
        status: "open",
        paidAt: { gte: h24 },
      },
      select: { id: true, title: true, category: true },
    });

    if (newJobs.length > 0) {
      const approvedExperts = await prisma.specialistProfile.findMany({
        where: {
          status: "APPROVED",
          tier: "ELITE",
        },
        include: {
          bids: {
            where: {
              jobPostId: { in: newJobs.map((j) => j.id) },
            },
            select: { jobPostId: true },
          },
        },
      });

      for (const expert of approvedExperts) {
        const biddedJobIds = new Set(expert.bids.map((b) => b.jobPostId));
        const unbidJobs = newJobs.filter((j) => !biddedJobIds.has(j.id));

        if (unbidJobs.length === 0) continue;

        const title = `🔔 ${unbidJobs.length} new project${unbidJobs.length > 1 ? "s" : ""} in the marketplace`;
        const alreadyNotified = await wasRecentlyNotified(expert.userId, title);
        if (alreadyNotified) continue;

        const jobTitles = unbidJobs
          .slice(0, 2)
          .map((j) => `"${j.title}"`)
          .join(" and ");
        const more = unbidJobs.length > 2 ? ` and ${unbidJobs.length - 2} more` : "";

        await createNotification(
          expert.userId,
          title,
          `New client projects are live: ${jobTitles}${more}. Review the details and submit a proposal if it's a good fit.`,
          "info",
          `/jobs`
        );
        results.expertNewOpportunities++;
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    log.error("cron.daily_digest_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
