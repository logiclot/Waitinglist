import { Suspense } from "react";
import { categories } from "@/data/mock";
import { BRAND_NAME } from "@/lib/branding";
import { SolutionsPageClient } from "@/components/solutions/SolutionsPageClient";
import { getPublishedSolutions } from "@/lib/solutions/data";
import { getPublishedEcosystems } from "@/actions/ecosystems";
import { LogoMark } from "@/components/LogoMark";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Browse AI Solutions | ${BRAND_NAME}`,
  description: "Find productized AI automations for your business. Discovery Scans, Custom Projects, and ready-made solutions.",
  openGraph: {
    title: `Browse AI Solutions | ${BRAND_NAME}`,
    description: "Find productized AI automations for your business.",
  },
};

export default async function SolutionsPage() {
  // Fetch from DB
  const [publishedSolutions, ecosystems] = await Promise.all([
    getPublishedSolutions(),
    getPublishedEcosystems()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="flex justify-center py-20 animate-pulse"><LogoMark size={48} /></div>}>
        <SolutionsPageClient 
          initialSolutions={publishedSolutions} 
          categories={categories}
          ecosystems={ecosystems} // Pass ecosystems
        />
      </Suspense>
    </div>
  );
}
