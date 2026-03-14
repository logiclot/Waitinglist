/**
 * Onboarding & post-delivery email sequence cron job.
 *
 * Sends automated follow-ups at various lifecycle stages:
 *   Day 3  — Re-engagement / first action nudge (after onboarding)
 *   Day 7  — Stronger CTA / momentum builder (after onboarding)
 *   Day 3  — Post-approval nurture (after order approved)
 *   Day 30 — Re-engagement (after inactivity)
 *
 * Triggered by Vercel Cron (see vercel.json) once per day at 10:00 UTC.
 * Protected by a CRON_SECRET header — set this in your Vercel env vars.
 *
 * Deduplication: uses the Notification table as a log.
 * If a notification titled "[SEQ:D3]", "[SEQ:D7]", "[SEQ:POST_APPROVE:{orderId}]",
 * or "[SEQ:REENGAGE]" already exists for a user, that step is skipped.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { sequenceEmail, postApprovalEmail, reEngagementEmail } from "@/lib/email-templates";
import type { NurtureRecommendation } from "@/lib/email-templates";
import { log } from "@/lib/logger";
import { fireWelcomeCoupon } from "@/lib/onboarding-notifications";
import { APP_URL } from "@/lib/app-url";
import { getPersonalizedRecommendations } from "@/lib/recommendation-engine";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

export const dynamic = "force-dynamic";

// ── Email content per role and day ────────────────────────────────────────────

type Role = "BUSINESS" | "EXPERT";

const SEQUENCE: Record<Role, { d3: SequenceStep; d7: SequenceStep }> = {
  BUSINESS: {
    d3: {
      subject: "Found what you're looking for?",
      headline: "Still looking for the right automation?",
      body: `Most businesses start small — one process, one hour saved per day.<br/><br/>
Here are the three most popular starting points right now:<br/>
→ A CRM that updates itself when leads come in<br/>
→ Invoices that send automatically after project milestones<br/>
→ A lead pipeline that runs while you sleep<br/><br/>
Any of these sound familiar?`,
      ctaLabel: "Browse ready-to-deploy solutions",
      ctaUrl: `${APP_URL}/solutions`,
    },
    d7: {
      subject: "8 hours back per week — here's how",
      headline: "One automation. One hour to set up. Eight hours back every week.",
      body: `The businesses seeing the best results on LogicLot all started with the same thing: a <strong>Discovery Scan</strong>.<br/><br/>
For a flat fee, an expert maps exactly what's slowing you down and delivers a clear automation roadmap — no jargon, no vague proposals.<br/><br/>
<strong>No ongoing commitment. No agency retainer.</strong> Just clarity on what to build first.`,
      ctaLabel: "Book a Discovery Scan",
      ctaUrl: `${APP_URL}/solutions?category=discovery`,
      footnote: "Most Discovery Scans are completed within 3 business days.",
    },
  },
  EXPERT: {
    d3: {
      subject: "One solution listing changes everything",
      headline: "Your profile is live — but businesses can't find you yet.",
      body: `Without at least one published solution, you don't appear in any category search or expert listing.<br/><br/>
It takes about 20 minutes to set up. Here's what happens after:<br/>
→ You appear in relevant category searches<br/>
→ Businesses can book a discovery call directly<br/>
→ You get matched with custom project requests<br/><br/>
The first solution is always the hardest. After that, it's 10 minutes per listing.`,
      ctaLabel: "Create my first solution",
      ctaUrl: `${APP_URL}/expert/add-solution`,
    },
    d7: {
      subject: "Experts with 3+ solutions get 10× more inquiries",
      headline: "You're one solution away from real momentum.",
      body: `Data from our platform is clear: experts with three or more solutions listed receive <strong>ten times more inbound requests</strong> than those with one.<br/><br/>
Each new solution you add:<br/>
→ Covers a new category search<br/>
→ Gives businesses more reasons to reach out<br/>
→ Builds your credibility with proof and case studies<br/><br/>
The second listing always converts better than the first — because visitors see depth.`,
      ctaLabel: "Add another solution",
      ctaUrl: `${APP_URL}/expert/add-solution`,
      footnote: "Your existing solution is already live. This is just about adding more reach.",
    },
  },
};

interface SequenceStep {
  subject: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footnote?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function alreadySent(userId: string, tag: string): Promise<boolean> {
  const existing = await prisma.notification.findFirst({
    where: { userId, title: tag },
    select: { id: true },
  });
  return !!existing;
}

/** Check if tag was sent within the last N days (for re-engagement dedup). */
async function alreadySentWithin(userId: string, tag: string, withinDays: number): Promise<boolean> {
  const since = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000);
  const existing = await prisma.notification.findFirst({
    where: { userId, title: tag, createdAt: { gte: since } },
    select: { id: true },
  });
  return !!existing;
}

