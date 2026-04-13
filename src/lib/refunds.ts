import type { JobPost } from "@prisma/client";
import { stripe } from "@/lib/stripe";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export type JobRefundResult = {
  refunded: boolean;
  amountPercent: number;
  reason: string;
};

/**
 * Refund a JobPost's original payment by a percentage (0–100).
 * Discovery scans: never refunded — call sites should skip this for them.
 * Custom projects: 50% if buyer chose no proposal, 0% if a bid was accepted.
 */
export async function refundJobPost(
  job: Pick<JobPost, "id" | "paymentIntentId" | "paymentProvider">,
  amountPercent: number
): Promise<JobRefundResult> {
  if (amountPercent <= 0) {
    return { refunded: false, amountPercent: 0, reason: "zero_percent" };
  }

  if (!job.paymentIntentId || job.paymentProvider === "free_waitlist_credit") {
    return { refunded: false, amountPercent, reason: "no_charge_to_refund" };
  }

  try {
    const pi = await stripe.paymentIntents.retrieve(job.paymentIntentId);
    const chargedAmount = pi.amount_received ?? pi.amount ?? 0;
    if (chargedAmount <= 0) {
      return { refunded: false, amountPercent, reason: "no_amount_on_intent" };
    }

    const refundAmount = Math.floor((chargedAmount * amountPercent) / 100);
    if (refundAmount <= 0) {
      return { refunded: false, amountPercent, reason: "rounded_to_zero" };
    }

    await stripe.refunds.create({
      payment_intent: job.paymentIntentId,
      amount: refundAmount,
    });

    log.info("refund.job_post_refunded", {
      jobId: job.id,
      amountPercent,
      refundAmount,
    });
    return { refunded: true, amountPercent, reason: "ok" };
  } catch (err) {
    log.error("refund.job_post_failed", {
      jobId: job.id,
      err: String(err),
    });
    Sentry.captureException(err);
    return { refunded: false, amountPercent, reason: "stripe_error" };
  }
}
