// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import "../mocks/stripe";
import { prismaMock } from "../mocks/prisma";
import { setMockSession, setMockRole } from "../mocks/next-auth";

import {
  createJobPost,
  createDiscoveryJobPost,
  markJobAsPaid,
  submitBid,
  awardBid,
} from "@/actions/jobs";

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

// ── createJobPost ────────────────────────────────────────────────────────────

describe("createJobPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "biz@example.com", name: "Biz User", role: "BUSINESS" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const fd = makeFormData({ title: "Test" });
    const result = await createJobPost(null, fd);
    expect(result).toEqual({ error: "Unauthorized. Only businesses can post jobs." });
  });

  it("returns error when user role is not BUSINESS", async () => {
    setMockRole("SPECIALIST");
    const fd = makeFormData({ title: "Test" });
    const result = await createJobPost(null, fd);
    expect(result).toEqual({ error: "Unauthorized. Only businesses can post jobs." });
  });

  it("returns error when required fields are missing", async () => {
    const fd = makeFormData({ title: "Test Job" });
    // Missing goal, category, budgetRange, timeline
    const result = await createJobPost(null, fd);
    expect(result).toEqual({ error: "All required fields must be filled." });
  });

  it("creates job post successfully with all required fields", async () => {
    prismaMock.jobPost.create.mockResolvedValue({ id: "job-1" });

    const fd = makeFormData({
      title: "Automate My CRM",
      goal: "Reduce manual data entry",
      category: "CRM",
      budgetRange: "$500-$1000",
      timeline: "2 weeks",
      tools: "Zapier, Make",
    });

    const result = await createJobPost(null, fd);
    expect(result).toEqual({ success: true, jobId: "job-1" });
    expect(prismaMock.jobPost.create).toHaveBeenCalledWith({
      data: {
        buyerId: "user-1",
        title: "Automate My CRM",
        goal: "Reduce manual data entry",
        category: "CRM",
        budgetRange: "$500-$1000",
        timeline: "2 weeks",
        tools: ["Zapier", "Make"],
        status: "pending_payment",
      },
    });
  });

  it("handles empty tools field gracefully", async () => {
    prismaMock.jobPost.create.mockResolvedValue({ id: "job-2" });

    const fd = makeFormData({
      title: "Test Job",
      goal: "Goal",
      category: "Category",
      budgetRange: "$100",
      timeline: "1 week",
    });

    const result = await createJobPost(null, fd);
    expect(result).toEqual({ success: true, jobId: "job-2" });
    expect(prismaMock.jobPost.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tools: [] }),
      })
    );
  });

  it("returns error when prisma throws", async () => {
    prismaMock.jobPost.create.mockRejectedValue(new Error("DB error"));

    const fd = makeFormData({
      title: "Test",
      goal: "Goal",
      category: "Cat",
      budgetRange: "$100",
      timeline: "1 week",
    });

    const result = await createJobPost(null, fd);
    expect(result).toEqual({ error: "Failed to create job post." });
  });
});

// ── createDiscoveryJobPost ───────────────────────────────────────────────────

describe("createDiscoveryJobPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "biz@example.com", name: "Biz User", role: "BUSINESS" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const fd = makeFormData({ title: "Test" });
    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: false, error: "Unauthorized. Only businesses can post jobs." });
  });

  it("returns error when user role is not BUSINESS", async () => {
    setMockRole("SPECIALIST");
    const fd = makeFormData({ title: "Test" });
    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: false, error: "Unauthorized. Only businesses can post jobs." });
  });

  it("returns error when required fields are missing", async () => {
    const fd = makeFormData({ title: "Test" });
    // Missing goal
    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: false, error: "Missing required fields." });
  });

  it("creates discovery job post successfully", async () => {
    prismaMock.jobPost.create.mockResolvedValue({ id: "disc-1" });

    const fd = makeFormData({
      title: "Discover automation opportunities",
      goal: "Find ways to automate manual tasks",
      tools: "Slack,HubSpot",
    });

    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: true, jobId: "disc-1" });
    expect(prismaMock.jobPost.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        buyerId: "user-1",
        category: "Discovery Scan",
        tools: ["Slack", "HubSpot"],
        status: "pending_payment",
      }),
    });
  });
});

// ── markJobAsPaid ────────────────────────────────────────────────────────────

describe("markJobAsPaid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "biz@example.com", name: "Biz User", role: "BUSINESS" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const result = await markJobAsPaid("job-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when job not found", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue(null);
    const result = await markJobAsPaid("nonexistent");
    expect(result).toEqual({ error: "Job not found or unauthorized" });
  });

  it("returns error when job belongs to another user", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue({ id: "job-1", buyerId: "other-user" });
    const result = await markJobAsPaid("job-1");
    expect(result).toEqual({ error: "Job not found or unauthorized" });
  });

  it("marks job as paid successfully", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue({ id: "job-1", buyerId: "user-1" });
    // activateJobPost calls jobPost.update then specialistProfile.findMany for notifications
    prismaMock.jobPost.update.mockResolvedValue({ id: "job-1", category: "CRM" });
    prismaMock.specialistProfile.findMany.mockResolvedValue([]);

    const result = await markJobAsPaid("job-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.jobPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "job-1" },
        data: expect.objectContaining({
          status: "open",
          paidAt: expect.any(Date),
        }),
      }),
    );
  });
});

