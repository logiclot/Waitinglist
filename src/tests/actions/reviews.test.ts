import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";
import { submitSellerReview, submitBuyerReview, getReviewForOrder } from "@/actions/reviews";

describe("submitSellerReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "seller-user-1", email: "seller@example.com", name: "Seller", role: "SPECIALIST" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await submitSellerReview("order-1", 5, "Great buyer");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error for invalid rating (too low)", async () => {
    const result = await submitSellerReview("order-1", 0, "Bad rating");
    expect(result).toEqual({ error: "Rating must be between 1 and 5" });
  });

  it("returns error for invalid rating (too high)", async () => {
    const result = await submitSellerReview("order-1", 6, "Bad rating");
    expect(result).toEqual({ error: "Rating must be between 1 and 5" });
  });

  it("returns error for non-integer rating", async () => {
    const result = await submitSellerReview("order-1", 3.5, "Half star");
    expect(result).toEqual({ error: "Rating must be between 1 and 5" });
  });

  it("returns error when user is not the seller", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "buyer-1",
      seller: { userId: "different-seller", displayName: "Other Expert" },
      status: "delivered",
      review: { id: "review-1", sellerRating: null },
    });

    const result = await submitSellerReview("order-1", 5, "Great buyer");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when already reviewed", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "buyer-1",
      seller: { userId: "seller-user-1", displayName: "Test Expert" },
      status: "delivered",
      review: { id: "review-1", sellerRating: 4, buyerRating: null },
    });
    prismaMock.review.updateMany.mockResolvedValue({ count: 0 });

    const result = await submitSellerReview("order-1", 5, "Another review");
    expect(result).toEqual({ error: "You have already submitted a review" });
  });

  it("returns error when order is not in delivered/approved status", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "buyer-1",
      seller: { userId: "seller-user-1", displayName: "Test Expert" },
      status: "in_progress",
      review: { id: "review-1", sellerRating: null },
    });

    const result = await submitSellerReview("order-1", 5, "Great buyer");
    expect(result).toEqual({ error: "Order must be delivered before reviewing" });
  });

  it("submits seller review successfully", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "buyer-1",
      seller: { userId: "seller-user-1", displayName: "Test Expert" },
      status: "delivered",
      review: { id: "review-1", sellerRating: null, buyerRating: null },
    });
    prismaMock.review.updateMany.mockResolvedValue({ count: 1 });

    const { createNotification } = await import("@/lib/notifications");

    const result = await submitSellerReview("order-1", 5, "Great buyer!");
    expect(result).toEqual({ success: true });
    expect(prismaMock.review.updateMany).toHaveBeenCalledWith({
      where: { id: "review-1", sellerRating: null },
      data: expect.objectContaining({
        sellerRating: 5,
        sellerComment: "Great buyer!",
        sellerSubmittedAt: expect.any(Date),
      }),
    });
    expect(createNotification).toHaveBeenCalledWith(
      "buyer-1",
      expect.stringContaining("left you a review"),
      expect.any(String),
      "info",
      expect.stringContaining("order-1")
    );
  });
});

