"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/logger";
import { captureException } from "@/lib/sentry";
import { resend } from "@/lib/resend";
import { deliveryReadyEmail } from "@/lib/email-templates";
import { APP_URL } from "@/lib/app-url";
import type { Prisma, OrderStatus } from "@prisma/client";

// ── Expert accepts an order (moves from paid_pending_implementation → in_progress) ──
export async function acceptOrder(orderId: string): Promise<{ success: true } | { error: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Not authenticated" };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: { id: true, userId: true, displayName: true, legalFullName: true } },
        solution: { select: { title: true } },
        conversations: { select: { id: true }, take: 1 },
      },
    });

    if (!order) return { error: "Order not found" };
    if (order.seller.userId !== session.user.id) return { error: "Unauthorized" };
    if (order.status !== "paid_pending_implementation") {
      return { error: "This order cannot be accepted in its current state." };
    }

    const expertName = order.seller.displayName || order.seller.legalFullName;
    const conversationId = order.conversations[0]?.id;

    const txOps: Prisma.PrismaPromise<unknown>[] = [
      prisma.order.update({
        where: { id: orderId },
        data: { status: "in_progress", acceptedAt: new Date() },
      }),
    ];

    // Create an order card in the conversation
    if (conversationId) {
      const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
      const firstMilestone = milestones[0];
      txOps.push(
        prisma.message.create({
          data: {
            conversationId,
            senderId: session.user.id,
            type: "order_card",
            body: JSON.stringify({
              type: "order_accepted",
              milestoneTitle: firstMilestone?.title || "Project",
              milestoneIndex: 0,
              priceCents: firstMilestone?.priceCents ?? 0,
              projectTitle: order.solution?.title || "Project",
              orderId: order.id,
              expertName: expertName || "Expert",
            }),
          },
        })
      );
    }

    await prisma.$transaction(txOps);

    // Notify the buyer
    await createNotification(
      order.buyerId,
      "✅ Expert accepted your order",
      `${expertName} has accepted your order and is now working on it.`,
      "success",
      conversationId ? `/messages/${conversationId}` : "/business/projects"
    );

    revalidatePath("/business/projects");
    revalidatePath("/dashboard/projects");
    if (conversationId) revalidatePath(`/messages/${conversationId}`);

    return { success: true };
  } catch (err) {
    log.error("orders.accept_order_failed", { err: String(err), orderId });
    captureException(err, { context: "acceptOrder" });
    return { error: "Failed to accept order." };
  }
}

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
          reason: "Buyer cancelled project with funded milestones.",
        },
      }),
    ]);

    // Notify both parties
    const seller = await prisma.specialistProfile.findUnique({
      where: { id: order.sellerId },
      select: { userId: true },
    });
    const cancelNotifications: Promise<unknown>[] = [
      createNotification(
        order.buyerId,
        "🔍 Cancellation under review",
        "Your project has been cancelled. Since milestones were funded, our team will review the situation and be in contact with both parties in the shortest time possible.",
        "info",
        "/business/projects"
      ),
    ];
    if (seller) {
      cancelNotifications.push(
        createNotification(
          seller.userId,
          "⚖️ Dispute opened",
          "The client has cancelled the project. Since milestones were funded, a dispute has been opened. We will review the situation and be in contact with both parties in the shortest time possible.",
          "alert",
          "/dashboard/projects"
        )
      );
    }
    await Promise.all(cancelNotifications);
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
    if (reason.length > 4000) {
      return { error: "Dispute reason must be under 4,000 characters." };
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
    if (!["in_progress", "delivered", "revision_requested"].includes(order.status)) {
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
          reason: reason.trim(),
          buyerStatement: reason.trim(),
        },
      }),
    ]);

    // Notify both parties
    await Promise.all([
      createNotification(
        order.seller.userId,
        "⚖️ Dispute opened",
        "Your client has raised a dispute. We will review the situation and be in contact with both parties in the shortest time possible.",
        "alert",
        "/expert/projects"
      ),
      createNotification(
        order.buyerId,
        "⚖️ Dispute submitted",
        "Your dispute has been submitted. We will review the situation and be in contact with both parties in the shortest time possible.",
        "info",
        "/business/projects"
      ),
    ]);

    revalidatePath("/business/projects");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    log.error("orders.submit_dispute_failed", { err: String(err), orderId });
    captureException(err, { context: "submitDispute" });
    return { error: "Failed to submit dispute." };
  }
}

