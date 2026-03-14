import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { markJobAsPaid } from "@/actions/jobs";
import { checkBusinessReferralCondition } from "@/actions/referral";
import { log } from "@/lib/logger";
import { captureException } from "@/lib/sentry";
import { resend } from "@/lib/resend";
import { demoBookedEmail } from "@/lib/email-templates";
import Stripe from "stripe";
import type { Prisma } from "@prisma/client";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

/**
 * Fire-and-forget helper to send the demo-booked email to the buyer.
 */
async function sendDemoBookedEmail({
  buyerId,
  expertName,
  orderId,
  calendarUrl,
}: {
  buyerId: string;
  expertName: string;
  orderId: string;
  calendarUrl?: string | null;
}) {
  if (!FROM_EMAIL) return;

  try {
    // Look up buyer details
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      select: {
        email: true,
        businessProfile: { select: { firstName: true } },
      },
    });

    if (!buyer?.email) return;

    // Look up the order to get the solution title
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { solution: { select: { title: true } } },
    });

    const firstName = buyer.businessProfile?.firstName || "there";
    const solutionTitle = order?.solution?.title || "your solution";

    await resend.emails.send({
      from: FROM_EMAIL,
      to: buyer.email,
      subject: `Your demo for "${solutionTitle}" is confirmed`,
      html: demoBookedEmail({
        firstName,
        expertName,
        solutionTitle,
        calendarUrl,
      }),
    });
  } catch (error) {
    log.error("webhook.demo_booked_email_send_failed", {
      buyerId,
      error: String(error),
    });
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature");

  if (!signature) {
    log.error("webhook.missing_signature");
    return NextResponse.json({ error: "Missing Stripe-Signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    log.error("webhook.signature_failed", { error: String(error) });
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { orderId, milestoneIndex, type, expertId, buyerId, jobId } = session.metadata || {};

    // ─── Job posting payment ───────────────────────────────────────────────────
    if (type === "job_posting" && jobId) {
      try {
        // Idempotency: only activate once
        const job = await prisma.jobPost.findUnique({ where: { id: jobId } });
        if (!job || job.status !== "pending_payment") {
          return NextResponse.json({ received: true });
        }

        // Record the Stripe payment intent ID before activating
        await prisma.jobPost.update({
          where: { id: jobId },
          data: {
            paymentProvider: "stripe",
            paymentIntentId: typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null,
          },
        });

        await markJobAsPaid(jobId);

        // Confirm to buyer + invoice notification
        if (buyerId) {
          await createNotification(
            buyerId,
            "🚀 Your post is live!",
            `"${job.title}" is now visible to experts. Expect proposals within 24 hours.`,
            "success",
            `/jobs/${jobId}`
          );
          await createNotification(
            buyerId,
            "🧾 Invoice available",
            `Your invoice for the "${job.title}" posting fee is ready. View and download it anytime.`,
            "info",
            `/invoice/job/${jobId}`
          );
        }
      } catch (err) {
        log.error("webhook.job_posting_failed", { err: String(err), jobId });
        captureException(err, { context: "webhook.job_posting" });
        // Return 500 so Stripe retries — buyer has paid but job wasn't activated
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
      }
      return NextResponse.json({ received: true });
    }

    // ─── Demo booking ──────────────────────────────────────────────────────────
    if (type === "demo_booking" && expertId && buyerId && orderId) {
      try {
        // Idempotency: only process if the order is still in "draft" state.
        // A second delivery of this event will find status "in_progress" and skip.
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.status !== "draft") {
          // Already processed — acknowledge without re-running
          return NextResponse.json({ received: true });
        }

        const expert = await prisma.specialistProfile.findUnique({
          where: { id: expertId },
          include: { user: true },
        });
        if (expert) {
          let conversation = await prisma.conversation.findFirst({
            where: { buyerId, sellerId: expertId },
          });

          if (!conversation) {
            conversation = await prisma.conversation.create({
              data: { buyerId, sellerId: expertId },
            });
          }

          const systemMessage = expert.calendarUrl
            ? `Demo Booked! Payment received. Schedule your call here: ${expert.calendarUrl}`
            : `Demo Booked! Payment received. Your expert will reach out directly to schedule your demo call.`;

          await prisma.$transaction([
            prisma.order.update({
              where: { id: orderId },
              data: { status: "in_progress" },
            }),
            prisma.message.create({
              data: {
                conversationId: conversation.id,
                senderId: expert.userId,
                type: "system",
                body: systemMessage,
              },
            }),
          ]);

          await createNotification(
            buyerId,
            "📅 Demo Confirmed",
            expert.calendarUrl
              ? "Payment successful. Check your messages for the booking link."
              : "Payment successful. Your expert will reach out to schedule the call.",
            "success",
            "/inbox"
          );

          // Invoice notification
          await createNotification(
            buyerId,
            "🧾 Invoice available",
            "Your invoice for this demo booking is ready. You can view and download it anytime.",
            "info",
            `/invoice/${orderId}`
          );

          // Send demo booked email (fire-and-forget)
          sendDemoBookedEmail({
            buyerId,
            expertName: expert.displayName || expert.legalFullName,
            orderId,
            calendarUrl: expert.calendarUrl,
          }).catch((emailErr) =>
            log.error("webhook.demo_booked_email_failed", { err: String(emailErr) })
          );
        }
      } catch (err) {
        log.error("webhook.demo_booking_failed", { err: String(err) });
        captureException(err, { context: "webhook.demo_booking" });
        // Return 500 so Stripe retries — buyer has paid but demo wasn't processed
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
      }

    // ─── Milestone funding / version upgrade ───────────────────────────────────
    } else if ((type === "milestone_funding" || type === "version_upgrade") && orderId && milestoneIndex) {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            seller: true,
            solution: { select: { title: true } },
            conversations: { select: { id: true }, take: 1 },
          },
        });

        if (!order) {
          return NextResponse.json({ received: true });
        }

        const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
        const idx = type === "version_upgrade" ? 0 : parseInt(milestoneIndex);

        if (isNaN(idx) || !milestones[idx]) {
          log.warn("webhook.invalid_milestone_index", { milestoneIndex, orderId });
          return NextResponse.json({ received: true });
        }

        // Idempotency: skip if milestone is already funded or further along.
        // We allow both "pending_payment" (first milestone) and "waiting_for_funds"
        // (subsequent milestones after a previous one is released).
        if (["in_escrow", "releasing", "released"].includes(milestones[idx].status)) {
          return NextResponse.json({ received: true });
        }

        milestones[idx].status = "in_escrow";
        milestones[idx].fundedAt = new Date().toISOString();

        // Resolve the PaymentIntent ID for future refunds (stored per-milestone)
        const paymentIntentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null;

        if (paymentIntentId) {
          milestones[idx].stripePaymentIntentId = paymentIntentId;
        }

        // First milestone funding (order in "draft") → require expert acceptance.
        // Subsequent milestones → set to "in_progress" so expert can continue working.
        const newStatus = order.status === "draft"
          ? "paid_pending_implementation"
          : "in_progress";

        // Transaction: update order + consume referral discount atomically
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: orderId },
            data: {
              milestones: milestones as unknown as Prisma.InputJsonValue,
              status: newStatus,
              // Also keep order-level PaymentIntent as fallback for legacy/single-milestone orders
              ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
            },
          });

          // Consume buyer referral discount inside same transaction
          if (session.metadata?.discountApplied === "true") {
            const buyer = await tx.user.findUnique({
              where: { id: order.buyerId },
              select: { referralRewards: true },
            });
            const rewards = (buyer?.referralRewards as import("@/types").ReferralRewards | null) || {};
            const count = rewards.businessDiscountCount || 0;
            if (count > 0) {
              await tx.user.update({
                where: { id: order.buyerId },
                data: {
                  referralRewards: { ...rewards, businessDiscountCount: count - 1 },
                },
              });
            }
          }
        });

        // Create order_card message in conversation
        const conversationId = order.conversations[0]?.id;
        if (conversationId) {
          await prisma.message.create({
            data: {
              conversationId,
              senderId: order.buyerId,
              type: "order_card",
              body: JSON.stringify({
                type: "milestone_funded",
                milestoneTitle: milestones[idx].title,
                milestoneIndex: idx,
                priceCents: milestones[idx].priceCents ?? 0,
                projectTitle: order.solution?.title || "Project",
                orderId: order.id,
              }),
            },
          });
        }

        // Check referral eligibility (read-only, safe outside transaction)
        await checkBusinessReferralCondition(order.buyerId);

        // Notify both parties
        await Promise.all([
          createNotification(
            order.buyerId,
            type === "version_upgrade" ? "💰 Upgrade Funded" : "💰 Milestone Funded",
            type === "version_upgrade"
              ? "Upgrade funds are secured. Expert will deliver the new version."
              : `Payment for "${milestones[idx].title}" is secured in escrow. The expert will accept your order within 24–48 hours.`,
            "success",
            "/business/projects"
          ),
          order.seller?.userId
            ? createNotification(
                order.seller.userId,
                type === "version_upgrade"
                  ? "💰 Upgrade Purchased"
                  : newStatus === "paid_pending_implementation"
                    ? "🔔 New order — accept to begin"
                    : "💰 Milestone Funded",
                type === "version_upgrade"
                  ? "A client has purchased an upgrade. Check your projects."
                  : newStatus === "paid_pending_implementation"
                    ? `A client has funded "${milestones[idx].title}". Please accept the order within 48 hours to start working.`
                    : `Milestone "${milestones[idx].title}" has been funded by the client. You can continue work.`,
                newStatus === "paid_pending_implementation" ? "alert" : "info",
                "/expert/projects"
              )
            : Promise.resolve(),
        ]);

        // Invoice notification
        await createNotification(
          order.buyerId,
          "🧾 Invoice available",
          `Your invoice for "${milestones[idx].title}" is ready. You can view and download it anytime from your project page.`,
          "info",
          `/invoice/${orderId}`
        );

      } catch (err) {
        log.error("webhook.milestone_funding_failed", { err: String(err) });
        captureException(err, { context: "webhook.milestone_funding" });
        // Return 500 so Stripe will retry this critical payment event
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
      }
    }

  // ═══ charge.dispute.created ═══════════════════════════════════════════════
  // A buyer filed a chargeback with their bank.  Mark the affected order as
  // disputed so the admin can act before Stripe's deadline.
  } else if (event.type === "charge.dispute.created") {
    const dispute = event.data.object as Stripe.Dispute;
    try {
      // Resolve the PaymentIntent that was disputed
      const paymentIntentId = typeof dispute.payment_intent === "string"
        ? dispute.payment_intent
        : (dispute.payment_intent as Stripe.PaymentIntent | null)?.id ?? null;

      if (!paymentIntentId) {
        log.warn("webhook.dispute_no_pi", { disputeId: dispute.id });
        return NextResponse.json({ received: true });
      }

      // Find the order by its per-milestone or order-level PaymentIntent
      const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: {
          seller: { select: { userId: true, displayName: true } },
          solution: { select: { title: true } },
        },
      });

      if (!order) {
        // Might be a job posting or demo — log and acknowledge
        log.warn("webhook.dispute_order_not_found", { paymentIntentId, disputeId: dispute.id });
        return NextResponse.json({ received: true });
      }

      // Idempotency: skip if already disputed or resolved
      if (["disputed", "refunded"].includes(order.status)) {
        return NextResponse.json({ received: true });
      }

      // Create platform dispute record + update order status
      const existingDispute = await prisma.dispute.findUnique({ where: { orderId: order.id } });
      if (!existingDispute) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: { status: "disputed" },
          }),
          prisma.dispute.create({
            data: {
              orderId: order.id,
              reason: `Stripe chargeback filed by buyer's bank. Reason: ${dispute.reason || "unknown"}. Stripe Dispute ID: ${dispute.id}. Amount: €${((dispute.amount || 0) / 100).toFixed(2)}.`,
            },
          }),
        ]);
      }

      // Notify admin + both parties
      const projectName = order.solution?.title || "a project";
      const amountStr = `€${((dispute.amount || 0) / 100).toFixed(2)}`;

      await Promise.all([
        createNotification(
          order.buyerId,
          "⚠️ Chargeback received",
          `Your bank has filed a chargeback for ${amountStr} on "${projectName}". Our team will review this.`,
          "alert",
          "/business/projects"
        ),
        order.seller?.userId
          ? createNotification(
              order.seller.userId,
              "⚠️ Chargeback received",
              `A chargeback of ${amountStr} has been filed on "${projectName}". Funds are on hold pending review.`,
              "alert",
              "/expert/projects"
            )
          : Promise.resolve(),
      ]);

      log.warn("webhook.chargeback_received", {
        orderId: order.id,
        disputeId: dispute.id,
        amount: dispute.amount,
        reason: dispute.reason,
      });
    } catch (err) {
      log.error("webhook.dispute_handler_failed", { err: String(err), disputeId: dispute.id });
      captureException(err, { context: "webhook.charge_dispute_created" });
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }

  // ═══ account.updated ════════════════════════════════════════════════════════
  // Expert's Stripe Connect account status changed (onboarding completed,
  // account disabled, etc.).  Sync capabilities to our DB.
  } else if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    try {
      const expert = await prisma.specialistProfile.findFirst({
        where: { stripeAccountId: account.id },
        select: {
          id: true,
          userId: true,
          stripeDetailsSubmitted: true,
          stripeChargesEnabled: true,
          stripePayoutsEnabled: true,
        },
      });

      if (!expert) {
        // Not our account — acknowledge silently
        return NextResponse.json({ received: true });
      }

      const detailsSubmitted = account.details_submitted ?? false;
      const chargesEnabled = account.charges_enabled ?? false;
      const payoutsEnabled = account.payouts_enabled ?? false;

      // Only update if something actually changed
      const changed =
        expert.stripeDetailsSubmitted !== detailsSubmitted ||
        expert.stripeChargesEnabled !== chargesEnabled ||
        expert.stripePayoutsEnabled !== payoutsEnabled;

      if (changed) {
        await prisma.specialistProfile.update({
          where: { id: expert.id },
          data: {
            stripeDetailsSubmitted: detailsSubmitted,
            stripeChargesEnabled: chargesEnabled,
            stripePayoutsEnabled: payoutsEnabled,
          },
        });

        log.info("webhook.account_updated_synced", {
          expertId: expert.id,
          detailsSubmitted,
          chargesEnabled,
          payoutsEnabled,
        });

        // Notify expert if their account was disabled (was enabled, now isn't)
        if (expert.stripeChargesEnabled && !chargesEnabled) {
          await createNotification(
            expert.userId,
            "⚠️ Stripe account needs attention",
            "Your Stripe account can no longer receive payments. Please check your Stripe dashboard or reconnect in Settings.",
            "alert",
            "/expert/settings"
          );
        }

        // Notify expert when onboarding completes for the first time
        if (!expert.stripeDetailsSubmitted && detailsSubmitted) {
          await createNotification(
            expert.userId,
            "✅ Stripe connected!",
            "Your Stripe account is set up. You can now receive payouts when milestones are released.",
            "success",
            "/expert/settings"
          );
        }
      }
    } catch (err) {
      log.error("webhook.account_updated_failed", { err: String(err), accountId: account.id });
      captureException(err, { context: "webhook.account_updated" });
      // Non-critical — don't return 500, we'll sync on next event or status check
    }
  }

  return NextResponse.json({ received: true });
}
