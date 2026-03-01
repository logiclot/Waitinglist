import { describe, it, expect } from "vitest";
import {
  validateJobPost,
  validateDiscoveryScan,
  type JobPostData,
  type DiscoveryScanData,
} from "@/lib/validation";

// ── Custom Project (Job Post) ─────────────────────────────────────────────────

describe("validateJobPost", () => {
  function validJob(overrides: Partial<JobPostData> = {}): JobPostData {
    return {
      title: "Build a customer onboarding automation",
      goal: "Automatically welcome new customers, send them onboarding materials, and track progress in our CRM",
      category: "CRM",
      budgetRange: "€1,000 – €2,500",
      timeline: "4 weeks",
      ...overrides,
    };
  }

  it("passes a fully complete job post", () => {
    const result = validateJobPost(validJob());
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("fails when title is missing", () => {
    const result = validateJobPost(validJob({ title: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Title");
  });

  it("fails when title is only whitespace", () => {
    const result = validateJobPost(validJob({ title: "   " }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Title");
  });

  it("fails when goal/description is missing", () => {
    const result = validateJobPost(validJob({ goal: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Project description");
  });

  it("fails when category is missing", () => {
    const result = validateJobPost(validJob({ category: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Category");
  });

  it("fails when budget range is missing", () => {
    const result = validateJobPost(validJob({ budgetRange: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Budget range");
  });

  it("fails when timeline is missing", () => {
    const result = validateJobPost(validJob({ timeline: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Timeline");
  });

  it("fails when all fields are missing and lists them all", () => {
    const result = validateJobPost({});
    expect(result.valid).toBe(false);
    expect(result.missing).toHaveLength(5);
  });

  it("returns an error message listing missing fields", () => {
    const result = validateJobPost({ title: "My project" });
    expect(result.error).toMatch(/Missing required fields/);
    expect(result.error).toContain("Project description");
  });
});

// ── Discovery Scan ────────────────────────────────────────────────────────────

describe("validateDiscoveryScan", () => {
  function validScan(overrides: Partial<DiscoveryScanData> = {}): DiscoveryScanData {
    return {
      businessModel: "E-commerce SaaS",
      teamSize: "5–10",
      businessDescription: "We sell subscription software to small retailers and handle around 300 manual orders per month that we want to automate",
      timeDrain: "Manual order processing",
      growthGoal: "Scale to 10× volume without hiring",
      ...overrides,
    };
  }

  it("passes a fully complete discovery scan", () => {
    const result = validateDiscoveryScan(validScan());
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("fails when business model is missing", () => {
    const result = validateDiscoveryScan(validScan({ businessModel: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Business model");
  });

  it("fails when team size is missing", () => {
    const result = validateDiscoveryScan(validScan({ teamSize: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Team size");
  });

  it("fails when business description is missing", () => {
    const result = validateDiscoveryScan(validScan({ businessDescription: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Business description");
  });

  it("succeeds when optional fields (timeDrain, growthGoal) are absent", () => {
    const result = validateDiscoveryScan({
      businessModel: "Agency",
      teamSize: "1–4",
      businessDescription: "We run a digital marketing agency and want to automate client reporting",
    });
    expect(result.valid).toBe(true);
  });

  it("fails with all fields missing", () => {
    const result = validateDiscoveryScan({});
    expect(result.valid).toBe(false);
    expect(result.missing).toHaveLength(3);
  });

  it("returns an error message when fields are missing", () => {
    const result = validateDiscoveryScan({ businessModel: "SaaS" });
    expect(result.error).toMatch(/Missing required fields/);
    expect(result.error).toContain("Team size");
    expect(result.error).toContain("Business description");
  });
});
