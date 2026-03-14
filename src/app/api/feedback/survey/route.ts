/**
 * POST /api/feedback/survey
 *
 * Submit survey answers. First-time completion grants 5% coupon (FEEDBACKS).
 * Creates in-app notification with the coupon code.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { SURVEY_QUESTIONS } from "@/lib/survey-questions";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

const SURVEY_COUPON_CODE = "FEEDBACKS";
const requiredQuestionIds = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"];

function validateAnswers(answers: Record<string, unknown>): { valid: boolean; error?: string } {
  for (const id of requiredQuestionIds) {
    const val = answers[id];
    if (val === undefined || val === null || val === "") {
      return { valid: false, error: `Answer required for question ${id}` };
    }
  }
  for (const q of SURVEY_QUESTIONS) {
    const val = answers[q.id];
    if (q.type === "scale" && (typeof val !== "number" || val < q.min || val > q.max)) {
      return { valid: false, error: `Invalid value for ${q.id}` };
    }
    if (q.type === "nps" && (typeof val !== "number" || val < 0 || val > 10)) {
      return { valid: false, error: `Invalid NPS value for ${q.id}` };
    }
  }
  return { valid: true };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await req.json();
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const validation = validateAnswers(raw as Record<string, unknown>);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const role = session.user.role || "USER";
    const validRole = role === "EXPERT" || role === "BUSINESS" ? role : "BUSINESS";

    const existing = await prisma.surveyCompletion.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      // Allow re-submission for analytics, but don't grant coupon again
      await prisma.surveyCompletion.update({
        where: { userId: session.user.id },
        data: { answers: raw as object, role: validRole },
      });
      return NextResponse.json({
        success: true,
        firstTime: false,
        message: "Thank you for your feedback!",
      });
    }

    // First-time completion: save and create coupon notification
    await prisma.surveyCompletion.create({
      data: {
        userId: session.user.id,
        answers: raw as object,
        role: validRole,
      },
    });

    await createNotification(
      session.user.id,
      `🎁 Thank you — 5% off your next purchase`,
      `Thanks for completing our survey! Use coupon code ${SURVEY_COUPON_CODE} at checkout for 5% off your next purchase. Valid for first-time orders.`,
      "success",
      "/dashboard/feedback"
    );

    return NextResponse.json({
      success: true,
      firstTime: true,
      couponCode: SURVEY_COUPON_CODE,
      message: "Thank you! Check your notifications for your 5% coupon code.",
    });
  } catch (error) {
    log.error("feedback.survey_submit_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to submit survey" }, { status: 500 });
  }
}
