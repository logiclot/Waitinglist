// Single source of truth for Discovery Scan + Custom Project card copy.
// Import from here in all UI locations to keep copy 100% consistent.
//
// Prices are configurable via environment variables:
//   NEXT_PUBLIC_DISCOVERY_SCAN_PRICE_CENTS  (default: 5000 = €50)
//   NEXT_PUBLIC_CUSTOM_PROJECT_PRICE_CENTS  (default: 10000 = €100)

import { DISCOVERY_SCAN_PRICE_CENTS, CUSTOM_PROJECT_PRICE_CENTS } from "@/lib/pricing-config";

function formatEuros(cents: number): string {
  return `€${cents / 100}`;
}

export const DISCOVERY_SCAN_BULLETS = [
  "Find your 3 biggest time or cost leaks — identified by real experts",
  "Get 2–5 proposals with full scope, timeline, and ROI estimate",
  "Live demo before any commitment or access is granted",
  "Walk away with clarity — even if you don\u2019t proceed",
] as const;

export const CUSTOM_PROJECT_BULLETS = [
  "Your team stops doing manually what should have been automated a long time ago.",
  "The problem you describe is the exact problem that gets solved",
  "You leave with a live, working automation \u2014 not a plan or a prototype",
  "Know your total cost upfront \u2014 implementation and monthly running costs, itemised",
  "Nothing ships without your sign-off \u2014 you stay in control at every step",
  "Every proposal you receive is built for your tools and process.",
] as const;

export const DISCOVERY_SCAN_COPY = {
  badge: "Most Popular",
  price: formatEuros(DISCOVERY_SCAN_PRICE_CENTS),
  priceNote: "one-time posting fee",
  proposalNote: "Discovery Scan \u00b7 Up to 5 expert proposals",
  headline: "Stop guessing.\nStart automating.",
  description:
    "Describe how your business runs. Automation experts identify your biggest wins and send you concrete proposals \u2014 no access required, no commitment.",
  cta: "Get My Automation Roadmap",
  footer: "First proposals arrive within 24 hours",
  trustNote:
    "You don\u2019t need to know what to automate. Just describe your business \u2014 the analysis is on us.",
} as const;

export const CUSTOM_PROJECT_COPY = {
  badge: "For Complex Workflows",
  price: formatEuros(CUSTOM_PROJECT_PRICE_CENTS),
  priceNote: "one-time posting fee",
  proposalNote: "Custom Project \u00b7 Max 3 tailored proposals",
  headline: "Describe it once.\nGet it built right.",
  description:
    "You know what needs to change. Post your requirement \u2014 Elite experts compete for the job with tailored proposals, not generic advice.",
  cta: "Post My Custom Project",
  footer: "50% refund if no proposal meets your criteria",
  trustNote:
    "Not sure what to automate yet? Start with a Discovery Scan instead.",
} as const;