async function markSent(userId: string, tag: string): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      title: tag,
      message: "Automated sequence email sent.",
      type: "info",
      isRead: true, // Internal tracking record — don't show in notification dropdown
    },
  });
}

async function sendStep(
  userId: string,
  email: string,
  firstName: string,
  role: Role,
  day: "d3" | "d7"
): Promise<void> {
  const tag = `[SEQ:${day.toUpperCase()}]`;
  if (await alreadySent(userId, tag)) return; // Already sent — skip

  const step = SEQUENCE[role][day];

  try {
    if (FROM_EMAIL) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: step.subject,
        html: sequenceEmail({ firstName, ...step }),
      });
    } else {
      log.info("cron.sequence_email_dev", { userId, day, subject: step.subject });
    }
    await markSent(userId, tag);
    log.info("cron.sequence_sent", { userId, day, role });
  } catch (e) {
    log.error("cron.sequence_send_failed", { userId, day, error: String(e) });
  }
}

// ── Post-approval nurture (3 days after order approved) ──────────────────────

async function sendPostApprovalEmails(now: Date): Promise<number> {
  // Window: orders approved between 3 and 4 days ago
  const windowEnd = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const windowStart = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);

  const approvedOrders = await prisma.order.findMany({
    where: {
      status: "approved",
      approvedAt: { gte: windowStart, lte: windowEnd },
    },
    select: {
      id: true,
      buyerId: true,
      solutionId: true,
      solution: { select: { title: true } },
      buyer: {
        select: {
          email: true,
          businessProfile: { select: { firstName: true } },
        },
      },
    },
  });

  let sentCount = 0;

  for (const order of approvedOrders) {
    const tag = `[SEQ:POST_APPROVE:${order.id}]`;
    if (await alreadySent(order.buyerId, tag)) continue;

    const firstName = order.buyer?.businessProfile?.firstName ?? "there";
    const email = order.buyer?.email;
    const projectTitle = order.solution?.title ?? "your project";

    if (!email) continue;

    // Fetch personalised recommendations for this buyer
    let recs: NurtureRecommendation[] = [];
    try {
      const fullRecs = await getPersonalizedRecommendations(order.buyerId, 3);
      recs = fullRecs.map((r) => ({
        title: r.title,
        slug: r.slug,
        category: r.category,
        priceCents: r.implementationPriceCents,
      }));
    } catch {
      // Recommendations are best-effort
    }

    try {
      if (FROM_EMAIL) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `How's your automation working? — ${projectTitle}`,
          html: postApprovalEmail({ firstName, projectTitle, recommendations: recs }),
        });
      } else {
        log.info("cron.post_approval_dev", { orderId: order.id, buyerId: order.buyerId });
      }
      await markSent(order.buyerId, tag);
      sentCount++;
      log.info("cron.post_approval_sent", { orderId: order.id, buyerId: order.buyerId });
    } catch (e) {
      log.error("cron.post_approval_failed", { orderId: order.id, error: String(e) });
    }
  }

  return sentCount;
}

// ── Re-engagement (30+ days inactive) ────────────────────────────────────────

