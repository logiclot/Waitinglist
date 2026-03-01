import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";
import { cancelOrder, submitDispute } from "@/actions/orders";

describe("cancelOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset session to default authenticated user
    setMockSession({
      user: { id: "user-1", email: "test@example.com", name: "Test User", role: "BUSINESS" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await cancelOrder("order-1");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when order not found", async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);

    const result = await cancelOrder("nonexistent-order");
    expect(result).toEqual({ error: "Order not found" });
  });

  it("returns error when user is not the buyer", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "other-user",
      sellerId: "seller-1",
      status: "draft",
      milestones: null,
    });

    const result = await cancelOrder("order-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("hard-deletes draft orders", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "user-1",
      sellerId: "seller-1",
      status: "draft",
      milestones: null,
    });
    prismaMock.order.delete.mockResolvedValue({});

    const result = await cancelOrder("order-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.order.delete).toHaveBeenCalledWith({ where: { id: "order-1" } });
  });

  it("creates dispute for funded milestones", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "user-1",
      sellerId: "seller-1",
      status: "in_progress",
      milestones: [{ title: "Milestone 1", status: "in_escrow" }],
    });
    // $transaction mock: resolves the array of promises passed to it
    prismaMock.$transaction.mockResolvedValue([{}, {}]);
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ userId: "seller-user-1" });

    const result = await cancelOrder("order-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it("marks unfunded order as refunded", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-2",
      buyerId: "user-1",
      sellerId: "seller-1",
      status: "in_progress",
      milestones: [{ title: "Milestone 1", status: "pending_payment" }],
    });
    prismaMock.order.update.mockResolvedValue({});

    const result = await cancelOrder("order-2");
    expect(result).toEqual({ success: true });
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "order-2" },
      data: { status: "refunded", refundedAt: expect.any(Date) },
    });
  });

  it("marks order as refunded when milestones is null (no funded milestones)", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-3",
      buyerId: "user-1",
      sellerId: "seller-1",
      status: "paid_pending_implementation",
      milestones: null,
    });
    prismaMock.order.update.mockResolvedValue({});

    const result = await cancelOrder("order-3");
    expect(result).toEqual({ success: true });
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "order-3" },
      data: { status: "refunded", refundedAt: expect.any(Date) },
    });
  });
});

describe("submitDispute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "test@example.com", name: "Test User", role: "BUSINESS" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await submitDispute("order-1", "This is a valid dispute reason that is long enough");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when reason is too short", async () => {
    const result = await submitDispute("order-1", "Too short");
    expect(result).toEqual({ error: "Please provide at least 20 characters describing the issue." });
  });

  it("returns error when order already has a dispute", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "user-1",
      status: "in_progress",
      seller: { userId: "seller-user-1" },
      dispute: { id: "existing-dispute" },
    });

    const result = await submitDispute("order-1", "This dispute reason is definitely long enough");
    expect(result).toEqual({ error: "A dispute has already been raised for this order." });
  });

  it("returns error for invalid order status", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "user-1",
      status: "draft",
      seller: { userId: "seller-user-1" },
      dispute: null,
    });

    const result = await submitDispute("order-1", "This dispute reason is definitely long enough");
    expect(result).toEqual({ error: "This order cannot be disputed in its current state." });
  });

  it("submits dispute successfully and notifies seller", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "user-1",
      status: "in_progress",
      seller: { userId: "seller-user-1" },
      dispute: null,
    });
    prismaMock.$transaction.mockResolvedValue([{}, {}]);

    const { createNotification } = await import("@/lib/notifications");

    const result = await submitDispute("order-1", "This dispute reason is definitely long enough");
    expect(result).toEqual({ success: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledWith(
      "seller-user-1",
      "A dispute has been raised",
      expect.any(String),
      "alert",
      "/expert/projects/order-1"
    );
  });

  it("returns error when order not found", async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);

    const result = await submitDispute("nonexistent", "This dispute reason is definitely long enough");
    expect(result).toEqual({ error: "Order not found" });
  });

  it("returns error when user is not the buyer", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "other-user",
      status: "in_progress",
      seller: { userId: "seller-user-1" },
      dispute: null,
    });

    const result = await submitDispute("order-1", "This dispute reason is definitely long enough");
    expect(result).toEqual({ error: "Unauthorized" });
  });
});
