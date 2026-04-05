/**
 * Pure validation functions — no database, no auth.
 * Safe to use in both server actions and tests.
 */

import z from "zod";

// ── Text quality / gibberish detection ───────────────────────────────────────

/**
 * Detects keyboard-mashing, repeated-pattern gibberish, or meaningless text.
 * Returns null if text is OK, or a reason string if it looks like gibberish.
 *
 * Designed to catch: "aksldfnhsakjfhsdfgjksdhffdsfs", "asdasdasd", "aaaaaaa"
 * while allowing: "HubSpot CRM integration", "n8n", short acronyms, URLs.
 */
export function detectGibberish(text: string): string | null {
  const cleaned = text.trim();
  if (cleaned.length < 8) return null; // Too short to judge

  // Only analyse alphabetic characters (ignore numbers, punctuation, spaces)
  const letters = cleaned.toLowerCase().replace(/[^a-z]/g, "");
  if (letters.length < 6) return null; // Not enough letters

  // --- 1. Vowel ratio ---
  // English averages ~38% vowels. Below 12% over 6+ letters = very suspicious.
  const vowelCount = (letters.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowelCount / letters.length;
  if (vowelRatio < 0.12) {
    return "Text appears to be random characters. Please write a meaningful description.";
  }

  // --- 2. Long consonant runs ---
  // English rarely exceeds 4 consecutive consonants ("strengths" has 5, which is extreme).
  // If more than 40% of the letters sit inside 5+ consonant runs, flag it.
  const longRuns = letters.match(/[^aeiou]{5,}/g) || [];
  const runTotal = longRuns.reduce((s, r) => s + r.length, 0);
  if (letters.length >= 10 && runTotal / letters.length > 0.4) {
    return "Text contains too many unpronounceable character sequences.";
  }

  // --- 3. Single long "word" with no spaces ---
  // A 20+ char block with no spaces, dots, or slashes is almost never real prose.
  const words = cleaned.split(/\s+/).filter(Boolean);
  for (const w of words) {
    const wordLetters = w.replace(/[^a-zA-Z]/g, "");
    if (wordLetters.length > 20 && !/[./@]/.test(w)) {
      // Verify it's not just a long compound (check vowel ratio of this word)
      const wVowels = (wordLetters.toLowerCase().match(/[aeiou]/g) || []).length;
      if (wVowels / wordLetters.length < 0.2) {
        return "Please use real words separated by spaces, not a single block of characters.";
      }
    }
  }

  // --- 4. Repeated short patterns ---
  // "asdasdasd", "abcabcabc", "aaaaaa"
  if (letters.length >= 6) {
    for (let patLen = 1; patLen <= 4; patLen++) {
      const pat = letters.substring(0, patLen);
      const repeated = pat.repeat(Math.ceil(letters.length / patLen)).substring(0, letters.length);
      if (repeated === letters) {
        return "Text appears to be a repeated pattern. Please write a real description.";
      }
    }
  }

  // --- 5. Very low unique-character diversity on longer text ---
  // Keyboard mashing on home row uses ~8 unique chars for 20+ chars.
  if (letters.length >= 20) {
    const unique = new Set(letters).size;
    // Real English uses roughly 15-20 unique chars per 50 letters.
    // If ratio is below 0.2 for 20+ chars, suspicious.
    if (unique / letters.length < 0.15 && unique < 6) {
      return "Text uses too few unique characters. Please provide meaningful content.";
    }
  }

  return null; // Looks fine
}

/**
 * Validate multiple text fields for gibberish. Returns first failure or null.
 */
export function checkFieldsForGibberish(
  fields: { value: string | null | undefined; label: string }[]
): string | null {
  for (const { value, label } of fields) {
    if (!value) continue;
    const issue = detectGibberish(value);
    if (issue) return `${label}: ${issue}`;
  }
  return null;
}

/**
 * Check an array of strings (e.g. "included" deliverables) for gibberish.
 */
export function checkListForGibberish(
  items: string[],
  label: string
): string | null {
  for (let i = 0; i < items.length; i++) {
    if (!items[i]?.trim()) continue;
    const issue = detectGibberish(items[i]);
    if (issue) return `${label} item ${i + 1}: ${issue}`;
  }
  return null;
}

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

  // ── Gibberish check on text fields ──
  const milestoneTexts = (solution.milestones ?? []).flatMap(m => [
    ...(m.title ? [{ value: m.title, label: "Milestone title" }] : []),
    ...(m.description ? [{ value: m.description, label: "Milestone description" }] : []),
  ]);

  const gibberishIssue =
    checkFieldsForGibberish([
      { value: solution.title, label: "Title" },
      { value: solution.longDescription, label: "Description" },
      { value: solution.measurableOutcome, label: "Measurable outcome" },
      ...milestoneTexts,
    ]) ??
    checkListForGibberish(solution.included ?? [], "Deliverable") ??
    checkListForGibberish(solution.structureConsistent ?? [], "Always-included item") ??
    checkListForGibberish(solution.structureCustom ?? [], "Customised item");

  if (gibberishIssue) {
    return { valid: false, missing: [], error: gibberishIssue };
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