/**
 * POST /api/projects/simulate-milestone-fund
 *
 * Dev-only: marks a milestone as funded (in_escrow) without real Stripe payment.
 * Mirrors the real webhook behavior: sets paid_pending_implementation for first
 * milestone, keeps existing status for subsequent milestones, creates order_card
 * in conversation, and sends proper notifications.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import type { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Simulate endpoints are disabled in production" }, { status: 400 });
  }

  if (process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.json({ error: "Simulate only when Stripe not configured" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, milestoneIndex } = await req.json();
  if (!orderId || typeof milestoneIndex !== "number") {
    return NextResponse.json({ error: "orderId and milestoneIndex required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      seller: true,
      solution: { select: { title: true } },
      conversations: { select: { id: true }, take: 1 },
    },
  });

  if (!order || order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
  const m = milestones[milestoneIndex];
  if (!m || m.status === "in_escrow" || m.status === "released") {
    return NextResponse.json({ error: "Milestone not fundable" }, { status: 400 });
  }

  milestones[milestoneIndex] = { ...m, status: "in_escrow", fundedAt: new Date().toISOString() };

  // First milestone funding (order in "draft") → require expert acceptance.
  // Subsequent milestones → set to "in_progress" so expert can continue working.
  const newStatus = order.status === "draft"
    ? "paid_pending_implementation"
    : "in_progress";

  await prisma.order.update({
    where: { id: orderId },
    data: {
      milestones: milestones as unknown as Prisma.InputJsonValue,
      status: newStatus,
    },
  });

  // Ensure a conversation exists for the order
  let conversationId = order.conversations[0]?.id;
  if (!conversationId) {
    const newConv = await prisma.conversation.create({
      data: {
        orderId,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        solutionId: order.solutionId,
      },
    });
    conversationId = newConv.id;
  }

  // Create order_card in conversation
  if (conversationId) {
    await prisma.message.create({
      data: {
        conversationId,
        senderId: order.buyerId,
        type: "order_card",
        body: JSON.stringify({
          type: "milestone_funded",
          milestoneTitle: m.title || "Milestone",
          milestoneIndex,
          priceCents: m.priceCents ?? 0,
          projectTitle: order.solution?.title || "Project",
          orderId: order.id,
        }),
      },
    });
  }

  // Notify both parties (mirror webhook behavior)
  await Promise.all([
    createNotification(
      order.buyerId,
      "💰 Milestone Funded",
      `Payment for "${m.title}" is secured in escrow. The expert will accept your order within 24–48 hours.`,
      "success",
      "/business/projects"
    ),
    order.seller?.userId
      ? createNotification(
          order.seller.userId,
          newStatus === "paid_pending_implementation"
            ? "🔔 New order — accept to begin"
            : "💰 Milestone Funded",
          newStatus === "paid_pending_implementation"
            ? `A client has funded "${m.title}". Please accept the order within 48 hours to start working.`
            : `Milestone "${m.title}" has been funded by the client. You can continue work.`,
          newStatus === "paid_pending_implementation" ? "alert" : "info",
          "/expert/projects"
        )
      : Promise.resolve(),
  ]);

  return NextResponse.json({ success: true });
}
