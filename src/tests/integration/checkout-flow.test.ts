import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import "../mocks/stripe";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";
import { cancelOrder } from "@/actions/orders";
import { createJobPost, markJobAsPaid } from "@/actions/jobs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const BUYER_USER_ID = "buyer-1";
const BUSINESS_USER_ID = "business-user-1";

function buyerSession() {
  setMockSession({
    user: { id: BUYER_USER_ID, email: "buyer@example.com", name: "Buyer", role: "BUSINESS" },
  });
}

function businessSession() {
  setMockSession({
    user: { id: BUSINESS_USER_ID, email: "biz@example.com", name: "Business", role: "BUSINESS" },
  });
}

// ---------------------------------------------------------------------------
// Tests: Order creation → status transitions → cancellation
// ---------------------------------------------------------------------------
describe("Integration: Order creation and cancellation flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buyerSession();
  });

  it("draft order can be created and then cancelled (hard-deleted)", async () => {
    // Simulate an order that was created via checkout but payment not yet completed
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-1",
      buyerId: BUYER_USER_ID,
      sellerId: "specialist-1",
      status: "draft",
      milestones: [
        { title: "Setup", description: "Initial setup", price: 50, status: "pending_payment" },
      ],
    });
    prismaMock.order.delete.mockResolvedValueOnce({});

    const result = await cancelOrder("order-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.order.delete).toHaveBeenCalledWith({ where: { id: "order-1" } });
  });

  it("paid order with unfunded milestones can be cancelled as refunded", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-2",
      buyerId: BUYER_USER_ID,
      sellerId: "specialist-1",
      status: "paid_pending_implementation",
      milestones: [
        { title: "Milestone 1", status: "pending_payment", price: 100 },
        { title: "Milestone 2", status: "waiting", price: 200 },
      ],
    });
    prismaMock.order.update.mockResolvedValueOnce({});

    const result = await cancelOrder("order-2");
    expect(result).toEqual({ success: true });
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "order-2" },
      data: { status: "refunded", refundedAt: expect.any(Date) },
    });
  });

  it("order with funded milestone transitions to disputed on cancel", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-3",
      buyerId: BUYER_USER_ID,
      sellerId: "specialist-1",
      status: "in_progress",
      milestones: [
        { title: "Milestone 1", status: "released", price: 100 },
        { title: "Milestone 2", status: "in_escrow", price: 200 },
      ],
    });
    prismaMock.$transaction.mockResolvedValueOnce([{}, {}]);
    prismaMock.specialistProfile.findUnique.mockResolvedValueOnce({
      userId: "seller-user-1",
    });

    const result = await cancelOrder("order-3");
    expect(result).toEqual({ success: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

describe("Integration: Order status transitions across different states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buyerSession();
  });

  it("unauthenticated user cannot cancel an order", async () => {
    setMockSession(null);
    const result = await cancelOrder("order-1");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("non-owner cannot cancel an order", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce({
      id: "order-1",
      buyerId: "other-user",
      sellerId: "specialist-1",
      status: "draft",
      milestones: null,
    });

    const result = await cancelOrder("order-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("cancel nonexistent order returns error", async () => {
    prismaMock.order.findUnique.mockResolvedValueOnce(null);

    const result = await cancelOrder("nonexistent");
    expect(result).toEqual({ error: "Order not found" });
  });
});

describe("Integration: Job payment status transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    businessSession();
  });

  it("job transitions from pending_payment to open after payment", async () => {
    // Step 1: Create job
    prismaMock.jobPost.create.mockResolvedValueOnce({
      id: "job-1",
      buyerId: BUSINESS_USER_ID,
      status: "pending_payment",
    });

    const fd = new FormData();
    fd.set("title", "Automate invoicing");
    fd.set("goal", "Auto-generate invoices from CRM data");
    fd.set("category", "Finance");
    fd.set("budgetRange", "$500-$1000");
    fd.set("timeline", "1 week");
    fd.set("tools", "QuickBooks");

    const createResult = await createJobPost(null, fd);
    expect(createResult).toEqual({ success: true, jobId: "job-1" });

    // Step 2: Mark as paid
    vi.clearAllMocks();
    businessSession();

    prismaMock.jobPost.findUnique.mockResolvedValueOnce({
      id: "job-1",
      buyerId: BUSINESS_USER_ID,
      status: "pending_payment",
    });
    prismaMock.jobPost.update.mockResolvedValueOnce({
      id: "job-1",
      status: "open",
      category: "Finance",
    });
    prismaMock.specialistProfile.findMany.mockResolvedValueOnce([]);

    const payResult = await markJobAsPaid("job-1");
    expect(payResult).toEqual({ success: true });
    expect(prismaMock.jobPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "job-1" },
        data: expect.objectContaining({
          status: "open",
          paidAt: expect.any(Date),
        }),
      })
    );
  });

  it("cannot pay for another user's job", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValueOnce({
      id: "job-2",
      buyerId: "other-business",
      status: "pending_payment",
    });

    const result = await markJobAsPaid("job-2");
    expect(result).toEqual({ error: "Job not found or unauthorized" });
  });

  it("cannot pay for nonexistent job", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValueOnce(null);

    const result = await markJobAsPaid("nonexistent");
    expect(result).toEqual({ error: "Job not found or unauthorized" });
  });
});

describe("Integration: Job creation validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    businessSession();
  });

  it("rejects job creation with missing required fields", async () => {
    const fd = new FormData();
    fd.set("title", "");
    fd.set("goal", "Some goal");
    fd.set("category", "CRM");
    fd.set("budgetRange", "$1000-$5000");
    fd.set("timeline", "2 weeks");

    const result = await createJobPost(null, fd);
    expect(result).toEqual({ error: "All required fields must be filled." });
  });

  it("rejects job creation from non-BUSINESS user", async () => {
    setMockSession({
      user: { id: "specialist-1", email: "spec@example.com", name: "Spec", role: "SPECIALIST" },
    });

    const fd = new FormData();
    fd.set("title", "Need automation");
    fd.set("goal", "Automate things");
    fd.set("category", "CRM");
    fd.set("budgetRange", "$1000");
    fd.set("timeline", "1 week");
    fd.set("tools", "Zapier");

    const result = await createJobPost(null, fd);
    expect(result).toEqual({ error: "Unauthorized. Only businesses can post jobs." });
  });

  it("handles empty tools string gracefully", async () => {
    prismaMock.jobPost.create.mockResolvedValueOnce({
      id: "job-3",
      buyerId: BUSINESS_USER_ID,
      status: "pending_payment",
    });

    const fd = new FormData();
    fd.set("title", "Simple task");
    fd.set("goal", "Do the thing");
    fd.set("category", "Other");
    fd.set("budgetRange", "$100-$500");
    fd.set("timeline", "3 days");
    fd.set("tools", "");

    const result = await createJobPost(null, fd);
    expect(result).toEqual({ success: true, jobId: "job-3" });
    expect(prismaMock.jobPost.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tools: [],
      }),
    });
  });
});