// ── Expert submits delivery (moves from in_progress → delivered) ──────────────
export async function submitDelivery(
  orderId: string,
  note?: string
): Promise<{ success: true } | { error: string }> {
  if (note && note.length > 4000) {
    return { error: "Delivery note must be under 4,000 characters." };
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Not authenticated" };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: { id: true, userId: true, displayName: true, legalFullName: true } },
        solution: { select: { title: true } },
        conversations: { select: { id: true }, take: 1 },
        buyer: {
          select: {
            email: true,
            businessProfile: { select: { firstName: true } },
          },
        },
      },
    });

    if (!order) return { error: "Order not found" };
    if (order.seller.userId !== session.user.id) return { error: "Unauthorized" };
    if (order.status !== "in_progress") {
      return { error: "This order cannot be delivered in its current state." };
    }

    const expertName = order.seller.displayName || order.seller.legalFullName;
    const conversationId = order.conversations[0]?.id;
    const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
    const currentMilestoneIdx = milestones.findIndex(m => m.status === "in_escrow");
    const currentMilestone = currentMilestoneIdx >= 0 ? milestones[currentMilestoneIdx] : milestones[0];

    const txOps: Prisma.PrismaPromise<unknown>[] = [
      prisma.order.update({
        where: { id: orderId },
        data: { status: "delivered", deliveryNote: note || null },
      }),
    ];

    // Create an order card in the conversation
    if (conversationId) {
      txOps.push(
        prisma.message.create({
          data: {
            conversationId,
            senderId: session.user.id,
            type: "order_card",
            body: JSON.stringify({
              type: "delivery_submitted",
              milestoneTitle: currentMilestone?.title || "Delivery",
              milestoneIndex: currentMilestoneIdx >= 0 ? currentMilestoneIdx : 0,
              priceCents: currentMilestone?.priceCents ?? 0,
              projectTitle: order.solution?.title || "Project",
              orderId: order.id,
              expertName: expertName || "Expert",
              deliveryNote: note || undefined,
            }),
          },
        })
      );
    }

    await prisma.$transaction(txOps);

    // Notify the buyer
    await createNotification(
      order.buyerId,
      "📦 Expert delivered your project",
      `${expertName} has submitted the delivery. Please review and approve.`,
      "success",
      conversationId ? `/messages/${conversationId}` : "/business/projects"
    );

    // Send delivery-ready email to buyer (fire-and-forget)
    const { getFromEmail } = await import("@/lib/resend");
    const FROM_EMAIL = getFromEmail();
    if (FROM_EMAIL && order.buyer?.email) {
      resend.emails
        .send({
          from: FROM_EMAIL,
          to: order.buyer.email,
          subject: `Your automation "${order.solution?.title || "project"}" is ready for review`,
          html: deliveryReadyEmail({
            firstName: order.buyer.businessProfile?.firstName ?? "there",
            projectTitle: order.solution?.title || "your project",
            expertName: expertName || "Your expert",
            reviewUrl: `${APP_URL}/business/projects`,
          }),
        })
        .catch((e) =>
          log.error("orders.delivery_email_failed", { orderId, error: String(e) })
        );
    }

    revalidatePath("/business/projects");
    revalidatePath("/dashboard/projects");
    if (conversationId) revalidatePath(`/messages/${conversationId}`);

    return { success: true };
  } catch (err) {
    log.error("orders.submit_delivery_failed", { err: String(err), orderId });
    captureException(err, { context: "submitDelivery" });
    return { error: "Failed to submit delivery." };
  }
}

