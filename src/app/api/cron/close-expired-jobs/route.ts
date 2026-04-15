import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification, wasRecentlyNotified } from "@/lib/notifications";
import { refundJobPost } from "@/lib/refunds";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

// Vercel Cron: runs daily — see vercel.json
// Closes job postings 7 days after createdAt. At day 3 (midway), notifies
// non-standard experts who have not yet bid that the posting is about to expire.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    closed: 0,
    refunded: 0,
    midwayJobs: 0,
    midwayNotifications: 0,
  };

  try {
    const now = Date.now();
    const d3 = new Date(now - 3 * 24 * 60 * 60 * 1000);
    const d4 = new Date(now - 4 * 24 * 60 * 60 * 1000);
    const d7 = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // ─────────────────────────────────────────────
    // DAY-3 MIDWAY NOTIFICATION
    // Jobs created between 4 and 3 days ago, still open.
    // Notify approved non-standard experts who have NOT submitted a bid yet.
    // ─────────────────────────────────────────────
    const midwayJobs = await prisma.jobPost.findMany({
      where: {
        status: "open",
        createdAt: { lte: d3, gt: d4 },
      },
      select: { id: true, title: true, category: true },
    });

    if (midwayJobs.length > 0) {
      const experts = await prisma.specialistProfile.findMany({
        where: {
          status: "APPROVED",
          tier: { not: "STANDARD" },
        },
        select: {
          userId: true,
          bids: {
            where: { jobPostId: { in: midwayJobs.map((j) => j.id) } },
            select: { jobPostId: true },
          },
        },
      });

      for (const job of midwayJobs) {
        results.midwayJobs++;
        const isDiscovery = job.category === "Discovery Scan";
        const title = `⏳ Posting closing soon — ${job.title}`;

        for (const expert of experts) {
          const hasBid = expert.bids.some((b) => b.jobPostId === job.id);
          if (hasBid) continue;

          const already = await wasRecentlyNotified(expert.userId, title);
          if (already) continue;

          await createNotification(
            expert.userId,
            title,
            `This ${isDiscovery ? "Discovery Scan" : "Custom Project"} closes in about 4 days. If it's a fit, submit your proposal before it expires.`,
            "info",
            `/jobs/${job.id}`,
            false
          );
          results.midwayNotifications++;
        }
      }
    }

    // ─────────────────────────────────────────────
    // DAY-7 CLOSE + REFUND
    // Jobs still open 7+ days after createdAt are closed.
    // (bids). If any expert submitted a proposal, the buyer got what they paid
    // for and no refund applies. Free-credit postings are never refunded.
    // Discovery scans: never refunded.
    // ─────────────────────────────────────────────
    const expiredJobs = await prisma.jobPost.findMany({
      where: {
        status: "open",
        createdAt: { lte: d7 },
      },
      include: {
        _count: { select: { bids: true } },
      },
    });

    for (const job of expiredJobs) {
      try {
        const isDiscovery = job.category === "Discovery Scan";
        const isFreeCredit = job.paymentProvider === "free_credit";
        const refundPercent =
          isDiscovery || isFreeCredit ? 0 : 50;

        const refund =
          refundPercent > 0
            ? await refundJobPost(job, refundPercent)
            : { refunded: false, amountPercent: 0, reason: "not_eligible" };

        await prisma.jobPost.update({
          where: { id: job.id },
          data: { status: "closed" },
        });

        results.closed++;
        if (refund.refunded) results.refunded++;

        const buyerTitle = isDiscovery
          ? "⌛ Your Discovery Scan has expired"
          : isFreeCredit
            ? "⌛ Your Custom Project has expired"
            : "⌛ Your Custom Project expired — 50% refunded";

        const buyerMsg = isDiscovery
          ? `"${job.title}" ran for 7 days without being awarded and has been closed. Discovery Scans are non-refundable.`
          : isFreeCredit
            ? `"${job.title}" ran for 7 days without a selected proposal and has been closed.`
            : `"${job.title}" ran for 7 days without a selected proposal and has been closed. A 50% refund has been issued to your original payment method.`;

        await createNotification(
          job.buyerId,
          buyerTitle,
          buyerMsg,
          "alert",
          `/jobs/${job.id}`
        );

        log.info("cron.close_expired_job", {
          jobId: job.id,
          isDiscovery,
          isFreeCredit,
          bidCount: job._count.bids,
          refundPercent,
          refundReason: refund.reason,
        });
      } catch (jobErr) {
        log.error("cron.close_expired_job_failed", {
          jobId: job.id,
          err: String(jobErr),
        });
        Sentry.captureException(jobErr);
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    log.error("cron.close_expired_jobs_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
