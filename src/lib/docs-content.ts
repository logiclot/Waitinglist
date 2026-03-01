import { BEGINNER_DOCS } from "./docs/docs-beginner";
import { PLATFORM_DOCS } from "./docs/docs-platform";
import { TOOLS_DOCS } from "./docs/docs-tools";
import { USE_CASE_DOCS } from "./docs/docs-use-cases";
import { EXPERT_GUIDE_DOCS } from "./docs/docs-expert-guides";
import { TECHNICAL_DOCS } from "./docs/docs-technical";
import { PRACTICAL_DOCS } from "./docs/docs-practical";

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  content: string;
  relatedSlugs?: string[];
  faqs?: { question: string; answer: string }[];
}

/**
 * All documentation pages. Split into topic files in ./docs/ for maintainability.
 */
export const DOCS_PAGES: DocPage[] = [
  ...BEGINNER_DOCS,
  ...PLATFORM_DOCS,
  ...TOOLS_DOCS,
  ...USE_CASE_DOCS,
  ...EXPERT_GUIDE_DOCS,
  ...TECHNICAL_DOCS,
  ...PRACTICAL_DOCS,
];

export function getDocBySlug(slug: string): DocPage | undefined {
  return DOCS_PAGES.find((p) => p.slug === slug);
}

export function getAllDocSlugs(): string[] {
  return DOCS_PAGES.map((p) => p.slug);
}
