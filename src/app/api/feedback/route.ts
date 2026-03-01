/**
 * POST /api/feedback
 *
 * Submit free-text feedback. Limited to 3 per user per day.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

const FEEDBACK_LIMIT_PER_DAY = 3;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text } = await req.json();
    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Feedback text is required" }, { status: 400 });
    }
    if (text.length > 10000) {
      return NextResponse.json({ error: "Feedback text is too long" }, { status: 400 });
    }

    const role = session.user.role || "USER";
    const validRole = role === "EXPERT" || role === "BUSINESS" ? role : "BUSINESS";

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await prisma.feedback.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: since },
      },
    });

    if (count >= FEEDBACK_LIMIT_PER_DAY) {
      return NextResponse.json(
        { error: `You can submit up to ${FEEDBACK_LIMIT_PER_DAY} feedback submissions per day. Please try again tomorrow.` },
        { status: 429 }
      );
    }

    await prisma.feedback.create({
      data: {
        userId: session.user.id,
        text: text.trim(),
        role: validRole,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error("feedback.submit_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
