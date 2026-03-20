// Single source of truth for Discovery Scan + Custom Project card copy.
// Import from here in all UI locations to keep copy 100% consistent.
//
// Prices are configurable via environment variables:
//   NEXT_PUBLIC_DISCOVERY_SCAN_PRICE_CENTS  (default: 5000 = €50)
//   NEXT_PUBLIC_CUSTOM_PROJECT_PRICE_CENTS  (default: 10000 = €100)

import { DISCOVERY_SCAN_PRICE_CENTS, CUSTOM_PROJECT_PRICE_CENTS } from "@/lib/pricing-config";

function formatEuros(cents: number): string {
  return `\u20AC${cents / 100}`;
}

export const DISCOVERY_SCAN_BULLETS = [
  "Uncover where your team is bleeding 10\u201330+ hours a week on repetitive work",
  "Get a clear ROI breakdown before you spend another cent",
  "Receive 2\u20135 competing proposals with scope, timeline, and fixed pricing",
  "No system access needed, no commitment to proceed",
] as const;

export const CUSTOM_PROJECT_BULLETS = [
  "Stop paying people to do work that software handles in seconds",
  "Get a live, working automation deployed inside your existing tools",
  "Fixed price agreed upfront. No scope creep, no surprise invoices",
  "Funds held in escrow. Released only when you approve the result",
  "Every proposal is built for your exact workflow, not a generic template",
] as const;

export const DISCOVERY_SCAN_COPY = {
  badge: "Most Popular",
  price: formatEuros(DISCOVERY_SCAN_PRICE_CENTS),
  priceCents: DISCOVERY_SCAN_PRICE_CENTS,
  priceNote: "one-time posting fee",
  proposalNote: "Discovery Scan \u00b7 Up to 5 expert proposals",
  headline: "Not sure what to automate?\nWe'll find it for you.",
  description:
    "You don't need to know what to automate. Describe how your team works day-to-day. Experts analyse your operations and come back with a prioritised plan: what to automate first, how much it saves, and exactly how to build it.",
  shortDescription:
    "You don't need to know what to automate. Describe how your team works. Experts come back with a prioritised plan and fixed-price proposals within 48 hours.",
  cta: "Get My Automation Roadmap",
  footer: "First proposals arrive within 48 hours",
  trustNote:
    "You don't need to know what to automate. Just describe your business. The analysis is on us.",
} as const;

export const CUSTOM_PROJECT_COPY = {
  badge: "For Complex Workflows",
  price: formatEuros(CUSTOM_PROJECT_PRICE_CENTS),
  priceCents: CUSTOM_PROJECT_PRICE_CENTS,
  priceNote: "one-time posting fee",
  proposalNote: "Custom Project \u00b7 Max 3 tailored proposals",
  headline: "Know what you need?\nGet it built.",
  description:
    "You already know what's broken or what you want built. Post your requirement once. Verified experts compete for the job with a fixed price, clear timeline, and a working result. Not a plan. Not a prototype.",
  shortDescription:
    "Post your requirement once. Verified experts compete with fixed-price proposals, clear timelines, and working results. Not advice.",
  cta: "Post My Custom Project",
  footer: "50% refund if no proposal meets your criteria",
  trustNote:
    "Not sure what to automate yet? Start with a Discovery Scan instead.",
} as const;
