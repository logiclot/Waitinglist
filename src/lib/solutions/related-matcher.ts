import { Solution } from "@/types";
import type { SolutionFilters } from "@/lib/solutions/filters";

interface ScoredSolution {
  solution: Solution;
  score: number;
}

function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/ & /g, "-")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

/**
 * Computes the maximum achievable score based on which filter dimensions
 * are actually active. Only "scoreable" dimensions count — strict categorical
 * filters (complexity, tier, payback, trust, stack) are excluded.
 */
function getMaxAchievableScore(filters: SolutionFilters): number {
  let max = 0;
  if (filters.category) max += 40;
  if (filters.businessGoals.length > 0) max += 25;
  if (filters.industries.length > 0) max += 20;
  if (filters.tools.length > 0) max += 15;
  if (filters.query.trim()) max += 20;
  if (filters.minPrice !== null || filters.maxPrice !== null) max += 10;
  if (filters.deliveryMinDays !== null || filters.deliveryMaxDays !== null) max += 10;
  return max;
}

/**
 * Finds solutions related to the active filters using relaxed matching.
 * Called only when exact filtering returns zero results.
 *
 * Returns up to `limit` solutions sorted by relevance score,
 * or an empty array if nothing passes the minimum threshold (→ Scenario 3).
 */
export function getRelatedSolutions(
  allSolutions: Solution[],
  activeFilters: SolutionFilters,
  limit: number = 6
): Solution[] {
  const maxScore = getMaxAchievableScore(activeFilters);

  // No scoreable filters active — can't compute relevance
  if (maxScore === 0) return [];

  const threshold = maxScore * 0.15;

  const filterCategorySlug = activeFilters.category || null;

  const queryWords = activeFilters.query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  const scored: ScoredSolution[] = [];

  for (const solution of allSolutions) {
    let score = 0;

    // 1. Category (weight: 40)
    if (filterCategorySlug) {
      const sSlug = categoryToSlug(solution.category);
      if (sSlug === filterCategorySlug) {
        score += 40;
      }
    }

    // 2. Business goals (weight: 25)
    if (activeFilters.businessGoals.length > 0 && solution.businessGoals) {
      const matches = solution.businessGoals.filter((g) =>
        activeFilters.businessGoals.includes(g)
      ).length;
      score += (matches / activeFilters.businessGoals.length) * 25;
    }

    // 3. Industries (weight: 20)
    if (activeFilters.industries.length > 0 && solution.industries) {
      const matches = solution.industries.filter((i) =>
        activeFilters.industries.includes(i)
      ).length;
      score += (matches / activeFilters.industries.length) * 20;
    }

    // 4. Tools (weight: 15)
    if (activeFilters.tools.length > 0 && solution.integrations) {
      const matches = solution.integrations.filter((t) =>
        activeFilters.tools.includes(t)
      ).length;
      score += (matches / activeFilters.tools.length) * 15;
    }

    // 5. Text relevance (weight: 20)
    if (queryWords.length > 0) {
      const searchable = [
        solution.title,
        solution.description,
        solution.short_summary || "",
        solution.integrations.join(" "),
        ...(solution.businessGoals || []),
        ...(solution.industries || []),
      ]
        .join(" ")
        .toLowerCase();

      const matchingWords = queryWords.filter((w) =>
        searchable.includes(w)
      ).length;
      score += (matchingWords / queryWords.length) * 20;
    }

    // 6. Price proximity (weight: 10)
    if (
      activeFilters.minPrice !== null ||
      activeFilters.maxPrice !== null
    ) {
      const price = solution.implementation_price;
      const min = activeFilters.minPrice ?? 0;
      const max = activeFilters.maxPrice ?? min + 500;
      const rangeWidth = Math.max(max - min, 100);

      if (price >= min && price <= max) {
        score += 10;
      } else {
        const distance = price < min ? min - price : price - max;
        score += Math.max(0, 10 - (distance / rangeWidth) * 10);
      }
    }

    // 7. Delivery proximity (weight: 10)
    if (
      activeFilters.deliveryMinDays !== null ||
      activeFilters.deliveryMaxDays !== null
    ) {
      const days = solution.delivery_days;
      const min = activeFilters.deliveryMinDays ?? 0;
      const max = activeFilters.deliveryMaxDays ?? min + 14;
      const rangeWidth = Math.max(max - min, 3);

      if (days >= min && days <= max) {
        score += 10;
      } else {
        const distance = days < min ? min - days : days - max;
        score += Math.max(0, 10 - (distance / rangeWidth) * 10);
      }
    }

    if (score >= threshold) {
      scored.push({ solution, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.solution);
}

// ---------------------------------------------------------------------------
// Audit → Solution matching
// ---------------------------------------------------------------------------

/**
 * Maps audit task IDs to the categories and business goals they relate to.
 * Used to match solutions against what the user said they handle manually.
 */
const AUDIT_TASK_MAP: Record<
  string,
  { categories: string[]; goals: string[]; keywords: string[] }
> = {
  invoicing: {
    categories: ["Finance & Operations"],
    goals: ["Finance & invoicing"],
    keywords: ["invoice", "billing", "payment", "accounting"],
  },
  sales_followup: {
    categories: ["Sales & CRM"],
    goals: ["Sales automation", "Lead generation"],
    keywords: ["sales", "crm", "lead", "pipeline", "outreach", "follow-up"],
  },
  scheduling: {
    categories: ["Sales & CRM"],
    goals: ["Operations / internal efficiency"],
    keywords: ["scheduling", "calendar", "booking", "appointment"],
  },
  reporting: {
    categories: ["Data & Analytics"],
    goals: ["Reporting & dashboards"],
    keywords: ["report", "dashboard", "analytics", "data", "kpi"],
  },
  hr_onboarding: {
    categories: ["HR & Recruiting"],
    goals: ["Operations / internal efficiency"],
    keywords: ["hr", "onboarding", "employee", "hiring", "recruit"],
  },
  customer_support: {
    categories: ["Customer Support"],
    goals: ["Customer support"],
    keywords: ["support", "ticket", "helpdesk", "customer", "chat"],
  },
  social_media: {
    categories: ["Content Creation", "Marketing Automation"],
    goals: ["Marketing automation"],
    keywords: ["social", "content", "marketing", "post", "campaign"],
  },
  inventory: {
    categories: ["Finance & Operations"],
    goals: ["Operations / internal efficiency"],
    keywords: ["inventory", "order", "stock", "warehouse", "fulfillment"],
  },
};

/**
 * Finds solutions relevant to the user's audit answers.
 * Scores each solution based on how well it matches the tasks the user
 * said they still handle manually.
 *
 * Returns up to `limit` solutions sorted by relevance,
 * or an empty array if nothing is relevant (→ Scenario 3).
 */
export function getAuditRecommendations(
  allSolutions: Solution[],
  selectedTasks: string[],
  limit: number = 6,
  strengths: string[] = []
): Solution[] {
  return getAuditRecommendationsScored(allSolutions, selectedTasks, limit, strengths).map(
    (r) => r.solution
  );
}

// ---------------------------------------------------------------------------
// Scored audit recommendations (with match quality labels)
// ---------------------------------------------------------------------------

export type MatchLabel = "Best Match" | "Strong Match" | "Partial Match";

export interface ScoredRecommendation {
  solution: Solution;
  score: number;
  matchLabel: MatchLabel;
}

function toMatchLabel(score: number): MatchLabel {
  if (score >= 55) return "Best Match";
  if (score >= 25) return "Strong Match";
  return "Partial Match";
}

/**
 * Like getAuditRecommendations but returns scored results with match quality
 * labels. Always returns min(limit, available) results — no hard threshold
 * cutoff — so the UI can always show 3 cards.
 */
export function getAuditRecommendationsScored(
  allSolutions: Solution[],
  selectedTasks: string[],
  limit: number = 3,
  strengths: string[] = []
): ScoredRecommendation[] {
  if (selectedTasks.length === 0 && strengths.length === 0) return [];

  // Aggregate all relevant categories, goals, and keywords from selected tasks
  const relevantCategories = new Set<string>();
  const relevantGoals = new Set<string>();
  const relevantKeywords: string[] = [];

  for (const task of selectedTasks) {
    const mapping = AUDIT_TASK_MAP[task];
    if (!mapping) continue;
    mapping.categories.forEach((c) => relevantCategories.add(c));
    mapping.goals.forEach((g) => relevantGoals.add(g));
    relevantKeywords.push(...mapping.keywords);
  }

  // Aggregate strength categories/goals/keywords (working-well = automation targets)
  const strengthCategories = new Set<string>();
  const strengthGoals = new Set<string>();
  const strengthKeywords: string[] = [];

  for (const task of strengths) {
    const mapping = AUDIT_TASK_MAP[task];
    if (!mapping) continue;
    mapping.categories.forEach((c) => strengthCategories.add(c));
    mapping.goals.forEach((g) => strengthGoals.add(g));
    strengthKeywords.push(...mapping.keywords);
  }

  const scored: ScoredSolution[] = [];

  for (const solution of allSolutions) {
    let score = 0;

    // Build searchable text once (used by both task and strength keyword checks)
    const searchable = [
      solution.title,
      solution.description,
      solution.short_summary || "",
      solution.integrations.join(" "),
      ...(solution.businessGoals || []),
    ]
      .join(" ")
      .toLowerCase();

    // 1. Category match from tasks (weight: 40)
    if (relevantCategories.has(solution.category)) {
      score += 40;
    }

    // 2. Business goals overlap from tasks (weight: 30)
    if (solution.businessGoals && relevantGoals.size > 0) {
      const matches = solution.businessGoals.filter((g) =>
        relevantGoals.has(g)
      ).length;
      score += (matches / relevantGoals.size) * 30;
    }

    // 3. Keyword relevance from tasks (weight: 30)
    if (relevantKeywords.length > 0) {
      const matchingKeywords = relevantKeywords.filter((kw) =>
        searchable.includes(kw)
      ).length;
      score += (matchingKeywords / relevantKeywords.length) * 30;
    }

    // 4. Strength boost — working-well processes are automation-ready (up to +15)
    if (strengths.length > 0) {
      if (strengthCategories.has(solution.category)) {
        score += 8;
      }
      if (solution.businessGoals && strengthGoals.size > 0) {
        const matches = solution.businessGoals.filter((g) =>
          strengthGoals.has(g)
        ).length;
        score += (matches / strengthGoals.size) * 4;
      }
      if (strengthKeywords.length > 0) {
        const matchingKw = strengthKeywords.filter((kw) =>
          searchable.includes(kw)
        ).length;
        score += (matchingKw / strengthKeywords.length) * 3;
      }
    }

    if (score > 0) {
      scored.push({ solution, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => ({
    solution: s.solution,
    score: s.score,
    matchLabel: toMatchLabel(s.score),
  }));
}
