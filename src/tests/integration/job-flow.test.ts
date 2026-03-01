import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";
import {
  createJobPost,
  markJobAsPaid,
  submitBid,
  awardBid,
  createDiscoveryJobPost,
} from "@/actions/jobs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const BUSINESS_USER_ID = "business-user-1";
const SPECIALIST_USER_ID = "specialist-user-1";

function businessSession() {
  setMockSession({
    user: { id: BUSINESS_USER_ID, email: "biz@example.com", name: "Business User", role: "BUSINESS" },
  });
}

function specialistSession() {
  setMockSession({
    user: { id: SPECIALIST_USER_ID, email: "spec@example.com", name: "Specialist User", role: "SPECIALIST" },
  });
}

function makeJobFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("title", "Need CRM automation");
  fd.set("goal", "Automate sales pipeline");
  fd.set("category", "CRM");
  fd.set("budgetRange", "$1000-$5000");
  fd.set("timeline", "2 weeks");
  fd.set("tools", "Zapier, HubSpot");
  for (const [k, v] of Object.entries(overrides)) {
    fd.set(k, v);
  }
  return fd;
}

function makeBidFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("jobId", "job-1");
  fd.set("message", "I can help with this");
  fd.set("estimatedTime", "1 week");
  fd.set("priceEstimate", "$2000");
  for (const [k, v] of Object.entries(overrides)) {
    fd.set(k, v);
  }
  return fd;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Integration: Full job lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("business creates job, pays, specialist bids, business awards bid", async () => {
    // ── Step 1: Business creates job post ──────────────────────────────────────
    businessSession();

    prismaMock.jobPost.create.mockResolvedValueOnce({
      id: "job-1",
      buyerId: BUSINESS_USER_ID,
      title: "Need CRM automation",
      status: "pending_payment",
    });

    const createResult = await createJobPost(null, makeJobFormData());
    expect(createResult).toEqual({ success: true, jobId: "job-1" });
    expect(prismaMock.jobPost.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        buyerId: BUSINESS_USER_ID,
        title: "Need CRM automation",
        goal: "Automate sales pipeline",
        category: "CRM",
        budgetRange: "$1000-$5000",
        timeline: "2 weeks",
        tools: ["Zapier", "HubSpot"],
        status: "pending_payment",
      }),
    });

    // ── Step 2: Business marks job as paid ─────────────────────────────────────
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
    });

    const payResult = await markJobAsPaid("job-1");
    expect(payResult).toEqual({ success: true });
    expect(prismaMock.jobPost.update).toHaveBeenCalledWith({
      where: { id: "job-1" },
      data: expect.objectContaining({
        status: "open",
        paidAt: expect.any(Date),
        paymentProvider: "simulated",
        paymentIntentId: "sim_12345",
      }),
    });

    // ── Step 3: Specialist submits bid ─────────────────────────────────────────
    vi.clearAllMocks();
    specialistSession();

    prismaMock.specialistProfile.findUnique.mockResolvedValueOnce({
      id: "specialist-profile-1",
      userId: SPECIALIST_USER_ID,
      tier: "ELITE",
    });
    prismaMock.bid.findUnique.mockResolvedValueOnce(null); // No existing bid
    prismaMock.bid.create.mockResolvedValueOnce({
      id: "bid-1",
      jobPostId: "job-1",
      specialistId: "specialist-profile-1",
      status: "submitted",
    });

    const bidResult = await submitBid(null, makeBidFormData());
    expect(bidResult).toEqual({ success: true });
    expect(prismaMock.bid.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobPostId: "job-1",
        specialistId: "specialist-profile-1",
        message: "I can help with this",
        estimatedTime: "1 week",
        priceEstimate: "$2000",
        status: "submitted",
      }),
    });

    // ── Step 4: Business awards bid ────────────────────────────────────────────
    vi.clearAllMocks();
    businessSession();

    prismaMock.jobPost.findUnique.mockResolvedValueOnce({
      id: "job-1",
      buyerId: BUSINESS_USER_ID,
      status: "open",
      buyer: { id: BUSINESS_USER_ID },
    });
    prismaMock.bid.findUnique.mockResolvedValueOnce({
      id: "bid-1",
      jobPostId: "job-1",
      specialistId: "specialist-profile-1",
      specialist: { id: "specialist-profile-1", user: { id: SPECIALIST_USER_ID } },
    });
    // awardBid uses interactive $transaction (callback pattern)
    prismaMock.$transaction.mockImplementationOnce(async (cb: unknown) => {
      if (typeof cb === "function") {
        return cb({
          jobPost: { update: vi.fn().mockResolvedValue({}) },
          bid: { update: vi.fn().mockResolvedValue({}) },
          conversation: { create: vi.fn().mockResolvedValue({ id: "conv-1" }) },
          message: { create: vi.fn().mockResolvedValue({}) },
        });
      }
      return Promise.all(cb as Promise<unknown>[]);
    });

    const awardResult = await awardBid("job-1", "bid-1");
    expect(awardResult).toEqual({ success: true });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

