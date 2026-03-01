import { describe, it, expect } from "vitest";
import {
  CheckoutBodySchema,
  ReleaseMilestoneSchema,
  WaitlistSchema,
} from "@/lib/schemas/api";

// ── CheckoutBodySchema ────────────────────────────────────────────────────────

describe("CheckoutBodySchema", () => {
  it("accepts a valid demo_booking body", () => {
    const result = CheckoutBodySchema.safeParse({
      solutionId: "550e8400-e29b-41d4-a716-446655440000",
      type: "demo_booking",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-UUID solutionId", () => {
    const result = CheckoutBodySchema.safeParse({ solutionId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown type string", () => {
    const result = CheckoutBodySchema.safeParse({
      solutionId: "550e8400-e29b-41d4-a716-446655440000",
      type: "hacked_type",
    });
    expect(result.success).toBe(false);
  });

  it("defaults isUpgrade to false when not provided", () => {
    const result = CheckoutBodySchema.safeParse({
      solutionId: "550e8400-e29b-41d4-a716-446655440000",
    });
    if (result.success) {
      expect(result.data.isUpgrade).toBe(false);
    }
  });
});

// ── ReleaseMilestoneSchema ────────────────────────────────────────────────────

describe("ReleaseMilestoneSchema", () => {
  it("accepts valid orderId and milestoneIndex", () => {
    const result = ReleaseMilestoneSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440000",
      milestoneIndex: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative milestoneIndex", () => {
    const result = ReleaseMilestoneSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440000",
      milestoneIndex: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing orderId", () => {
    const result = ReleaseMilestoneSchema.safeParse({ milestoneIndex: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer milestoneIndex", () => {
    const result = ReleaseMilestoneSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440000",
      milestoneIndex: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

// ── WaitlistSchema ────────────────────────────────────────────────────────────

describe("WaitlistSchema", () => {
  it("accepts a valid business signup", () => {
    const result = WaitlistSchema.safeParse({
      fullName: "Jane Smith",
      email: "jane@company.com",
      role: "business",
      consent: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = WaitlistSchema.safeParse({
      fullName: "Jane Smith",
      email: "not-an-email",
      role: "business",
      consent: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing consent", () => {
    const result = WaitlistSchema.safeParse({
      fullName: "Jane Smith",
      email: "jane@company.com",
      role: "business",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown role", () => {
    const result = WaitlistSchema.safeParse({
      fullName: "Jane Smith",
      email: "jane@company.com",
      role: "admin",
      consent: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = WaitlistSchema.safeParse({
      fullName: "J",
      email: "jane@company.com",
      role: "expert",
      consent: true,
    });
    expect(result.success).toBe(false);
  });
});
