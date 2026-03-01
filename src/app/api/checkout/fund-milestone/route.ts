/**
 * POST /api/checkout/fund-milestone
 *
 * Creates a Stripe Checkout session to fund a milestone on an existing order
 * (e.g. job-based orders or subsequent milestones on solution orders).
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { APP_URL } from "@/lib/app-url";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.json({
      useSimulate: true,
      message: "Stripe not configured — use Simulate in development.",
    });
  }

  try {
    const { orderId, milestoneIndex } = await req.json();
    if (typeof orderId !== "string" || typeof milestoneIndex !== "number" || milestoneIndex < 0) {
      return NextResponse.json({ error: "orderId and milestoneIndex required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { include: { businessProfile: true } },
        seller: true,
        solution: { select: { title: true } },
      },
    });

    if (!order || order.buyerId !== session.user.id) {
      return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 404 });
    }

    const milestones = (order.milestones as { title?: string; description?: string; price?: number; priceCents?: number; status?: string }[]) || [];
    const m = milestones[milestoneIndex];
    if (!m) return NextResponse.json({ error: "Milestone not found" }, { status: 400 });
    if (m.status === "in_escrow" || m.status === "released") {
      return NextResponse.json({ error: "Milestone already funded" }, { status: 400 });
    }

    const priceCents = typeof m.priceCents === "number"
      ? m.priceCents
      : Math.round((m.price ?? 0) * 100);
    if (priceCents < 50) {
      return NextResponse.json({ error: "Minimum €0.50 required" }, { status: 400 });
    }

    const projectTitle = order.solution?.title ?? "Project";
    let stripeCustomerId = order.buyer.businessProfile?.stripeCustomerId ?? null;

    if (stripeCustomerId) {
      try {
        const existing = await stripe.customers.retrieve(stripeCustomerId);
        if ((existing as { deleted?: boolean }).deleted) stripeCustomerId = null;
      } catch {
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId && order.buyer.businessProfile) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: `${order.buyer.businessProfile.firstName} ${order.buyer.businessProfile.lastName}`,
        metadata: { userId: session.user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.businessProfile.update({
        where: { userId: order.buyerId },
        data: { stripeCustomerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId!,
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `${projectTitle} — Milestone ${milestoneIndex + 1}: ${m.title ?? "Delivery"}`,
            description: String(m.description ?? "").slice(0, 500),
          },
          unit_amount: priceCents,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${APP_URL}/business/projects?success=true&orderId=${orderId}`,
      cancel_url: `${APP_URL}/business/projects?orderId=${orderId}`,
      metadata: {
        type: "milestone_funding",
        orderId,
        milestoneIndex: String(milestoneIndex),
        buyerId: session.user.id,
        expertId: order.sellerId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    log.error("checkout.fund_milestone_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
