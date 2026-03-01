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
import { APP_URL } from "@/lib/app-url";

export async function POST(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
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

  return NextResponse.json({ redirectUrl: `${APP_URL}/jobs/${jobId}?paid=true` });
}
