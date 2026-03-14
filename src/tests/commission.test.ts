import { describe, it, expect } from "vitest";
import {
  getExpertTierLabel,
  getCommissionPercent,
  computePlatformFeeCents,
  computeExpertPayoutCents,
  formatCentsToCurrency,
  TIER_THRESHOLDS,
  SALES_THRESHOLDS,
  type CommissionExpert,
} from "@/lib/commission";

function makeExpert(overrides: Partial<CommissionExpert> = {}): CommissionExpert {
  return {
    id: "test-id",
    name: "Test Expert",
    verified: true,
    founding: false,
    isFoundingExpert: false,
    completed_sales_count: 0,
    tools: [],
    ...overrides,
  };
}

// ── getExpertTierLabel ────────────────────────────────────────────────────────

describe("getExpertTierLabel", () => {
  it("returns 'founding' when isFoundingExpert is true, regardless of sales", () => {
    const expert = makeExpert({ isFoundingExpert: true, completed_sales_count: 0 });
    expect(getExpertTierLabel(expert)).toBe("founding");
  });

  it("returns 'founding' when isFoundingExpert is true with high sales", () => {
    const expert = makeExpert({ isFoundingExpert: true, completed_sales_count: 100 });
    expect(getExpertTierLabel(expert)).toBe("founding");
  });

  it("returns 'standard' for 0 sales", () => {
    expect(getExpertTierLabel(makeExpert({ completed_sales_count: 0 }))).toBe("standard");
  });

  it("returns 'standard' for 4 sales (below PROVEN threshold)", () => {
    expect(getExpertTierLabel(makeExpert({ completed_sales_count: 4 }))).toBe("standard");
  });

  it(`returns 'proven' at exactly ${SALES_THRESHOLDS.PROVEN} sales`, () => {
    expect(getExpertTierLabel(makeExpert({ completed_sales_count: SALES_THRESHOLDS.PROVEN }))).toBe("proven");
  });

  it("returns 'proven' for 9 sales (below ELITE threshold, no DB tier)", () => {
    expect(getExpertTierLabel(makeExpert({ completed_sales_count: 9 }))).toBe("proven");
  });

  it("returns 'elite' when DB tier is ELITE", () => {
    expect(getExpertTierLabel(makeExpert({ tier: "ELITE", completed_sales_count: 10 }))).toBe("elite");
  });

  it("returns 'proven' for 10+ sales WITHOUT Elite DB tier (application-based)", () => {
    expect(getExpertTierLabel(makeExpert({ completed_sales_count: 10 }))).toBe("proven");
  });

  it("returns 'elite' for ELITE DB tier regardless of sales count", () => {
    expect(getExpertTierLabel(makeExpert({ tier: "ELITE", completed_sales_count: 5 }))).toBe("elite");
  });
});

// ── getCommissionPercent ──────────────────────────────────────────────────────

