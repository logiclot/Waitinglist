/**
 * POST /api/checkout/post-job
 *
 * Creates a Stripe Checkout Session for job posting fees.
 *   - Discovery Scan:  configurable via NEXT_PUBLIC_DISCOVERY_SCAN_PRICE_CENTS (default: 5000 = €50)
 *   - Custom Project:  configurable via NEXT_PUBLIC_CUSTOM_PROJECT_PRICE_CENTS  (default: 10000 = €100)
 *
 * Body: { jobId: string }
 * Returns: { url: string }  (Stripe hosted checkout URL)
 *
 * On successful payment Stripe fires the webhook → activates the job.
 */

import { APP_URL } from "@/lib/app-url";
import { authOptions } from "@/lib/auth";
import { log } from "@/lib/logger";
import { CUSTOM_PROJECT_PRICE_CENTS, DISCOVERY_SCAN_PRICE_CENTS } from "@/lib/pricing-config";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const JOB_PRICES: Record<string, { cents: number; label: string }> = {
  "Discovery Scan": { cents: DISCOVERY_SCAN_PRICE_CENTS, label: "Discovery Scan — Expert Proposals" },
  "Custom Project": { cents: CUSTOM_PROJECT_PRICE_CENTS, label: "Custom Project — Expert Proposals" },
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BUSINESS") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY?.trim();

  try {
    const { jobId } = await req.json();
    if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      include: { buyer: { include: { businessProfile: true } } },
    });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.buyerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (job.status !== "pending_payment") {
      return NextResponse.json({ error: "Job already paid" }, { status: 400 });
    }

    // Dev bypass: when Stripe is not configured, return simulate instructions
    if (!stripeConfigured) {
      return NextResponse.json({
        useSimulate: true,
        jobId,
        message: "Stripe not configured — use Simulate in development.",
      });
    }

    const pricing = JOB_PRICES[job.category];
    if (!pricing) {
      return NextResponse.json({ error: `Unknown category: ${job.category}` }, { status: 400 });
    }

    // Ensure Stripe customer exists for the buyer
    let stripeCustomerId = job.buyer.businessProfile?.stripeCustomerId ?? null;

    if (stripeCustomerId) {
      try {
        const existing = await stripe.customers.retrieve(stripeCustomerId);
        if ((existing as { deleted?: boolean }).deleted) stripeCustomerId = null;
      } catch {
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      const profile = job.buyer.businessProfile;
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: profile ? `${profile.firstName} ${profile.lastName}` : session.user.name || undefined,
        metadata: { userId: session.user.id },
      });
      stripeCustomerId = customer.id;

      if (profile) {
        await prisma.businessProfile.update({
          where: { userId: session.user.id },
          data: { stripeCustomerId },
        });
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: pricing.label,
              description: job.title,
            },
            unit_amount: pricing.cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${APP_URL}/jobs/${jobId}?paid=true`,
      cancel_url: `${APP_URL}/jobs/${jobId}?canceled=true`,
      metadata: {
        type: "job_posting",
        jobId,
        buyerId: session.user.id,
        category: job.category
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    log.error("checkout.post_job_failed", { error: String(error) });
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