async function sendReEngagementEmails(now: Date): Promise<number> {
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Find business users who have at least one order, but whose most recent
  // order was updated more than 30 days ago.
  // We use a raw aggregation approach: find buyers whose max(order.updatedAt) < 30d ago.
  const staleBusinessUsers = await prisma.user.findMany({
    where: {
      role: "BUSINESS",
      buyerOrders: {
        some: {}, // Has at least one order
      },
    },
    select: {
      id: true,
      email: true,
      businessProfile: { select: { firstName: true } },
      buyerOrders: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { updatedAt: true },
      },
    },
  });

  let sentCount = 0;

  for (const user of staleBusinessUsers) {
    const latestOrderDate = user.buyerOrders[0]?.updatedAt;
    if (!latestOrderDate || latestOrderDate > thirtyDaysAgo) continue;

    const tag = "[SEQ:REENGAGE]";
    // Only send once per 30-day window
    if (await alreadySentWithin(user.id, tag, 30)) continue;

    const firstName = user.businessProfile?.firstName ?? "there";

    // Fetch personalised recommendations
    let recs: NurtureRecommendation[] = [];
    try {
      const fullRecs = await getPersonalizedRecommendations(user.id, 3);
      recs = fullRecs.map((r) => ({
        title: r.title,
        slug: r.slug,
        category: r.category,
        priceCents: r.implementationPriceCents,
      }));
    } catch {
      // Recommendations are best-effort
    }

    try {
      if (FROM_EMAIL) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "What else could you automate?",
          html: reEngagementEmail({ firstName, recommendations: recs }),
        });
      } else {
        log.info("cron.reengage_dev", { userId: user.id });
      }
      await markSent(user.id, tag);
      sentCount++;
      log.info("cron.reengage_sent", { userId: user.id });
    } catch (e) {
      log.error("cron.reengage_failed", { userId: user.id, error: String(e) });
    }
  }

  return sentCount;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  // Verify the cron secret (Vercel sends it automatically when CRON_SECRET is set)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find users whose onboarding completed in the relevant 24-hour window
  function windowFor(daysAgo: number) {
    const end   = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    return { gte: start, lte: end };
  }

  // Coupon: business users who onboarded 24–48 h ago get the WELCOME5 in-app nudge
  const couponUsers = await prisma.user.findMany({
    where: {
      onboardingCompletedAt: windowFor(1),
      role: "BUSINESS",
    },
    select: { id: true },
  });
  await Promise.allSettled(couponUsers.map((u) => fireWelcomeCoupon(u.id)));

  const [day3Users, day7Users] = await Promise.all([
    prisma.user.findMany({
      where: {
        onboardingCompletedAt: windowFor(3),
        role: { in: ["BUSINESS", "EXPERT"] },
      },
      select: {
        id: true,
        email: true,
        role: true,
        businessProfile: { select: { firstName: true } },
        specialistProfile: { select: { displayName: true, legalFullName: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        onboardingCompletedAt: windowFor(7),
        role: { in: ["BUSINESS", "EXPERT"] },
      },
      select: {
        id: true,
        email: true,
        role: true,
        businessProfile: { select: { firstName: true } },
        specialistProfile: { select: { displayName: true, legalFullName: true } },
      },
    }),
  ]);

  function getFirstName(user: typeof day3Users[0]): string {
    if (user.role === "BUSINESS") return user.businessProfile?.firstName ?? "there";
    return user.specialistProfile?.displayName ?? user.specialistProfile?.legalFullName ?? "there";
  }

  const tasks: Promise<void>[] = [];

  for (const user of day3Users) {
    if (user.role !== "BUSINESS" && user.role !== "EXPERT") continue;
    tasks.push(sendStep(user.id, user.email, getFirstName(user), user.role as Role, "d3"));
  }
  for (const user of day7Users) {
    if (user.role !== "BUSINESS" && user.role !== "EXPERT") continue;
    tasks.push(sendStep(user.id, user.email, getFirstName(user), user.role as Role, "d7"));
  }

  await Promise.allSettled(tasks);

  // ── Post-delivery nurture sequences ──────────────────────────────────────
  const [postApprovalCount, reEngageCount] = await Promise.all([
    sendPostApprovalEmails(now),
    sendReEngagementEmails(now),
  ]);

  log.info("cron.email_sequence_run", {
    coupon: couponUsers.length,
    day3: day3Users.length,
    day7: day7Users.length,
    onboardingTotal: tasks.length,
    postApproval: postApprovalCount,
    reEngage: reEngageCount,
  });

  return NextResponse.json({
    ok: true,
    processed: {
      coupon: couponUsers.length,
      day3: day3Users.length,
      day7: day7Users.length,
      postApproval: postApprovalCount,
      reEngage: reEngageCount,
    },
  });
}
