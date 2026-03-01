import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";
import { cancelOrder, submitDispute } from "@/actions/orders";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const BUYER_USER_ID = "buyer-1";
const SELLER_USER_ID = "seller-user-1";

function buyerSession() {
  setMockSession({
    user: { id: BUYER_USER_ID, email: "buyer@example.com", name: "Buyer", role: "BUSINESS" },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Integration: Cancel with funded milestones creates dispute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buyerSession();
  });

  it("cancelling an order with in_escrow milestones creates a dispute and notifies seller", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-1",
      buyerId: BUYER_USER_ID,
      sellerId: "specialist-1",
      status: "in_progress",
      milestones: [
        { title: "Milestone 1", status: "in_escrow", price: 100 },
        { title: "Milestone 2", status: "pending_payment", price: 200 },
      ],
    });
    prismaMock.$transaction.mockResolvedValueOnce([{}, {}]);
    prismaMock.specialistProfile.findUnique.mockResolvedValueOnce({
      userId: SELLER_USER_ID,
    });

    const { createNotification } = await import("@/lib/notifications");

    const result = await cancelOrder("order-1");
    expect(result).toEqual({ success: true });

    // Transaction should have been called for dispute creation
    expect(prismaMock.$transaction).toHaveBeenCalled();

    // Seller notified about dispute
    expect(createNotification).toHaveBeenCalledWith(
      SELLER_USER_ID,
      "A dispute has been raised",
      expect.any(String),
      "alert",
      "/expert/projects/order-1",
    );
  });

  it("cancelling an order with releasing milestones also creates dispute", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-2",
      buyerId: BUYER_USER_ID,
      sellerId: "specialist-1",
      status: "in_progress",
      milestones: [
        { title: "Milestone 1", status: "released", price: 100 },
        { title: "Milestone 2", status: "releasing", price: 200 },
      ],
    });
    prismaMock.$transaction.mockResolvedValueOnce([{}, {}]);
    prismaMock.specialistProfile.findUnique.mockResolvedValueOnce({
      userId: SELLER_USER_ID,
    });

    const result = await cancelOrder("order-2");
    expect(result).toEqual({ success: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

describe("Integration: Cancel unfunded order marks as refunded", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buyerSession();
  });

  it("cancelling an order with only pending_payment milestones marks it refunded", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-3",
      buyerId: BUYER_USER_ID,
      sellerId: "specialist-1",
      status: "paid_pending_implementation",
      milestones: [
        { title: "Milestone 1", status: "pending_payment", price: 100 },
        { title: "Milestone 2", status: "waiting", price: 200 },
      ],
    });
    prismaMock.order.update.mockResolvedValueOnce({});

    const result = await cancelOrder("order-3");
    expect(result).toEqual({ success: true });
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "order-3" },
      data: { status: "refunded", refundedAt: expect.any(Date) },
    });
    // No $transaction call for disputes
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("cancelling an order with null milestones marks it refunded", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-4",
      buyerId: BUYER_USER_ID,
      sellerId: "specialist-1",
      status: "in_progress",
      milestones: null,
    });
    prismaMock.order.update.mockResolvedValueOnce({});

    const result = await cancelOrder("order-4");
    expect(result).toEqual({ success: true });
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "order-4" },
      data: { status: "refunded", refundedAt: expect.any(Date) },
    });
  });
});

describe("Integration: Cancel draft order hard-deletes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buyerSession();
  });

  it("cancelling a draft order hard-deletes it from the database", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-5",
      buyerId: BUYER_USER_ID,
      sellerId: "specialist-1",
      status: "draft",
      milestones: null,
    });
    prismaMock.order.delete.mockResolvedValueOnce({});

    const result = await cancelOrder("order-5");
    expect(result).toEqual({ success: true });
    expect(prismaMock.order.delete).toHaveBeenCalledWith({
      where: { id: "order-5" },
    });
    // No update, no $transaction
    expect(prismaMock.order.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe("Integration: Dispute flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buyerSession();
  });

  it("submitting a dispute creates dispute record and notifies seller", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-6",
      buyerId: BUYER_USER_ID,
      status: "in_progress",
      seller: { userId: SELLER_USER_ID },
      dispute: null,
    });
    prismaMock.$transaction.mockResolvedValueOnce([{}, {}]);

    const { createNotification } = await import("@/lib/notifications");

    const result = await submitDispute(
      "order-6",
      "The deliverables do not match what was promised in the milestone description.",
    );
    expect(result).toEqual({ success: true });

    // Transaction called (order status update + dispute creation)
    expect(prismaMock.$transaction).toHaveBeenCalled();

    // Seller notified
    expect(createNotification).toHaveBeenCalledWith(
      SELLER_USER_ID,
      "A dispute has been raised",
      expect.any(String),
      "alert",
      "/expert/projects/order-6",
    );
  });

  it("prevents duplicate disputes", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-6",
      buyerId: BUYER_USER_ID,
      status: "in_progress",
      seller: { userId: SELLER_USER_ID },
      dispute: { id: "existing-dispute" },
    });

    const result = await submitDispute(
      "order-6",
      "This is a duplicate dispute that should not work",
    );
    expect(result).toEqual({ error: "A dispute has already been raised for this order." });
  });

  it("rejects dispute for orders in invalid states", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-7",
      buyerId: BUYER_USER_ID,
      status: "draft",
      seller: { userId: SELLER_USER_ID },
      dispute: null,
    });

    const result = await submitDispute(
      "order-7",
      "Trying to dispute a draft order which should not be allowed",
    );
    expect(result).toEqual({ error: "This order cannot be disputed in its current state." });
  });

  it("rejects dispute with insufficient reason length", async () => {
    const result = await submitDispute("order-8", "Too short");
    expect(result).toEqual({
      error: "Please provide at least 20 characters describing the issue.",
    });
  });
});
