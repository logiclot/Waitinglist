// CommissionExpert: the shape needed for commission calculations (distinct from types/index.ts Expert)
export interface CommissionExpert {
  id: string;
  name: string;
  verified: boolean;
  founding: boolean;          // legacy DB field — prefer isFoundingExpert
  isFoundingExpert?: boolean; // canonical founding status field
  founding_rank?: number | null;
  completed_sales_count: number;
  commission_override_percent?: number | null;
  tier?: 'STANDARD' | 'PROVEN' | 'ELITE' | "FOUNDING"; // DB tier — authoritative for Elite (application-based)
  tools: string[];
  created_at?: string;
}

export const TIER_THRESHOLDS = {
  STANDARD: 16,  // 16% — new experts
  PROVEN: 14,    // 14% — after 5 completed sales
  ELITE: 12,     // 12% — application-based (10+ sales + admin approval)
  FOUNDING: 11,  // 11% — lifetime rate for Founding Experts
};

export const SALES_THRESHOLDS = {
  PROVEN: 5,
  ELITE: 10,
};

export type ExpertTier = 'standard' | 'proven' | 'elite' | 'founding';

export function getExpertTierLabel(expert: CommissionExpert): ExpertTier {
  if (expert.isFoundingExpert || expert.founding) return 'founding';

  // Use DB tier when available (authoritative for Elite which is application-based)
  if (expert.tier === 'ELITE') return 'elite';
  if (expert.tier === 'PROVEN') return 'proven';

  // Fallback: compute from sales count (Standard → Proven only)
  if (expert.completed_sales_count >= SALES_THRESHOLDS.PROVEN) return 'proven';
  return 'standard';
}

export function getCommissionPercent(expert: CommissionExpert): number {
  // 1. Admin override
  // 2. Founding expert (check both fields for backward compat)
  if (expert.tier === "FOUNDING") {
    return TIER_THRESHOLDS.FOUNDING;
  }

  // 3. Use DB tier when available (authoritative — Elite is application-based)
  if (expert.tier === 'ELITE') {
    return TIER_THRESHOLDS.ELITE;
  }
  if (expert.tier === 'PROVEN') {
    return TIER_THRESHOLDS.PROVEN;
  }

  // 4. Fallback: compute from sales count (Standard → Proven auto-upgrade only)
  const sales = expert.completed_sales_count || 0;

  if (sales >= SALES_THRESHOLDS.PROVEN) {
    return TIER_THRESHOLDS.PROVEN;
  }

  return TIER_THRESHOLDS.STANDARD;
}

export function computePlatformFeeCents(implementationPriceCents: number, commissionPercent: number): number {
  return Math.round(implementationPriceCents * (commissionPercent / 100));
}

export function computeExpertPayoutCents(implementationPriceCents: number, commissionPercent: number): number {
  const platformFee = computePlatformFeeCents(implementationPriceCents, commissionPercent);
  return implementationPriceCents - platformFee;
}

export function formatCentsToCurrency(cents: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}
