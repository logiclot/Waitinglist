import { Suspense } from "react";
import { categories } from "@/data/mock";
import { BRAND_NAME } from "@/lib/branding";
import { SolutionsPageClient } from "@/components/solutions/SolutionsPageClient";
import { getPublishedSolutions } from "@/lib/solutions/data";

export const metadata = {
  title: `Browse AI Solutions | ${BRAND_NAME}`,
  description: "Find productized AI automations for your business.",
};

export default async function SolutionsPage() {
  // Fetch from DB
  const publishedSolutions = await getPublishedSolutions();

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading solutions...</div>}>
        <SolutionsPageClient initialSolutions={publishedSolutions} categories={categories} />
      </Suspense>
    </div>
  );
}
