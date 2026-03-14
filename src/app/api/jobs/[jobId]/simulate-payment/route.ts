/**
 * POST /api/jobs/[jobId]/simulate-payment
 *
 * Dev-only: when Stripe is not configured, activates the job without payment.
 * Used by CheckoutModal when useSimulate is returned from post-job checkout.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markJobAsPaid } from "@/actions/jobs";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { APP_URL } from "@/lib/app-url";

export async function POST(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  // Block in production or when Stripe is configured — simulation is dev-only
  if (process.env.NODE_ENV === "production" || process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.json({ error: "Simulate only when Stripe not configured" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobId = params.jobId;
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const result = await markJobAsPaid(jobId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Create invoice notification (mirrors webhook behaviour)
  try {
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      select: { title: true },
    });
    if (job) {
      await createNotification(
        session.user.id,
        "🧾 Invoice available",
        `Your invoice for the "${job.title}" posting fee is ready. View and download it anytime.`,
        "info",
        `/invoice/job/${jobId}`
      );
    }
  } catch {
    // Non-critical — don't fail the simulate response
  }

  return NextResponse.json({ redirectUrl: `${APP_URL}/jobs/${jobId}?paid=true` });
}
