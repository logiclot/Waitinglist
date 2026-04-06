/**
 * Launch countdown email sequence for waitlist users.
 *
 * Sends role-aware emails at:
 *   14 days before launch (March 25)
 *   7 days before launch  (April 1)
 *   2 days before launch  (April 6)
 *   Launch day             (April 8)
 *
 * Launch date: April 8, 2026
 *
 * Triggered by Vercel Cron daily at 09:00 UTC (see vercel.json).
 * Protected by CRON_SECRET header.
 *
 * Deduplication: checks a simple `launchEmailsSent` JSON field or
 * uses the WaitlistSignup table to track which emails have been sent
 * via a lightweight tracking table approach using Notification-style tags.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, getFromEmail } from "@/lib/resend";
import { launchSequenceEmail, LAUNCH_SEQUENCE } from "@/lib/email-templates";
import { log } from "@/lib/logger";
import { randomUUID } from 'node:crypto';

export const dynamic = "force-dynamic";

const FROM_EMAIL = getFromEmail();

// Launch date: April 8, 2026 at 00:00 UTC
const LAUNCH_DATE = new Date("2026-04-08T00:00:00Z");

type LaunchDay = "d14" | "d7" | "d2" | "launch";

interface ScheduleEntry {
  day: LaunchDay;
  daysBeforeLaunch: number;
  tag: string;
}

const SCHEDULE: ScheduleEntry[] = [
  { day: "d14", daysBeforeLaunch: 14, tag: "[LAUNCH:D14]" },
  { day: "d7", daysBeforeLaunch: 7, tag: "[LAUNCH:D7]" },
  { day: "d2", daysBeforeLaunch: 2, tag: "[LAUNCH:D2]" },
  { day: "launch", daysBeforeLaunch: 0, tag: "[LAUNCH:DAY]" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * We track sent emails using a simple table.
 * Since waitlist users don't have a userId, we use a lightweight approach:
 * store sent tags in a dedicated tracking mechanism.
 *
 * We'll use a key-value approach with Prisma raw queries on a simple
 * check: query the WaitlistSignup + a metadata approach.
 *
 * For simplicity and reliability, we'll use an in-memory Set per run
 * and check a "launch_emails_log" table. Since we don't have one,
 * we'll create a simple dedup using the source field creatively,
 * or better yet, just query if we already sent by checking a
 * lightweight log table.
 *
 * Simplest approach: use a JSON file or env-based tracking.
 * Most robust approach: add a LaunchEmailLog model.
 *
 * PRACTICAL approach: use the existing Notification table with a
 * synthetic "system" userId for waitlist-only users, OR simply
 * track via the WaitlistSignup.source field by appending sent tags.
 *
 * CHOSEN approach: Use a simple "launch_email_log" collection via
 * prisma.$queryRaw to check if email+tag combo exists. We'll create
 * a lightweight tracking by updating the WaitlistSignup.source field
 * to include sent tags (e.g., "landing_waitlist|D14|D7").
 */

async function alreadySent(signupId: string, tag: string): Promise<boolean> {
  const signup = await prisma.waitlistSignup.findUnique({
    where: { id: signupId },
    select: { source: true },
  });
  return signup?.source?.includes(tag) ?? false;
}

async function markSent(signupId: string, tag: string): Promise<void> {
  const signup = await prisma.waitlistSignup.findUnique({
    where: { id: signupId },
    select: { source: true },
  });
  const currentSource = signup?.source ?? "";
  const newSource = currentSource ? `${currentSource}|${tag}` : tag;
  await prisma.waitlistSignup.update({
    where: { id: signupId },
    data: { source: newSource },
  });
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  // Verify the cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const daysUntilLaunch = Math.ceil(
    (LAUNCH_DATE.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
  );

  // Determine which email to send today (if any)
  const todayEntry = SCHEDULE.find((s) => s.daysBeforeLaunch === daysUntilLaunch);

  if (!todayEntry) {
    log.info("cron.launch_sequence_skip", {
      daysUntilLaunch,
      message: "No launch email scheduled for today",
    });
    return NextResponse.json({
      ok: true,
      daysUntilLaunch,
      message: "No launch email scheduled for today",
      sent: 0,
    });
  }

  // Fetch all waitlist signups that haven't been used (account not claimed)
  // We send to everyone on the waitlist, whether they've claimed or not
  const signups = await prisma.waitlistSignup.findMany({
    where: {
      consent: true,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      source: true,
    },
  });

  let sentCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const signup of signups) {
    // Check dedup
    if (await alreadySent(signup.id, todayEntry.tag)) {
      skippedCount++;
      continue;
    }

    const firstName = signup.fullName.split(" ")[0] || "there";
    const role = (signup.role === "expert" ? "expert" : "business") as "business" | "expert";
    const content = LAUNCH_SEQUENCE[role][todayEntry.day];

    try {
      if (FROM_EMAIL) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: signup.email,
          subject: content.subject,
          html: launchSequenceEmail({ firstName, role, day: todayEntry.day }),
          headers: {
            'X-Entity-Ref-ID': randomUUID(),
          }
        });
      } else {
        log.info("cron.launch_email_dev", {
          signupId: signup.id,
          email: signup.email,
          day: todayEntry.day,
          role,
        });
      }

      await markSent(signup.id, todayEntry.tag);
      sentCount++;
      log.info("cron.launch_email_sent", {
        signupId: signup.id,
        day: todayEntry.day,
        role,
      });
    } catch (e) {
      errorCount++;
      log.error("cron.launch_email_failed", {
        signupId: signup.id,
        email: signup.email,
        day: todayEntry.day,
        error: String(e),
      });
    }
  }

  log.info("cron.launch_sequence_run", {
    day: todayEntry.day,
    tag: todayEntry.tag,
    daysUntilLaunch,
    total: signups.length,
    sent: sentCount,
    skipped: skippedCount,
    errors: errorCount,
  });

  return NextResponse.json({
    ok: true,
    day: todayEntry.day,
    daysUntilLaunch,
    total: signups.length,
    sent: sentCount,
    skipped: skippedCount,
    errors: errorCount,
  });
}
