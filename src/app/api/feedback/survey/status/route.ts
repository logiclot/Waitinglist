/**
 * GET /api/feedback/survey/status
 *
 * Check if the current user has completed the survey.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const completion = await prisma.surveyCompletion.findUnique({
      where: { userId: session.user.id },
    });
    return NextResponse.json({
      completed: !!completion,
      completedAt: completion?.createdAt ?? null,
    });
  } catch (error) {
    log.error("feedback.survey_status_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
