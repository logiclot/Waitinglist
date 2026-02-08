export interface Expert {
  id: string;
  name: string;
  verified: boolean;
  founding: boolean;
  founding_rank?: number | null;
  completed_sales_count: number;
  commission_override_percent?: number | null;
  tools: string[];
  created_at?: string;
}

export const TIER_THRESHOLDS = {
  STANDARD: 15, // 15%
  PROVEN: 13,   // 13% after 10 sales
  ELITE: 12,    // 12% after 50 sales
  FOUNDING: 11, // 11% lifetime
};

export const SALES_THRESHOLDS = {
  PROVEN: 10,
  ELITE: 50,
};

export type ExpertTier = 'standard' | 'proven' | 'elite' | 'founding';

export function getExpertTierLabel(expert: Expert): ExpertTier {
  if (expert.founding) return 'founding';
  
  if (expert.completed_sales_count >= SALES_THRESHOLDS.ELITE) return 'elite';
  if (expert.completed_sales_count >= SALES_THRESHOLDS.PROVEN) return 'proven';
  return 'standard';
}

export function getCommissionPercent(expert: Expert): number {
  // 1. Admin override
  if (expert.commission_override_percent !== undefined && expert.commission_override_percent !== null) {
    return Number(expert.commission_override_percent);
  }

  // 2. Founding expert
  if (expert.founding) {
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