describe("submitBuyerReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "buyer-1", email: "buyer@example.com", name: "Buyer", role: "BUSINESS" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await submitBuyerReview("order-1", 5, "Great expert");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error for invalid rating", async () => {
    const result = await submitBuyerReview("order-1", 0, "Invalid");
    expect(result).toEqual({ error: "Rating must be between 1 and 5" });
  });

  it("returns error when user is not the buyer", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "other-buyer",
      seller: { userId: "seller-user-1", displayName: "Expert", id: "specialist-1" },
      status: "delivered",
      review: { id: "review-1", buyerRating: null, sellerRating: null },
    });

    const result = await submitBuyerReview("order-1", 5, "Great expert");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when already reviewed", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "buyer-1",
      seller: { userId: "seller-user-1", displayName: "Expert", id: "specialist-1" },
      status: "delivered",
      review: { id: "review-1", buyerRating: 4, sellerRating: null },
    });

    const result = await submitBuyerReview("order-1", 5, "Again");
    expect(result).toEqual({ error: "You have already submitted a review" });
  });

  it("submits buyer review and unblinds when seller also reviewed", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "buyer-1",
      seller: { userId: "seller-user-1", displayName: "Expert", id: "specialist-1" },
      status: "delivered",
      review: { id: "review-1", buyerRating: null, sellerRating: 4 },
    });
    prismaMock.$transaction.mockResolvedValue([{}, {}]);

    const { createNotification } = await import("@/lib/notifications");

    const result = await submitBuyerReview("order-1", 5, "Great expert!");
    expect(result).toEqual({ success: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();

    // Should notify both parties about unblinding
    expect(createNotification).toHaveBeenCalledTimes(2);
    expect(createNotification).toHaveBeenCalledWith(
      "buyer-1",
      expect.stringContaining("Reviews are now visible"),
      expect.any(String),
      "success",
      expect.any(String)
    );
    expect(createNotification).toHaveBeenCalledWith(
      "seller-user-1",
      expect.stringContaining("Reviews are now visible"),
      expect.any(String),
      "success",
      expect.any(String)
    );
  });

  it("submits buyer review without unblinding when seller has not reviewed", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "buyer-1",
      seller: { userId: "seller-user-1", displayName: "Expert", id: "specialist-1" },
      status: "delivered",
      review: { id: "review-1", buyerRating: null, sellerRating: null },
    });
    prismaMock.$transaction.mockResolvedValue([{}, {}]);

    const { createNotification } = await import("@/lib/notifications");

    const result = await submitBuyerReview("order-1", 4, "Good work");
    expect(result).toEqual({ success: true });
    // No unblind notifications
    expect(createNotification).not.toHaveBeenCalled();
  });
});

describe("getReviewForOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "buyer-1", email: "buyer@example.com", name: "Buyer", role: "BUSINESS" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await getReviewForOrder("order-1");
    expect(result).toEqual({ review: null, role: null, error: "Not authenticated" });
  });

  it("returns error when order not found", async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    const result = await getReviewForOrder("nonexistent");
    expect(result).toEqual({ review: null, role: null, error: "Order not found" });
  });

  it("returns error when user is not buyer or seller", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "other-buyer",
      seller: { userId: "other-seller" },
      review: null,
    });
    const result = await getReviewForOrder("order-1");
    expect(result).toEqual({ review: null, role: null, error: "Unauthorized" });
  });

  it("returns null review when no review exists", async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "buyer-1",
      seller: { userId: "seller-user-1" },
      review: null,
    });
    const result = await getReviewForOrder("order-1");
    expect(result).toEqual({ review: null, role: "buyer" });
  });

  it("buyer sees own review but not seller review when blinded", async () => {
    const now = new Date();
    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "buyer-1",
      seller: { userId: "seller-user-1" },
      review: {
        id: "review-1",
        orderId: "order-1",
        sellerRating: 5,
        sellerComment: "Great buyer",
        sellerSubmittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        buyerRating: 4,
        buyerComment: "Good expert",
        buyerSubmittedAt: now,
        unblindedAt: null,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    const result = await getReviewForOrder("order-1");
    expect(result.role).toBe("buyer");
    expect(result.review).not.toBeNull();
    // Buyer sees own review
    expect(result.review!.buyerRating).toBe(4);
    expect(result.review!.buyerComment).toBe("Good expert");
    // Seller review not visible (blinded) — rating/comment should be null
    expect(result.review!.sellerRating).toBeNull();
    expect(result.review!.sellerComment).toBeNull();
  });

  it("auto-unblinds seller review after 14 days when buyer has not reviewed", async () => {
    const now = new Date();
    const sixteenDaysAgo = new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000);

    prismaMock.order.findUnique.mockResolvedValue({
      id: "order-1",
      buyerId: "buyer-1",
      seller: { userId: "seller-user-1" },
      review: {
        id: "review-1",
        orderId: "order-1",
        sellerRating: 5,
        sellerComment: "Great buyer",
        sellerSubmittedAt: sixteenDaysAgo,
        buyerRating: null,
        buyerComment: null,
        buyerSubmittedAt: null,
        unblindedAt: null,
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
    });
    prismaMock.review.update.mockResolvedValue({});

    const result = await getReviewForOrder("order-1");
    expect(result.review).not.toBeNull();
    expect(result.review!.isUnblinded).toBe(true);
    // Buyer can now see seller's review
    expect(result.review!.sellerRating).toBe(5);
    expect(result.review!.sellerComment).toBe("Great buyer");
    // Auto-unblind was persisted
    expect(prismaMock.review.update).toHaveBeenCalledWith({
      where: { id: "review-1" },
      data: { unblindedAt: expect.any(Date) },
    });
  });
});
