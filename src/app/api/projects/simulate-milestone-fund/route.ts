/**
 * POST /api/projects/simulate-milestone-fund
 *
 * Dev-only: marks a milestone as funded (in_escrow) without real Stripe payment.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import type { Prisma } from "@prisma/client";

export async function POST(req: Request) {
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
    include: { seller: true },
  });

  if (!order || order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const milestones = (order.milestones as { title?: string; status?: string; fundedAt?: string }[]) || [];
  const m = milestones[milestoneIndex];
  if (!m || m.status === "in_escrow" || m.status === "released") {
    return NextResponse.json({ error: "Milestone not fundable" }, { status: 400 });
  }

  milestones[milestoneIndex] = { ...m, status: "in_escrow", fundedAt: new Date().toISOString() };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      milestones: milestones as Prisma.InputJsonValue,
      status: "in_progress",
    },
  });

  await createNotification(
    order.seller.userId,
    "Milestone funded (simulated)",
    `Milestone "${m.title}" has been funded. You can start work.`,
    "info",
    "/expert/projects"
  );

  return NextResponse.json({ success: true });
}
