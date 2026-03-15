import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";
import {
  submitSellerReview,
  submitBuyerReview,
  getReviewForOrder,
} from "@/actions/reviews";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SELLER_USER_ID = "seller-user-1";
const BUYER_USER_ID = "buyer-1";

function sellerSession() {
  setMockSession({
    user: { id: SELLER_USER_ID, email: "seller@example.com", name: "Seller", role: "SPECIALIST" },
  });
}

function buyerSession() {
  setMockSession({
    user: { id: BUYER_USER_ID, email: "buyer@example.com", name: "Buyer", role: "BUSINESS" },
  });
}

/** Factory for a delivered order with a blank review record. */
function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    buyerId: BUYER_USER_ID,
    sellerId: "specialist-1",
    status: "delivered",
    seller: { userId: SELLER_USER_ID, displayName: "Test Expert", id: "specialist-1" },
    review: {
      id: "review-1",
      orderId: "order-1",
      sellerRating: null,
      sellerComment: null,
      sellerSubmittedAt: null,
      buyerRating: null,
      buyerComment: null,
      buyerSubmittedAt: null,
      unblindedAt: null,
      createdAt: new Date(),
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Integration: Review flow — both parties review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("seller reviews, then buyer reviews → reviews are unblinded and both parties notified", async () => {
    // ── Step 1: Seller submits review ─────────────────────────────────────────
    sellerSession();

    prismaMock.order.findUnique.mockResolvedValueOnce(makeOrder());
    prismaMock.review.updateMany.mockResolvedValueOnce({ count: 1 });

    const sellerResult = await submitSellerReview("order-1", 5, "Great buyer!");
    expect(sellerResult).toEqual({ success: true });

    expect(prismaMock.review.updateMany).toHaveBeenCalledWith({
      where: { id: "review-1", sellerRating: null },
      data: expect.objectContaining({
        sellerRating: 5,
        sellerComment: "Great buyer!",
        sellerSubmittedAt: expect.any(Date),
      }),
    });

    const { createNotification } = await import("@/lib/notifications");
    // Notification sent to buyer that seller left a review
    expect(createNotification).toHaveBeenCalledWith(
      BUYER_USER_ID,
      expect.stringContaining("left you a review"),
      expect.any(String),
      "info",
      expect.stringContaining("order-1"),
    );

    // ── Step 2: Buyer submits review (seller already reviewed) ────────────────
    vi.clearAllMocks();
    buyerSession();

    // Now the review has sellerRating set (seller already reviewed)
    prismaMock.order.findUnique.mockResolvedValueOnce(
      makeOrder({
        review: {
          id: "review-1",
          orderId: "order-1",
          sellerRating: 5,
          sellerComment: "Great buyer!",
          sellerSubmittedAt: new Date(),
          buyerRating: null,
          buyerComment: null,
          buyerSubmittedAt: null,
          unblindedAt: null,
          createdAt: new Date(),
        },
      }),
    );
    prismaMock.$transaction.mockResolvedValueOnce([{}, {}]);

    const buyerResult = await submitBuyerReview("order-1", 4, "Good expert!");
    expect(buyerResult).toEqual({ success: true });

    // Transaction was used (review update + order status update)
    expect(prismaMock.$transaction).toHaveBeenCalled();

    // Both parties notified about unblinding
    const { createNotification: cn2 } = await import("@/lib/notifications");
    expect(cn2).toHaveBeenCalledTimes(2);
    expect(cn2).toHaveBeenCalledWith(
      BUYER_USER_ID,
      expect.stringContaining("Reviews are now visible"),
      expect.any(String),
      "success",
      expect.any(String),
    );
    expect(cn2).toHaveBeenCalledWith(
      SELLER_USER_ID,
      expect.stringContaining("Reviews are now visible"),
      expect.any(String),
      "success",
      expect.any(String),
    );
  });
});

describe("Integration: Review flow — 14-day timeout auto-unblind", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("auto-unblinds seller review when buyer has not reviewed after 14 days", async () => {
    buyerSession();

    const now = new Date();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-1",
      buyerId: BUYER_USER_ID,
      seller: { userId: SELLER_USER_ID },
      review: {
        id: "review-1",
        orderId: "order-1",
        sellerRating: 5,
        sellerComment: "Great buyer",
        sellerSubmittedAt: fifteenDaysAgo,
        buyerRating: null,
        buyerComment: null,
        buyerSubmittedAt: null,
        unblindedAt: null,
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
    });
    prismaMock.review.update.mockResolvedValueOnce({});

    const result = await getReviewForOrder("order-1");

    expect(result.review).not.toBeNull();
    expect(result.review!.isUnblinded).toBe(true);
    // Buyer can now see seller review
    expect(result.review!.sellerRating).toBe(5);
    expect(result.review!.sellerComment).toBe("Great buyer");

    // Auto-unblind was persisted to DB
    expect(prismaMock.review.update).toHaveBeenCalledWith({
      where: { id: "review-1" },
      data: { unblindedAt: expect.any(Date) },
    });
  });
});

describe("Integration: Review flow — duplicate review prevention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prevents seller from submitting a second review", async () => {
    sellerSession();

    prismaMock.order.findUnique.mockResolvedValueOnce(
      makeOrder({
        review: {
          id: "review-1",
          orderId: "order-1",
          sellerRating: 4,
          sellerComment: "Already reviewed",
          sellerSubmittedAt: new Date(),
          buyerRating: null,
          buyerComment: null,
          buyerSubmittedAt: null,
          unblindedAt: null,
          createdAt: new Date(),
        },
      }),
    );
    prismaMock.review.updateMany.mockResolvedValueOnce({ count: 0 });

    const result = await submitSellerReview("order-1", 5, "Second review attempt");
    expect(result).toEqual({ error: "You have already submitted a review" });
  });

  it("prevents buyer from submitting a second review", async () => {
    buyerSession();

    prismaMock.order.findUnique.mockResolvedValueOnce(
      makeOrder({
        review: {
          id: "review-1",
          orderId: "order-1",
          sellerRating: null,
          sellerComment: null,
          sellerSubmittedAt: null,
          buyerRating: 3,
          buyerComment: "Already reviewed",
          buyerSubmittedAt: new Date(),
          unblindedAt: null,
          createdAt: new Date(),
        },
      }),
    );

    const result = await submitBuyerReview("order-1", 5, "Second review attempt");
    expect(result).toEqual({ error: "You have already submitted a review" });
  });
});

describe("Integration: Review flow — rating validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { rating: 0, label: "rating 0 (below minimum)" },
    { rating: 6, label: "rating 6 (above maximum)" },
    { rating: 3.5, label: "rating 3.5 (non-integer)" },
  ])("rejects seller review with $label", async ({ rating }) => {
    sellerSession();
    const result = await submitSellerReview("order-1", rating, "Invalid");
    expect(result).toEqual({ error: "Rating must be between 1 and 5" });
  });

  it.each([
    { rating: 0, label: "rating 0 (below minimum)" },
    { rating: 6, label: "rating 6 (above maximum)" },
    { rating: 3.5, label: "rating 3.5 (non-integer)" },
  ])("rejects buyer review with $label", async ({ rating }) => {
    buyerSession();
    const result = await submitBuyerReview("order-1", rating, "Invalid");
    expect(result).toEqual({ error: "Rating must be between 1 and 5" });
  });
});