// ── Buyer requests a revision on a delivered order ─────────────────────────────
export async function requestRevision(
  orderId: string,
  note: string
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Not authenticated" };

    if (note.trim().length < 20) {
      return { error: "Please provide at least 20 characters describing the changes needed." };
    }
    if (note.length > 4000) {
      return { error: "Revision note must be under 4,000 characters." };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: { id: true, userId: true, displayName: true } },
        solution: { select: { title: true } },
        bid: { include: { jobPost: { select: { title: true } } } },
        conversations: { select: { id: true }, take: 1 },
      },
    });

    if (!order) return { error: "Order not found" };
    if (order.buyerId !== session.user.id) return { error: "Unauthorized" };
    if (order.status !== "delivered") {
      return { error: "Revisions can only be requested on delivered orders." };
    }

    const conversationId = order.conversations[0]?.id;
    const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
    const currentMilestoneIdx = milestones.findIndex(m => m.status === "in_escrow");
    const currentMilestone = currentMilestoneIdx >= 0 ? milestones[currentMilestoneIdx] : milestones[0];
    const newRevisionCount = (order.revisionCount ?? 0) + 1;

    const txOps: Prisma.PrismaPromise<unknown>[] = [
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "revision_requested",
          revisionNote: note.trim(),
          revisionCount: newRevisionCount,
        },
      }),
    ];

    // Create order card in conversation
    if (conversationId) {
      txOps.push(
        prisma.message.create({
          data: {
            conversationId,
            senderId: session.user.id,
            type: "order_card",
            body: JSON.stringify({
              type: "revision_requested",
              milestoneTitle: currentMilestone?.title || "Milestone",
              milestoneIndex: currentMilestoneIdx >= 0 ? currentMilestoneIdx : 0,
              priceCents: currentMilestone?.priceCents ?? 0,
              projectTitle: order.solution?.title || order.bid?.jobPost?.title || "Project",
              orderId: order.id,
              revisionNote: note.trim(),
              revisionCount: newRevisionCount,
            }),
          },
        })
      );
    }

    await prisma.$transaction(txOps);

    // Notify expert
    await createNotification(
      order.seller.userId,
      "🔄 Modification requested",
      `Your client has requested changes (revision #${newRevisionCount}). Please review and respond.`,
      "alert",
      `/expert/projects`
    );

    revalidatePath("/business/projects");
    revalidatePath("/expert/projects");
    revalidatePath("/dashboard/projects");
    if (conversationId) revalidatePath(`/messages/${conversationId}`);

    return { success: true };
  } catch (err) {
    log.error("orders.request_revision_failed", { err: String(err), orderId });
    captureException(err, { context: "requestRevision" });
    return { error: "Failed to request revision." };
  }
}

// ── Expert accepts a revision request (moves revision_requested → in_progress) ──
export async function acceptRevision(
  orderId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Not authenticated" };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: { id: true, userId: true, displayName: true, legalFullName: true } },
        solution: { select: { title: true } },
        bid: { include: { jobPost: { select: { title: true } } } },
        conversations: { select: { id: true }, take: 1 },
      },
    });

    if (!order) return { error: "Order not found" };
    if (order.seller.userId !== session.user.id) return { error: "Unauthorized" };
    if (order.status !== "revision_requested") {
      return { error: "No pending revision request to accept." };
    }

    const expertName = order.seller.displayName || order.seller.legalFullName;
    const conversationId = order.conversations[0]?.id;
    const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
    const currentMilestoneIdx = milestones.findIndex(m => m.status === "in_escrow");
    const currentMilestone = currentMilestoneIdx >= 0 ? milestones[currentMilestoneIdx] : milestones[0];

    const txOps: Prisma.PrismaPromise<unknown>[] = [
      prisma.order.update({
        where: { id: orderId },
        data: { status: "in_progress" },
      }),
    ];

    // Create order card in conversation
    if (conversationId) {
      txOps.push(
        prisma.message.create({
          data: {
            conversationId,
            senderId: session.user.id,
            type: "order_card",
            body: JSON.stringify({
              type: "revision_accepted",
              milestoneTitle: currentMilestone?.title || "Milestone",
              milestoneIndex: currentMilestoneIdx >= 0 ? currentMilestoneIdx : 0,
              priceCents: currentMilestone?.priceCents ?? 0,
              projectTitle: order.solution?.title || order.bid?.jobPost?.title || "Project",
              orderId: order.id,
              expertName: expertName || "Expert",
            }),
          },
        })
      );
    }

    await prisma.$transaction(txOps);

    // Notify buyer
    await createNotification(
      order.buyerId,
      "✅ Expert accepted revision request",
      `${expertName} has accepted your revision request and is working on the changes.`,
      "success",
      conversationId ? `/messages/${conversationId}` : "/business/projects"
    );

    revalidatePath("/business/projects");
    revalidatePath("/expert/projects");
    revalidatePath("/dashboard/projects");
    if (conversationId) revalidatePath(`/messages/${conversationId}`);

    return { success: true };
  } catch (err) {
    log.error("orders.accept_revision_failed", { err: String(err), orderId });
    captureException(err, { context: "acceptRevision" });
    return { error: "Failed to accept revision." };
  }
}