// ── submitBid ────────────────────────────────────────────────────────────────

describe("submitBid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "expert@example.com", name: "Expert User", role: "EXPERT" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const fd = makeFormData({ jobId: "job-1", message: "I can help", estimatedTime: "1 week", priceEstimate: "$500" });
    const result = await submitBid(null, fd);
    expect(result).toEqual({ error: "You must be signed in as an expert to submit a proposal." });
  });

  it("returns error when user role is not EXPERT", async () => {
    setMockRole("BUSINESS");
    const fd = makeFormData({ jobId: "job-1", message: "I can help", estimatedTime: "1 week", priceEstimate: "$500" });
    const result = await submitBid(null, fd);
    expect(result).toEqual({ error: "You must be signed in as an expert to submit a proposal." });
  });

  it("returns error when required fields are missing", async () => {
    const fd = makeFormData({ jobId: "job-1" });
    const result = await submitBid(null, fd);
    expect(result).toEqual({ error: "Executive summary, timeline, and price are all required." });
  });

  it("returns error when specialist is not ELITE tier", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue({
      id: "job-1", status: "open", category: "CRM", buyerId: "other-user", title: "Test",
    });
    prismaMock.specialistProfile.findUnique.mockResolvedValue({
      id: "sp-1", userId: "user-1", tier: "STANDARD", status: "APPROVED", isFoundingExpert: false,
    });

    const fd = makeFormData({ jobId: "job-1", message: "I can help", estimatedTime: "1 week", priceEstimate: "$500" });
    const result = await submitBid(null, fd);
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("Elite");
  });

  it("returns error when specialist profile not found", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue({
      id: "job-1", status: "open", category: "CRM", buyerId: "other-user", title: "Test",
    });
    prismaMock.specialistProfile.findUnique.mockResolvedValue(null);

    const fd = makeFormData({ jobId: "job-1", message: "I can help", estimatedTime: "1 week", priceEstimate: "$500" });
    const result = await submitBid(null, fd);
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("profile");
  });

  it("returns error when specialist already bid on this job", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue({
      id: "job-1", status: "open", category: "CRM", buyerId: "other-user", title: "Test",
    });
    prismaMock.specialistProfile.findUnique.mockResolvedValue({
      id: "sp-1", userId: "user-1", tier: "ELITE", status: "APPROVED", isFoundingExpert: false,
    });
    // Transaction will throw DUPLICATE
    prismaMock.$transaction.mockRejectedValue(new Error("DUPLICATE"));

    const fd = makeFormData({ jobId: "job-1", message: "I can help", estimatedTime: "1 week", priceEstimate: "$500" });
    const result = await submitBid(null, fd);
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("already submitted");
  });

  it("creates bid successfully for ELITE specialist", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue({
      id: "job-1", status: "open", category: "CRM", buyerId: "other-user", title: "Test",
    });
    prismaMock.specialistProfile.findUnique.mockResolvedValue({
      id: "sp-1", userId: "user-1", tier: "ELITE", status: "APPROVED", isFoundingExpert: false,
    });
    prismaMock.$transaction.mockResolvedValue({});

    const fd = makeFormData({
      jobId: "job-1",
      message: "I can automate this for you",
      estimatedTime: "2 weeks",
      priceEstimate: "$500",
    });

    const result = await submitBid(null, fd);
    expect(result).toEqual({ success: true });
  });
});

// ── awardBid ─────────────────────────────────────────────────────────────────

describe("awardBid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "biz@example.com", name: "Biz User", role: "BUSINESS" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const result = await awardBid("job-1", "bid-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when job not found", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue(null);
    const result = await awardBid("job-1", "bid-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when job belongs to another user", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue({ id: "job-1", buyerId: "other-user" });
    const result = await awardBid("job-1", "bid-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when bid not found", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue({
      id: "job-1", buyerId: "user-1", status: "open",
    });
    prismaMock.bid.findUnique.mockResolvedValue(null);
    const result = await awardBid("job-1", "bid-1");
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("not found");
  });

  it("awards bid successfully via $transaction", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue({
      id: "job-1",
      buyerId: "user-1",
      status: "open",
      title: "Test Job",
      buyer: { id: "user-1" },
    });
    prismaMock.bid.findUnique.mockResolvedValue({
      id: "bid-1",
      specialistId: "sp-1",
      status: "submitted",
      priceEstimate: "500",
      proposedApproach: null,
      specialist: { id: "sp-1", userId: "expert-user-1", status: "APPROVED", user: { id: "expert-user-1" } },
    });

    const mockTx = {
      jobPost: { findUnique: vi.fn().mockResolvedValue({ id: "job-1", status: "open" }), update: vi.fn() },
      bid: { update: vi.fn() },
      order: { create: vi.fn().mockResolvedValue({ id: "order-1" }) },
      conversation: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "conv-1" }),
        update: vi.fn(),
      },
      message: { create: vi.fn() },
    };
    prismaMock.$transaction.mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") {
        return cb(mockTx);
      }
      return Promise.all(cb as unknown[]);
    });

    // Post-transaction calls
    prismaMock.bid.findMany.mockResolvedValue([]);
    prismaMock.order.findFirst.mockResolvedValue({ id: "order-1" });

    const result = await awardBid("job-1", "bid-1");
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("orderId", "order-1");
  });
});
