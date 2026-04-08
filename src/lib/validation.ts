/**
 * Pure validation functions — no database, no auth.
 * Safe to use in both server actions and tests.
 */

import z from "zod";

// ── Solution publish validation ───────────────────────────────────────────────

export interface SolutionPublishData {
  title?: string | null;
  category?: string | null;
  longDescription?: string | null;
  integrations?: string[];
  structureConsistent?: string[];
  structureCustom?: string[];
  measurableOutcome?: string | null;
  included?: string[];
  paybackPeriod?: string | null;
  implementationPriceCents?: number | null;
  deliveryDays?: number | null;
  milestones?: { title?: string; price?: number; priceCents?: number; description?: string }[];
}

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  error?: string;
}

export function validateSolutionForPublish(solution: SolutionPublishData): ValidationResult {
  const missing: string[] = [];

  if (!solution.title?.trim()) missing.push("Title");
  if (!solution.category?.trim()) missing.push("Category");
  if (!solution.longDescription?.trim()) missing.push("Description");
  if (!solution.integrations?.length) missing.push("Tools / Integrations");
  if (!solution.structureConsistent?.length) missing.push("What's always included");
  if (!solution.structureCustom?.length) missing.push("What's customised per client");
  if (!solution.measurableOutcome?.trim()) missing.push("Measurable Outcome");
  if ((solution.included?.length ?? 0) < 3) missing.push("Included deliverables (minimum 3)");
  if (!solution.paybackPeriod?.trim()) missing.push("ROI Timeframe");
  if (!solution.implementationPriceCents || solution.implementationPriceCents <= 0) missing.push("Price");
  if (!solution.deliveryDays || solution.deliveryDays <= 0) missing.push("Delivery Time");

  const milestones = solution.milestones ?? [];
  if (milestones.length === 0) {
    missing.push("Milestones (at least 1 required)");
  } else {
    // Milestone prices must add up to the total implementation price
    // Prefer priceCents (integer) to avoid floating-point errors; fall back to price * 100
    const milestoneTotalCents = milestones.reduce(
      (sum, m) => sum + (typeof m.priceCents === "number" ? m.priceCents : Math.round((m.price ?? 0) * 100)),
      0,
    );
    const priceCents = solution.implementationPriceCents ?? 0;

    if (priceCents > 0 && Math.abs(milestoneTotalCents - priceCents) > 5) {
      return {
        valid: false,
        missing,
        error: `Milestone total (€${(milestoneTotalCents / 100).toFixed(2)}) must equal the solution price (€${(priceCents / 100).toFixed(2)})`,
      };
    }
  }

  if (missing.length > 0) {
    return { valid: false, missing, error: `Missing required fields: ${missing.join(", ")}` };
  }

  return { valid: true, missing: [] };
}

// ── Job post (Custom Project) validation ──────────────────────────────────────

export interface JobPostData {
  title?: string;
  goal?: string;
  category?: string;
  budgetRange?: string;
  timeline?: string;
}

export function validateJobPost(data: JobPostData): ValidationResult {
  const missing: string[] = [];
  if (!data.title?.trim()) missing.push("Title");
  if (!data.goal?.trim()) missing.push("Project description");
  if (!data.category?.trim()) missing.push("Category");
  if (!data.budgetRange?.trim()) missing.push("Budget range");
  if (!data.timeline?.trim()) missing.push("Timeline");

  if (missing.length > 0) {
    return { valid: false, missing, error: `Missing required fields: ${missing.join(", ")}` };
  }
  return { valid: true, missing: [] };
}

// ── Discovery Scan validation ─────────────────────────────────────────────────

export interface DiscoveryScanData {
  businessModel?: string;
  teamSize?: string;
  businessDescription?: string;
  timeDrain?: string;
  growthGoal?: string;
}

export function validateDiscoveryScan(data: DiscoveryScanData): ValidationResult {
  const missing: string[] = [];
  if (!data.businessModel?.trim()) missing.push("Business model");
  if (!data.teamSize?.trim()) missing.push("Team size");
  if (!data.businessDescription?.trim()) missing.push("Business description");

  if (missing.length > 0) {
    return { valid: false, missing, error: `Missing required fields: ${missing.join(", ")}` };
  }
  return { valid: true, missing: [] };
}

// ── Slug generation ───────────────────────────────────────────────────────────

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// ── Milestone helpers ─────────────────────────────────────────────────────────

export function milestoneTotalCents(
  milestones: { priceCents?: number; price?: number }[]
): number {
  // Prefer priceCents (integer) to avoid floating-point precision errors
  return milestones.reduce(
    (sum, m) => sum + (typeof m.priceCents === "number" ? m.priceCents : Math.round((m.price ?? 0) * 100)),
    0,
  );
}

export function milestoneMatchesPrice(
  milestones: { priceCents?: number; price?: number }[],
  implementationPriceCents: number
): boolean {
  const total = milestoneTotalCents(milestones);
  return Math.abs(total - implementationPriceCents) <= 5; // 5-cent rounding tolerance
}

export const waitlistSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Invalid email address"),
  role: z.enum(["business", "expert"], { message: "Role must be business or expert" }),
  honeypot: z.string().optional(),
})