describe("getCommissionPercent", () => {
  it("returns STANDARD fee for a new expert", () => {
    expect(getCommissionPercent(makeExpert())).toBe(TIER_THRESHOLDS.STANDARD);
  });

  it("returns PROVEN fee for an expert with 5+ sales", () => {
    expect(getCommissionPercent(makeExpert({ completed_sales_count: SALES_THRESHOLDS.PROVEN }))).toBe(TIER_THRESHOLDS.PROVEN);
  });

  it("returns PROVEN fee (not ELITE) for 10+ sales without Elite DB tier", () => {
    expect(getCommissionPercent(makeExpert({ completed_sales_count: SALES_THRESHOLDS.ELITE }))).toBe(TIER_THRESHOLDS.PROVEN);
  });

  it("returns ELITE fee when DB tier is ELITE", () => {
    expect(getCommissionPercent(makeExpert({ tier: "ELITE", completed_sales_count: 10 }))).toBe(TIER_THRESHOLDS.ELITE);
  });

  it("returns FOUNDING fee for a founding expert (isFoundingExpert)", () => {
    expect(getCommissionPercent(makeExpert({ isFoundingExpert: true }))).toBe(TIER_THRESHOLDS.FOUNDING);
  });

  it("returns FOUNDING fee for a founding expert with sales", () => {
    expect(getCommissionPercent(makeExpert({ isFoundingExpert: true, completed_sales_count: 50 }))).toBe(TIER_THRESHOLDS.FOUNDING);
  });

  it("honours admin commission_override_percent over all other rules", () => {
    const expert = makeExpert({ isFoundingExpert: true, commission_override_percent: 7 });
    expect(getCommissionPercent(expert)).toBe(7);
  });

  it("admin override of 0% is respected (not falsy-skipped)", () => {
    const expert = makeExpert({ commission_override_percent: 0 });
    expect(getCommissionPercent(expert)).toBe(0);
  });

  it("FOUNDING fee is lower than STANDARD fee (financial sanity)", () => {
    expect(TIER_THRESHOLDS.FOUNDING).toBeLessThan(TIER_THRESHOLDS.STANDARD);
  });

  it("tier fees are strictly descending: STANDARD > PROVEN > ELITE > FOUNDING", () => {
    expect(TIER_THRESHOLDS.STANDARD).toBeGreaterThan(TIER_THRESHOLDS.PROVEN);
    expect(TIER_THRESHOLDS.PROVEN).toBeGreaterThan(TIER_THRESHOLDS.ELITE);
    expect(TIER_THRESHOLDS.ELITE).toBeGreaterThan(TIER_THRESHOLDS.FOUNDING);
  });

  it("uses DB tier PROVEN over sales-count fallback", () => {
    const expert = makeExpert({ tier: "PROVEN", completed_sales_count: 2 });
    expect(getCommissionPercent(expert)).toBe(TIER_THRESHOLDS.PROVEN);
  });
});

// ── computePlatformFeeCents ───────────────────────────────────────────────────

describe("computePlatformFeeCents", () => {
  it("computes 16% correctly on a round number", () => {
    expect(computePlatformFeeCents(10_000, 16)).toBe(1_600);
  });

  it("rounds correctly at half-cent boundaries", () => {
    // 10_001 * 0.16 = 1600.16 → rounds to 1600
    expect(computePlatformFeeCents(10_001, 16)).toBe(1600);
  });

  it("returns 0 fee for 0% commission (free period)", () => {
    expect(computePlatformFeeCents(50_000, 0)).toBe(0);
  });

  it("returns full amount for 100% commission", () => {
    expect(computePlatformFeeCents(50_000, 100)).toBe(50_000);
  });
});

// ── computeExpertPayoutCents ──────────────────────────────────────────────────

describe("computeExpertPayoutCents", () => {
  it("payout + fee always equals the full price", () => {
    const price = 75_000;
    const percent = 14;
    const fee = computePlatformFeeCents(price, percent);
    const payout = computeExpertPayoutCents(price, percent);
    expect(fee + payout).toBe(price);
  });

  it("founding expert gets more payout than standard expert for same sale", () => {
    const price = 100_000;
    const foundingPayout = computeExpertPayoutCents(price, TIER_THRESHOLDS.FOUNDING);
    const standardPayout = computeExpertPayoutCents(price, TIER_THRESHOLDS.STANDARD);
    expect(foundingPayout).toBeGreaterThan(standardPayout);
  });
});

// ── formatCentsToCurrency ─────────────────────────────────────────────────────

describe("formatCentsToCurrency", () => {
  it("formats 5000 cents as a EUR value", () => {
    const result = formatCentsToCurrency(5_000);
    expect(result).toContain("50"); // €50.00 or €50
    expect(result).toMatch(/€|EUR/); // must contain EUR symbol or code
  });

  it("formats 0 as zero EUR", () => {
    const result = formatCentsToCurrency(0);
    expect(result).toMatch(/0/);
  });
});