describe("Integration: Bid restrictions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("non-ELITE specialist cannot bid", async () => {
    specialistSession();

    prismaMock.specialistProfile.findUnique.mockResolvedValueOnce({
      id: "specialist-profile-1",
      userId: SPECIALIST_USER_ID,
      tier: "STANDARD",
    });

    const result = await submitBid(null, makeBidFormData());
    expect(result).toEqual({ error: "Only Elite specialists can bid on jobs." });
  });

  it("specialist with no profile cannot bid", async () => {
    specialistSession();

    prismaMock.specialistProfile.findUnique.mockResolvedValueOnce(null);

    const result = await submitBid(null, makeBidFormData());
    expect(result).toEqual({ error: "Only Elite specialists can bid on jobs." });
  });

  it("specialist cannot bid twice on the same job", async () => {
    specialistSession();

    prismaMock.specialistProfile.findUnique.mockResolvedValueOnce({
      id: "specialist-profile-1",
      userId: SPECIALIST_USER_ID,
      tier: "ELITE",
    });
    prismaMock.bid.findUnique.mockResolvedValueOnce({
      id: "existing-bid",
      jobPostId: "job-1",
      specialistId: "specialist-profile-1",
    });

    const result = await submitBid(null, makeBidFormData());
    expect(result).toEqual({ error: "You have already placed a bid on this job." });
  });
});

describe("Integration: Discovery job flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a discovery job post with status open", async () => {
    businessSession();

    prismaMock.jobPost.create.mockResolvedValueOnce({
      id: "disc-job-1",
      buyerId: BUSINESS_USER_ID,
      title: "Discovery: SaaS Automation",
      status: "open",
    });

    const fd = new FormData();
    fd.set("businessModel", "SaaS");
    fd.set("teamSize", "10-50");
    fd.set("timeDrain", "Manual data entry");
    fd.set("workflowVolume", "1000+/month");
    fd.set("stack", "Slack,HubSpot");
    fd.set("communicationHub", "Slack");
    fd.set("businessDescription", "We run a SaaS platform with many manual processes");
    fd.set("growthGoal", "Scale operations without hiring");

    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: true, jobId: "disc-job-1" });
    expect(prismaMock.jobPost.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        buyerId: BUSINESS_USER_ID,
        category: "Discovery",
        status: "open",
        paidAt: expect.any(Date),
        paymentProvider: "stripe_stub",
      }),
    });
  });

  it("rejects discovery job when required fields are missing", async () => {
    businessSession();

    const fd = new FormData();
    fd.set("businessModel", "");
    fd.set("teamSize", "10-50");
    fd.set("businessDescription", "Some description");

    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: false, error: "Missing required fields." });
  });

  it("rejects discovery job when user is not a business", async () => {
    specialistSession();

    const fd = new FormData();
    fd.set("businessModel", "SaaS");
    fd.set("teamSize", "10-50");
    fd.set("businessDescription", "Test description");

    const result = await createDiscoveryJobPost(fd);
    expect(result).toEqual({ success: false, error: "Unauthorized. Only businesses can post jobs." });
  });
});
