"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/logger";
import { captureException } from "@/lib/sentry";

export async function cancelOrder(orderId: string): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, buyerId: true, sellerId: true, status: true, milestones: true },
  });

  if (!order) return { error: "Order not found" };
  if (order.buyerId !== session.user.id) return { error: "Unauthorized" };

  // DRAFT orders: safe to hard-delete (no payment taken)
  if (order.status === "draft") {
    await prisma.order.delete({ where: { id: orderId } });
    revalidatePath("/business/projects");
    return { success: true };
  }

  const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
  const hasFundedMilestone = milestones.some((m: { status?: string }) =>
    ["in_escrow", "releasing", "released"].includes(m.status || "")
  );

  if (hasFundedMilestone) {
    // Create dispute record alongside status change
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: "disputed" },
      }),
      prisma.dispute.create({
        data: {
          orderId,
          submittedBy: session.user.id,
          reason: "Buyer cancelled project with funded milestones.",
        },
      }),
    ]);

    // Notify the seller
    const seller = await prisma.specialistProfile.findUnique({
      where: { id: order.sellerId },
      select: { userId: true },
    });
    if (seller) {
      await createNotification(
        seller.userId,
        "A dispute has been raised",
        "Your client has raised a dispute on a project. Our team will review and contact both parties.",
        "alert",
        `/expert/projects/${orderId}`
      );
    }
  } else {
    // Unfunded → mark as refunded (no money moved)
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "refunded", refundedAt: new Date() },
    });
  }

  revalidatePath("/business/projects");
  return { success: true };
}

// ── Submit a dispute with a custom reason ─────────────────────────────────────
export async function submitDispute(
  orderId: string,
  reason: string
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Not authenticated" };

    if (reason.trim().length < 20) {
      return { error: "Please provide at least 20 characters describing the issue." };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: { userId: true } },
        dispute: true,
      },
    });

    if (!order) return { error: "Order not found" };
    if (order.buyerId !== session.user.id) return { error: "Unauthorized" };
    if (order.dispute) return { error: "A dispute has already been raised for this order." };
    if (!["in_progress", "delivered"].includes(order.status)) {
      return { error: "This order cannot be disputed in its current state." };
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: "disputed" },
      }),
      prisma.dispute.create({
        data: {
          orderId,
          submittedBy: session.user.id,
          reason: reason.trim(),
        },
      }),
    ]);

    // Notify seller
    await createNotification(
      order.seller.userId,
      "A dispute has been raised",
      "Your client has raised a dispute on a project. Our team will review and contact both parties.",
      "alert",
      `/expert/projects/${orderId}`
    );

    revalidatePath("/business/projects");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    log.error("orders.submit_dispute_failed", { err: String(err), orderId });
    captureException(err, { context: "submitDispute" });
    return { error: "Failed to submit dispute." };
  }
}
