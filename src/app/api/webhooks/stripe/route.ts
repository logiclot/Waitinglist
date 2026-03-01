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
  const signature = headers().get("Stripe-Signature") as string;

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

        // Confirm to buyer
        if (buyerId) {
          await createNotification(
            buyerId,
            "Your post is live!",
            `"${job.title}" is now visible to experts. Expect proposals within 24 hours.`,
            "success",
            `/jobs/${jobId}`
          );
        }
      } catch (err) {
        log.error("webhook.job_posting_failed", { err: String(err), jobId });
        captureException(err, { context: "webhook.job_posting" });
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
            "Demo Confirmed",
            expert.calendarUrl
              ? "Payment successful. Check your messages for the booking link."
              : "Payment successful. Your expert will reach out to schedule the call.",
            "success",
            "/inbox"
          );

          // Invoice notification
          await createNotification(
            buyerId,
            "Invoice available",
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
      }

    // ─── Milestone funding / version upgrade ───────────────────────────────────
    } else if ((type === "milestone_funding" || type === "version_upgrade") && orderId && milestoneIndex) {
      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { seller: true },
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

        // Idempotency: only process if milestone is still in the initial "pending_payment" state.
        // If status is already "in_escrow" (or further), this event was already handled.
        if (milestones[idx].status !== "pending_payment") {
          return NextResponse.json({ received: true });
        }

        milestones[idx].status = "in_escrow";
        milestones[idx].fundedAt = new Date().toISOString();

        await prisma.order.update({
          where: { id: orderId },
          data: {
            milestones: milestones as unknown as Prisma.InputJsonValue,
            status: "in_progress",
          },
        });

        // Check referral condition and consume buyer discount in parallel
        await Promise.all([
          checkBusinessReferralCondition(order.buyerId),
          session.metadata?.discountApplied === "true"
            ? prisma.user.findUnique({
                where: { id: order.buyerId },
                select: { referralRewards: true },
              }).then((buyer) => {
                const rewards = (buyer?.referralRewards as import("@/types").ReferralRewards | null) || {};
                const count = rewards.businessDiscountCount || 0;
                if (count > 0) {
                  return prisma.user.update({
                    where: { id: order.buyerId },
                    data: {
                      referralRewards: { ...rewards, businessDiscountCount: count - 1 },
                    },
                  });
                }
              })
            : Promise.resolve(),
        ]);

        // Notify both parties
        await Promise.all([
          createNotification(
            order.buyerId,
            type === "version_upgrade" ? "Upgrade Funded" : "Milestone Funded",
            type === "version_upgrade"
              ? "Upgrade funds are secured. Expert will deliver the new version."
              : `Funds for "${milestones[idx].title}" are safely in Escrow.`,
            "success",
            "/business/projects"
          ),
          order.seller?.userId
            ? createNotification(
                order.seller.userId,
                type === "version_upgrade" ? "Upgrade Purchased" : "Milestone Funded",
                type === "version_upgrade"
                  ? "A client has purchased an upgrade. Check your projects."
                  : `Milestone "${milestones[idx].title}" has been funded. You can start work.`,
                "info",
                "/expert/projects"
              )
            : Promise.resolve(),
        ]);

        // Invoice notification
        await createNotification(
          order.buyerId,
          "Invoice available",
          `Your invoice for "${milestones[idx].title}" is ready. You can view and download it anytime from your project page.`,
          "info",
          `/invoice/${orderId}`
        );

      } catch (err) {
        log.error("webhook.milestone_funding_failed", { err: String(err) });
        captureException(err, { context: "webhook.milestone_funding" });
      }
    }
  }

  return NextResponse.json({ received: true });
}
