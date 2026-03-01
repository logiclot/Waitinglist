// Proposal slot limits — single source of truth shared by server actions and pages

export const MAX_PROPOSALS: Record<string, number> = {
  Discovery: 5,
  "Discovery Scan": 5,
  Custom: 3,
  default: 3,
};

export function maxProposalsForCategory(category: string): number {
  return MAX_PROPOSALS[category] ?? MAX_PROPOSALS.default;
}
