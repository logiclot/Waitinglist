"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createThread(sellerId: string, solutionId?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { error: "Not authenticated", status: 401 };
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
    return { success: true, threadId: thread.id };
  } catch (e) {
    console.error(e);
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

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to send" };
  }
}

export async function getConversations() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const specialist = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        ...(specialist ? [{ sellerId: specialist.id }] : []),
      ],
    },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      solution: { select: { title: true } },
      order: { select: { id: true, status: true } },
      seller: { select: { id: true, displayName: true, userId: true } },
      buyer: { select: { id: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    success: true as const,
    userId: session.user.id,
    conversations: conversations.map((c) => ({
      id: c.id,
      buyerId: c.buyerId,
      sellerId: c.sellerId,
      otherPartyName:
        c.buyerId === session.user!.id
          ? c.seller.displayName || "Expert"
          : c.buyer.email?.split("@")[0] || "Client",
      solutionTitle: c.solution?.title || null,
      orderId: c.order?.id || null,
      orderStatus: c.order?.status || null,
      lastMessage: c.messages[0]?.body || null,
      lastMessageAt: c.messages[0]?.createdAt?.toISOString() || c.createdAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

export async function getConversationMessages(conversationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const specialist = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      solution: { select: { title: true } },
      order: { select: { id: true, status: true } },
      seller: { select: { displayName: true, userId: true } },
      buyer: { select: { email: true } },
    },
  });

  if (!conversation) return { error: "Conversation not found" };

  const isBuyer = conversation.buyerId === session.user.id;
  const isSeller = specialist && conversation.sellerId === specialist.id;
  if (!isBuyer && !isSeller) return { error: "Unauthorized" };

  return {
    success: true as const,
    userId: session.user.id,
    otherPartyName: isBuyer
      ? conversation.seller.displayName || "Expert"
      : conversation.buyer.email?.split("@")[0] || "Client",
    solutionTitle: conversation.solution?.title || null,
    orderId: conversation.order?.id || null,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      type: m.type,
      createdAt: m.createdAt.toISOString(),
    })),
  };
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
    console.error(e);
    return { error: "Failed to schedule" };
  }
}
