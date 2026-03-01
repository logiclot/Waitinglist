// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
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
    const fd = makeFormData({ businessModel: "SaaS" });
    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: false, error: "Unauthorized. Only businesses can post jobs." });
  });

  it("returns error when user role is not BUSINESS", async () => {
    setMockRole("SPECIALIST");
    const fd = makeFormData({ businessModel: "SaaS" });
    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: false, error: "Unauthorized. Only businesses can post jobs." });
  });

  it("returns error when required fields are missing", async () => {
    const fd = makeFormData({ businessModel: "SaaS" });
    // Missing teamSize and businessDescription
    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: false, error: "Missing required fields." });
  });

  it("creates discovery job post successfully", async () => {
    prismaMock.jobPost.create.mockResolvedValue({ id: "disc-1" });

    const fd = makeFormData({
      businessModel: "SaaS",
      teamSize: "10-50",
      timeDrain: "Data entry",
      workflowVolume: "500/month",
      stack: "Slack,HubSpot",
      communicationHub: "Slack",
      businessDescription: "We build software tools for SMBs.",
      growthGoal: "Double revenue",
    });

    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: true, jobId: "disc-1" });
    expect(prismaMock.jobPost.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        buyerId: "user-1",
        category: "Discovery",
        budgetRange: "$50 (Discovery)",
        timeline: "Discovery Phase",
        tools: ["Slack", "HubSpot"],
        status: "open",
        paymentProvider: "stripe_stub",
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
    prismaMock.jobPost.update.mockResolvedValue({});

    const result = await markJobAsPaid("job-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.jobPost.update).toHaveBeenCalledWith({
      where: { id: "job-1" },
      data: expect.objectContaining({
        status: "open",
        paymentProvider: "simulated",
        paymentIntentId: "sim_12345",
      }),
    });
  });
});

// ── submitBid ────────────────────────────────────────────────────────────────

describe("submitBid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "expert@example.com", name: "Expert User", role: "SPECIALIST" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const fd = makeFormData({ jobId: "job-1", message: "I can help", estimatedTime: "1 week" });
    const result = await submitBid(null, fd);
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when user role is not SPECIALIST", async () => {
    setMockRole("BUSINESS");
    const fd = makeFormData({ jobId: "job-1", message: "I can help", estimatedTime: "1 week" });
    const result = await submitBid(null, fd);
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when required fields are missing", async () => {
    const fd = makeFormData({ jobId: "job-1" });
    const result = await submitBid(null, fd);
    expect(result).toEqual({ error: "Message and time estimate are required." });
  });

  it("returns error when specialist is not ELITE tier", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "sp-1", userId: "user-1", tier: "STANDARD" });

    const fd = makeFormData({ jobId: "job-1", message: "I can help", estimatedTime: "1 week" });
    const result = await submitBid(null, fd);
    expect(result).toEqual({ error: "Only Elite specialists can bid on jobs." });
  });

  it("returns error when specialist profile not found", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue(null);

    const fd = makeFormData({ jobId: "job-1", message: "I can help", estimatedTime: "1 week" });
    const result = await submitBid(null, fd);
    expect(result).toEqual({ error: "Only Elite specialists can bid on jobs." });
  });

  it("returns error when specialist already bid on this job", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "sp-1", userId: "user-1", tier: "ELITE" });
    prismaMock.bid.findUnique.mockResolvedValue({ id: "existing-bid" });

    const fd = makeFormData({ jobId: "job-1", message: "I can help", estimatedTime: "1 week" });
    const result = await submitBid(null, fd);
    expect(result).toEqual({ error: "You have already placed a bid on this job." });
  });

  it("creates bid successfully for ELITE specialist", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "sp-1", userId: "user-1", tier: "ELITE" });
    prismaMock.bid.findUnique.mockResolvedValue(null);
    prismaMock.bid.create.mockResolvedValue({ id: "bid-1" });

    const fd = makeFormData({
      jobId: "job-1",
      message: "I can automate this for you",
      estimatedTime: "2 weeks",
      priceEstimate: "$500",
    });

    const result = await submitBid(null, fd);
    expect(result).toEqual({ success: true });
    expect(prismaMock.bid.create).toHaveBeenCalledWith({
      data: {
        jobPostId: "job-1",
        specialistId: "sp-1",
        message: "I can automate this for you",
        estimatedTime: "2 weeks",
        priceEstimate: "$500",
        status: "submitted",
      },
    });
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
    prismaMock.jobPost.findUnique.mockResolvedValue({ id: "job-1", buyerId: "user-1", buyer: { id: "user-1" } });
    prismaMock.bid.findUnique.mockResolvedValue(null);
    const result = await awardBid("job-1", "bid-1");
    expect(result).toEqual({ error: "Bid not found" });
  });

  it("awards bid, creates conversation and system message via $transaction", async () => {
    prismaMock.jobPost.findUnique.mockResolvedValue({
      id: "job-1",
      buyerId: "user-1",
      buyer: { id: "user-1" },
    });
    prismaMock.bid.findUnique.mockResolvedValue({
      id: "bid-1",
      specialistId: "sp-1",
      specialist: { id: "sp-1", user: { id: "expert-user-1" } },
    });

    const mockTx = {
      jobPost: { update: vi.fn() },
      bid: { update: vi.fn() },
      conversation: { create: vi.fn().mockResolvedValue({ id: "conv-1" }) },
      message: { create: vi.fn() },
    };
    prismaMock.$transaction.mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") {
        return cb(mockTx);
      }
      return Promise.all(cb as unknown[]);
    });

    const result = await awardBid("job-1", "bid-1");
    expect(result).toEqual({ success: true });

    expect(mockTx.jobPost.update).toHaveBeenCalledWith({
      where: { id: "job-1" },
      data: { status: "awarded" },
    });
    expect(mockTx.bid.update).toHaveBeenCalledWith({
      where: { id: "bid-1" },
      data: { status: "accepted" },
    });
    expect(mockTx.conversation.create).toHaveBeenCalledWith({
      data: {
        buyerId: "user-1",
        sellerId: "sp-1",
        jobPostId: "job-1",
      },
    });
    expect(mockTx.message.create).toHaveBeenCalledWith({
      data: {
        conversationId: "conv-1",
        senderId: "user-1",
        body: "I've accepted your bid! Let's discuss the details here.",
        type: "user",
      },
    });
  });
});
