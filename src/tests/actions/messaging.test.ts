import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";
import { createThread, sendMessage } from "@/actions/messaging";

describe("createThread", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "buyer@example.com", name: "Buyer", role: "BUSINESS" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await createThread("seller-1");
    expect(result).toEqual({ error: "Not authenticated", status: 401 });
  });

  it("returns error when specialist not found", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue(null);
    const result = await createThread("nonexistent-seller");
    expect(result).toEqual({ error: "Specialist not found", status: 404 });
  });

  it("prevents self-messaging", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({
      id: "seller-1",
      userId: "user-1", // same as session user
    });

    const result = await createThread("seller-1");
    expect(result).toEqual({ error: "Cannot message yourself", status: 400 });
  });

  it("reuses existing thread instead of creating duplicate", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({
      id: "seller-1",
      userId: "seller-user-1",
    });
    prismaMock.conversation.findFirst.mockResolvedValue({
      id: "existing-thread-1",
      buyerId: "user-1",
      sellerId: "seller-1",
      solutionId: null,
    });

    const result = await createThread("seller-1");
    expect(result).toEqual({ success: true, threadId: "existing-thread-1" });
    expect(prismaMock.conversation.create).not.toHaveBeenCalled();
  });

  it("reuses existing thread for same solution", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({
      id: "seller-1",
      userId: "seller-user-1",
    });
    prismaMock.conversation.findFirst.mockResolvedValue({
      id: "existing-thread-2",
      buyerId: "user-1",
      sellerId: "seller-1",
      solutionId: "solution-1",
    });

    const result = await createThread("seller-1", "solution-1");
    expect(result).toEqual({ success: true, threadId: "existing-thread-2" });
  });

  it("creates new thread successfully", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({
      id: "seller-1",
      userId: "seller-user-1",
    });
    prismaMock.conversation.findFirst.mockResolvedValue(null);
    prismaMock.conversation.create.mockResolvedValue({
      id: "new-thread-1",
      buyerId: "user-1",
      sellerId: "seller-1",
      solutionId: null,
    });

    const result = await createThread("seller-1");
    expect(result).toEqual({ success: true, threadId: "new-thread-1" });
    expect(prismaMock.conversation.create).toHaveBeenCalledWith({
      data: {
        buyerId: "user-1",
        sellerId: "seller-1",
        solutionId: undefined,
      },
    });
  });

  it("creates new thread with solutionId", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({
      id: "seller-1",
      userId: "seller-user-1",
    });
    prismaMock.conversation.findFirst.mockResolvedValue(null);
    prismaMock.conversation.create.mockResolvedValue({
      id: "new-thread-2",
      buyerId: "user-1",
      sellerId: "seller-1",
      solutionId: "solution-1",
    });

    const result = await createThread("seller-1", "solution-1");
    expect(result).toEqual({ success: true, threadId: "new-thread-2" });
    expect(prismaMock.conversation.create).toHaveBeenCalledWith({
      data: {
        buyerId: "user-1",
        sellerId: "seller-1",
        solutionId: "solution-1",
      },
    });
  });

  it("returns error when conversation creation fails", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({
      id: "seller-1",
      userId: "seller-user-1",
    });
    prismaMock.conversation.findFirst.mockResolvedValue(null);
    prismaMock.conversation.create.mockRejectedValue(new Error("DB error"));

    const result = await createThread("seller-1");
    expect(result).toEqual({ error: "Failed to create thread", status: 500 });
  });
});

describe("sendMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "buyer@example.com", name: "Buyer", role: "BUSINESS" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await sendMessage("thread-1", "Hello");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error for empty message", async () => {
    const result = await sendMessage("thread-1", "   ");
    expect(result).toEqual({ error: "Message empty" });
  });

  it("returns error for empty string message", async () => {
    const result = await sendMessage("thread-1", "");
    expect(result).toEqual({ error: "Message empty" });
  });

  it("returns error when thread not found", async () => {
    prismaMock.conversation.findUnique.mockResolvedValue(null);

    const result = await sendMessage("nonexistent-thread", "Hello");
    expect(result).toEqual({ error: "Thread not found" });
  });

  it("returns error when user is not a participant", async () => {
    prismaMock.conversation.findUnique.mockResolvedValue({
      id: "thread-1",
      buyerId: "other-buyer",
      seller: { userId: "other-seller" },
    });

    const result = await sendMessage("thread-1", "Hello");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("sends message successfully as buyer", async () => {
    prismaMock.conversation.findUnique.mockResolvedValue({
      id: "thread-1",
      buyerId: "user-1",
      seller: { userId: "seller-user-1" },
    });
    prismaMock.message.create.mockResolvedValue({ id: "msg-1" });

    const result = await sendMessage("thread-1", "Hello there!");
    expect(result).toEqual({ success: true });
    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: {
        conversationId: "thread-1",
        senderId: "user-1",
        body: "Hello there!",
        type: "user",
      },
    });
  });

  it("sends message successfully as seller", async () => {
    setMockSession({
      user: { id: "seller-user-1", email: "seller@example.com", name: "Seller", role: "SPECIALIST" },
    });

    prismaMock.conversation.findUnique.mockResolvedValue({
      id: "thread-1",
      buyerId: "buyer-1",
      seller: { userId: "seller-user-1" },
    });
    prismaMock.message.create.mockResolvedValue({ id: "msg-2" });

    const result = await sendMessage("thread-1", "Hi, how can I help?");
    expect(result).toEqual({ success: true });
    expect(prismaMock.message.create).toHaveBeenCalledWith({
      data: {
        conversationId: "thread-1",
        senderId: "seller-user-1",
        body: "Hi, how can I help?",
        type: "user",
      },
    });
  });

  it("returns error when message creation fails", async () => {
    prismaMock.conversation.findUnique.mockResolvedValue({
      id: "thread-1",
      buyerId: "user-1",
      seller: { userId: "seller-user-1" },
    });
    prismaMock.message.create.mockRejectedValue(new Error("DB error"));

    const result = await sendMessage("thread-1", "Hello");
    expect(result).toEqual({ error: "Failed to send" });
  });
});
