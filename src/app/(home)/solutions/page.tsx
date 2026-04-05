import { Suspense } from "react";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";
const BASE_URL = `https://${BRAND_DOMAIN}`;
import { SolutionsPageClient } from "@/components/solutions/SolutionsPageClient";
import { getPublishedSolutions } from "@/lib/solutions/data";
import { getPublishedEcosystems } from "@/actions/ecosystems";
import { LogoMark } from "@/components/LogoMark";
import type { Category } from "@/types";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Browse AI Solutions | ${BRAND_NAME}`,
  description: "Find productized AI automations for your business. Discovery Scans, Custom Projects, and ready-made solutions built by verified experts.",
  openGraph: {
    title: `Browse AI Solutions | ${BRAND_NAME}`,
    description: "Find productized AI automations for your business. Ready-made solutions built by verified experts.",
    url: `${BASE_URL}/solutions`,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Browse AI Solutions | ${BRAND_NAME}`,
    description: "Find productized AI automations for your business. Ready-made solutions built by verified experts.",
  },
  alternates: { canonical: `${BASE_URL}/solutions` },
  keywords: ["AI solutions", "buy automation", "AI automation marketplace", "business automation solutions", "productized automation"],
};

/** Derive category list from actual published solutions (always in sync) */
function deriveCategoriesFromSolutions(solutions: { category: string }[]): Category[] {
  const seen = new Set<string>();
  const cats: Category[] = [];
  for (const s of solutions) {
    if (!s.category || seen.has(s.category)) continue;
    seen.add(s.category);
    cats.push({
      id: s.category,
      name: s.category,
      slug: s.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-").replace(/[^\w-]+/g, ""),
      description: `Automations for ${s.category}`,
    });
  }
  return cats.sort((a, b) => a.name.localeCompare(b.name));
}

export default async function SolutionsPage() {
  // Fetch from DB
  const [publishedSolutions, ecosystems] = await Promise.all([
    getPublishedSolutions(),
    getPublishedEcosystems()
  ]);

  // Derive categories from actual solution data (never stale)
  const categories = deriveCategoriesFromSolutions(publishedSolutions);

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="flex justify-center py-20 animate-pulse"><LogoMark size={48} /></div>}>
        <SolutionsPageClient
          initialSolutions={publishedSolutions}
          categories={categories}
          ecosystems={ecosystems}
        />
      </Suspense>
    </div>
  );
}
