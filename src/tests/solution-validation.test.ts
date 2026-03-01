import { describe, it, expect } from "vitest";
import {
  validateSolutionForPublish,
  generateSlug,
  milestoneTotalCents,
  milestoneMatchesPrice,
  type SolutionPublishData,
} from "@/lib/validation";

// ── Helpers ───────────────────────────────────────────────────────────────────

function validSolution(overrides: Partial<SolutionPublishData> = {}): SolutionPublishData {
  return {
    title: "Automated Lead Pipeline",
    category: "CRM",
    longDescription: "A comprehensive automation that captures leads from your website and routes them into your CRM automatically.",
    integrations: ["HubSpot", "Zapier"],
    structureConsistent: ["CRM integration setup", "Webhook configuration"],
    structureCustom: ["Custom field mapping", "Notification rules"],
    measurableOutcome: "Reduce manual data entry by 80%",
    included: ["Setup", "Testing", "Handover documentation"],
    paybackPeriod: "30 days",
    implementationPriceCents: 150000, // €1500
    deliveryDays: 14,
    milestones: [
      { title: "Phase 1 — Setup", price: 750 },
      { title: "Phase 2 — Testing & Handover", price: 750 },
    ],
    ...overrides,
  };
}

// ── validateSolutionForPublish ────────────────────────────────────────────────

describe("validateSolutionForPublish", () => {
  it("passes a fully complete solution", () => {
    const result = validateSolutionForPublish(validSolution());
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  it("fails when title is missing", () => {
    const result = validateSolutionForPublish(validSolution({ title: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Title");
  });

  it("fails when category is missing", () => {
    const result = validateSolutionForPublish(validSolution({ category: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Category");
  });

  it("fails when description is missing", () => {
    const result = validateSolutionForPublish(validSolution({ longDescription: "" }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Description");
  });

  it("fails when no tools/integrations are listed", () => {
    const result = validateSolutionForPublish(validSolution({ integrations: [] }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Tools / Integrations");
  });

  it("fails when fewer than 3 included deliverables", () => {
    const result = validateSolutionForPublish(validSolution({ included: ["Setup", "Testing"] }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Included deliverables (minimum 3)");
  });

  it("passes with exactly 3 included deliverables", () => {
    const result = validateSolutionForPublish(validSolution({ included: ["A", "B", "C"] }));
    expect(result.valid).toBe(true);
  });

  it("fails when price is 0", () => {
    const result = validateSolutionForPublish(
      validSolution({ implementationPriceCents: 0, milestones: [] })
    );
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Price");
  });

  it("fails when price is negative", () => {
    const result = validateSolutionForPublish(
      validSolution({ implementationPriceCents: -100, milestones: [] })
    );
    expect(result.valid).toBe(false);
  });

  it("fails when delivery days is 0", () => {
    const result = validateSolutionForPublish(validSolution({ deliveryDays: 0 }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Delivery Time");
  });

  it("fails when no milestones are provided", () => {
    const result = validateSolutionForPublish(validSolution({ milestones: [] }));
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("Milestones (at least 1 required)");
  });

  it("fails when milestone total doesn't match solution price", () => {
    const result = validateSolutionForPublish(
      validSolution({
        implementationPriceCents: 150000, // €1500
        milestones: [
          { title: "Phase 1", price: 500 }, // Only €1000 total — €500 short
          { title: "Phase 2", price: 500 },
        ],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Milestone total");
  });

  it("passes when milestone total matches exactly", () => {
    const result = validateSolutionForPublish(
      validSolution({
        implementationPriceCents: 100000, // €1000
        milestones: [
          { title: "Phase 1", price: 400 },
          { title: "Phase 2", price: 600 },
        ],
      })
    );
    expect(result.valid).toBe(true);
  });

  it("passes when milestone total is within 5-cent rounding tolerance", () => {
    const result = validateSolutionForPublish(
      validSolution({
        implementationPriceCents: 100000, // €1000.00
        milestones: [{ title: "All", price: 999.99 }], // €999.99 → 99999 cents (1 cent off)
      })
    );
    expect(result.valid).toBe(true);
  });

  it("fails with multiple missing fields and lists all of them", () => {
    const result = validateSolutionForPublish({
      title: "",
      category: "",
      longDescription: "",
      integrations: [],
      included: [],
    });
    expect(result.valid).toBe(false);
    expect(result.missing.length).toBeGreaterThan(4);
  });
});

// ── generateSlug ──────────────────────────────────────────────────────────────

describe("generateSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(generateSlug("Lead Generation Pipeline")).toBe("lead-generation-pipeline");
  });

  it("removes special characters", () => {
    expect(generateSlug("CRM & Sales: Automation!")).toBe("crm-sales-automation");
  });

  it("strips leading and trailing hyphens", () => {
    expect(generateSlug("  Automation  ")).toBe("automation");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(generateSlug("a   b")).toBe("a-b");
  });
});

// ── milestoneTotalCents ───────────────────────────────────────────────────────

describe("milestoneTotalCents", () => {
  it("sums milestone prices into cents correctly", () => {
    expect(milestoneTotalCents([{ price: 500 }, { price: 500 }])).toBe(100000);
  });

  it("handles a single milestone", () => {
    expect(milestoneTotalCents([{ price: 1500 }])).toBe(150000);
  });

  it("returns 0 for an empty array", () => {
    expect(milestoneTotalCents([])).toBe(0);
  });

  it("handles decimal prices with proper rounding", () => {
    // 333.33 + 333.33 + 333.34 = 1000.00 exactly
    const total = milestoneTotalCents([
      { price: 333.33 },
      { price: 333.33 },
      { price: 333.34 },
    ]);
    expect(total).toBe(100000);
  });
});

// ── milestoneMatchesPrice ─────────────────────────────────────────────────────

describe("milestoneMatchesPrice", () => {
  it("returns true when total matches exactly", () => {
    expect(milestoneMatchesPrice([{ price: 1000 }], 100000)).toBe(true);
  });

  it("returns true within 5-cent tolerance", () => {
    expect(milestoneMatchesPrice([{ price: 999.99 }], 100000)).toBe(true);
  });

  it("returns false when off by more than 5 cents", () => {
    expect(milestoneMatchesPrice([{ price: 900 }], 100000)).toBe(false);
  });

  it("returns false for empty milestones against non-zero price", () => {
    expect(milestoneMatchesPrice([], 100000)).toBe(false);
  });
});
