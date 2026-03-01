export interface Expert {
  id: string;
  name: string;
  verified: boolean;
  founding: boolean;          // legacy DB field — prefer isFoundingExpert
  isFoundingExpert?: boolean; // canonical founding status field
  founding_rank?: number | null;
  completed_sales_count: number;
  commission_override_percent?: number | null;
  tools: string[];
  created_at?: string;
}

export const TIER_THRESHOLDS = {
  STANDARD: 15,  // 15% — new experts
  PROVEN: 13,    // 13% — after 5 completed sales
  ELITE: 12,     // 12% — after 10 completed sales
  FOUNDING: 11,  // 11% — lifetime rate for Founding Experts
};

export const SALES_THRESHOLDS = {
  PROVEN: 5,
  ELITE: 10,
};

export type ExpertTier = 'standard' | 'proven' | 'elite' | 'founding';

export function getExpertTierLabel(expert: Expert): ExpertTier {
  if (expert.isFoundingExpert || expert.founding) return 'founding';

  if (expert.completed_sales_count >= SALES_THRESHOLDS.ELITE) return 'elite';
  if (expert.completed_sales_count >= SALES_THRESHOLDS.PROVEN) return 'proven';
  return 'standard';
}

export function getCommissionPercent(expert: Expert): number {
  // 1. Admin override
  if (expert.commission_override_percent !== undefined && expert.commission_override_percent !== null) {
    return Number(expert.commission_override_percent);
  }

  // 2. Founding expert (check both fields for backward compat)
  if (expert.isFoundingExpert || expert.founding) {
    return TIER_THRESHOLDS.FOUNDING;
  }

  // 3. Sales volume tiers
  const sales = expert.completed_sales_count || 0;
  
  if (sales >= SALES_THRESHOLDS.ELITE) {
    return TIER_THRESHOLDS.ELITE;
  }
  
  if (sales >= SALES_THRESHOLDS.PROVEN) {
    return TIER_THRESHOLDS.PROVEN;
  }

  return TIER_THRESHOLDS.STANDARD;
}

export function computePlatformFeeCents(implementationPriceCents: number, commissionPercent: number): number {
  // Always round normally or floor/ceil? Usually round for display, but Stripe likes integers.
  // We'll use Math.round to get nearest cent.
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