// ── Expert denies a revision request (moves revision_requested → disputed) ──
export async function denyRevision(
  orderId: string,
  reason?: string
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Not authenticated" };

    const trimmedReason = reason?.trim() || "";
    if (trimmedReason.length < 20) {
      return { error: "Please provide at least 20 characters explaining why you're denying." };
    }
    if ((reason?.length || 0) > 4000) {
      return { error: "Reason must be under 4,000 characters." };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: { id: true, userId: true } },
        dispute: true,
      },
    });

    if (!order) return { error: "Order not found" };
    if (order.seller.userId !== session.user.id) return { error: "Unauthorized" };
    if (order.status !== "revision_requested") {
      return { error: "No pending revision request to deny." };
    }
    if (order.dispute) {
      return { error: "A dispute has already been raised for this order." };
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: "disputed" },
      }),
      prisma.dispute.create({
        data: {
          orderId,
          reason: `Expert denied revision request #${order.revisionCount ?? 1}. Buyer's revision note: "${order.revisionNote || "No note provided"}"`,
          sellerStatement: trimmedReason,
        },
      }),
    ]);

    // Notify both parties
    await Promise.all([
      createNotification(
        order.buyerId,
        "⚖️ Dispute opened",
        "The expert has declined your revision request. We will review the situation and be in contact with both parties in the shortest time possible.",
        "alert",
        "/business/projects"
      ),
      createNotification(
        order.seller.userId,
        "⚖️ Dispute opened",
        "You declined the revision request. A dispute has been opened. We will review the situation and be in contact with both parties in the shortest time possible.",
        "alert",
        "/dashboard/projects"
      ),
    ]);

    revalidatePath("/business/projects");
    revalidatePath("/expert/projects");
    revalidatePath("/dashboard/projects");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    log.error("orders.deny_revision_failed", { err: String(err), orderId });
    captureException(err, { context: "denyRevision" });
    return { error: "Failed to deny revision." };
  }
}

// ── Count projects that need attention (for sidebar badge) ───────────────────
/** Statuses that signal the user needs to take action */
const ACTION_NEEDED_BUSINESS: OrderStatus[] = ["delivered", "revision_requested", "disputed"];
const ACTION_NEEDED_EXPERT: OrderStatus[] = ["paid_pending_implementation", "revision_requested", "disputed"];

export async function getActionNeededProjectCount(): Promise<number> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return 0;

    const role = session.user.role;

    if (role === "BUSINESS" || role === "USER") {
      return prisma.order.count({
        where: {
          buyerId: session.user.id,
          status: { in: ACTION_NEEDED_BUSINESS },
        },
      });
    }

    if (role === "EXPERT") {
      const expert = await prisma.specialistProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!expert) return 0;
      return prisma.order.count({
        where: {
          sellerId: expert.id,
          status: { in: ACTION_NEEDED_EXPERT },
        },
      });
    }

    return 0;
  } catch {
    return 0;
  }
}

// ── Submit or update a dispute statement (buyer or seller clarification) ──────
export async function submitDisputeStatement(
  orderId: string,
  statement: string
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Not authenticated" };

    const trimmed = statement.trim();
    if (trimmed.length < 10) {
      return { error: "Please provide at least 10 characters." };
    }
    if (statement.length > 4000) {
      return { error: "Statement must be under 4,000 characters." };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: { id: true, userId: true } },
        dispute: true,
      },
    });

    if (!order) return { error: "Order not found" };
    if (!order.dispute) return { error: "No dispute found for this order." };

    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.seller.userId === session.user.id;
    if (!isBuyer && !isSeller) return { error: "Unauthorized" };

    await prisma.dispute.update({
      where: { id: order.dispute.id },
      data: isBuyer
        ? { buyerStatement: trimmed }
        : { sellerStatement: trimmed },
    });

    revalidatePath("/business/projects");
    revalidatePath("/expert/projects");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    log.error("orders.submit_dispute_statement_failed", { err: String(err), orderId });
    captureException(err, { context: "submitDisputeStatement" });
    return { error: "Failed to submit statement." };
  }
}
