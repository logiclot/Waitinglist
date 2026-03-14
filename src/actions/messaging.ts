"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export async function createThread(sellerId: string, solutionId?: string, orderId?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { error: "Not authenticated", status: 401 };
  }

  if (orderId) {
    const existing = await prisma.conversation.findFirst({
      where: { orderId },
    });
    if (existing) {
      const isParticipant = existing.buyerId === session.user.id;
      const seller = await prisma.specialistProfile.findUnique({
        where: { id: existing.sellerId },
        select: { userId: true },
      });
      if (isParticipant || seller?.userId === session.user.id) {
        return { success: true, threadId: existing.id };
      }
    }
  }

  // Prevent self-messaging
  // We need to check if session.user.id is the specialist
  // Assuming sellerId is the SpecialistProfile ID. 
  // We need to find the User ID of the specialist to compare, OR check if current user is the specialist.
  // Actually, conversations link buyerId (User) and sellerId (SpecialistProfile).
  
  // Verify seller exists
  const seller = await prisma.specialistProfile.findUnique({
    where: { id: sellerId }
  });

  if (!seller) {
    return { error: "Specialist not found", status: 404 };
  }

  if (seller.userId === session.user.id) {
    return { error: "Cannot message yourself", status: 400 };
  }

  // Check if thread exists
  const existingThread = await prisma.conversation.findFirst({
    where: {
      buyerId: session.user.id,
      sellerId: sellerId,
      solutionId: solutionId || null,
    },
  });

  if (existingThread) {
    return { success: true, threadId: existingThread.id };
  }

  try {
    const thread = await prisma.conversation.create({
      data: {
        buyerId: session.user.id,
        sellerId: sellerId,
        solutionId: solutionId,
      },
    });

    // Notify Seller
    if (seller.userId) {
      await createNotification(
        seller.userId,
        "💬 New Conversation",
        "A potential client has started a conversation with you.",
        "info",
        "/inbox"
      );
    }

    return { success: true, threadId: thread.id };
  } catch (e) {
    log.error("messaging.create_thread_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to create thread", status: 500 };
  }
}

export async function sendMessage(threadId: string, body: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  if (!body.trim()) return { error: "Message empty" };

  try {
    const thread = await prisma.conversation.findUnique({
      where: { id: threadId },
      include: { seller: true }
    });

    if (!thread) return { error: "Thread not found" };

    // Check participation
    // Buyer is thread.buyerId
    // Seller is thread.seller.userId
    const isBuyer = thread.buyerId === session.user.id;
    const isSeller = thread.seller.userId === session.user.id;

    if (!isBuyer && !isSeller) {
      return { error: "Unauthorized" };
    }

    await prisma.message.create({
      data: {
        conversationId: threadId,
        senderId: session.user.id,
        body,
        type: "user",
      },
    });

    // Notification Logic
    const recipientId = isBuyer ? thread.seller.userId : thread.buyerId;
    const senderName = session.user.name || "User";

    // Check for existing unread notification for this thread
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: recipientId,
        type: "info",
        isRead: false,
        actionUrl: "/inbox",
        createdAt: {
          gt: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });

    if (existingNotification) {
      await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          title: "New Messages",
          message: `You have new messages from ${senderName}`,
          createdAt: new Date() // Bump timestamp
        }
      });
    } else {
      await createNotification(
        recipientId,
        "💬 New Message",
        `You have a new message from ${senderName}`,
        "info",
        "/inbox"
      );
    }

    return { success: true };
  } catch (e) {
    log.error("messaging.send_message_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to send" };
  }
}

export async function scheduleMeeting(threadId: string, date: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    const thread = await prisma.conversation.findUnique({
      where: { id: threadId },
      include: { seller: true }
    });

    if (!thread) return { error: "Thread not found" };

    const isBuyer = thread.buyerId === session.user.id;
    const isSeller = thread.seller.userId === session.user.id;

    if (!isBuyer && !isSeller) {
      return { error: "Unauthorized" };
    }

    // Mock Google Meet Link Generation
    const meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(7)}-${Math.random().toString(36).substring(7)}`;
    const formattedDate = new Date(date).toLocaleString();

    const messageBody = `📅 Session Booked: ${formattedDate}. Join via Google Meet: ${meetingLink}. Reminder: This session is covered under the signed Platform NDA.`;

    await prisma.message.create({
      data: {
        conversationId: threadId,
        senderId: session.user.id,
        body: messageBody,
        type: "system",
      },
    });

    return { success: true, meetingLink, messageBody };
  } catch (e) {
    log.error("messaging.schedule_meeting_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to schedule" };
  }
}

/**
 * Count conversations with unread messages for the current user.
 * A conversation is "unread" if the most recent message was NOT sent by the current user.
 */
export async function getUnreadConversationCount(): Promise<number> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return 0;

    const userId = session.user.id;

    // Get specialist profile id (if expert)
    const expertProfile = await prisma.specialistProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    // Find all conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          ...(expertProfile ? [{ sellerId: expertProfile.id }] : []),
        ],
      },
      select: {
        messages: {
          orderBy: { createdAt: "desc" as const },
          take: 1,
          select: { senderId: true },
        },
      },
    });

    // Count conversations where the last message is NOT from the current user
    return conversations.filter(
      (c) => c.messages.length > 0 && c.messages[0].senderId !== userId
    ).length;
  } catch {
    return 0;
  }
}
