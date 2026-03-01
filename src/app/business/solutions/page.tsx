import { Suspense } from "react";
import { categories } from "@/data/mock";
import { SolutionsPageClient } from "@/components/solutions/SolutionsPageClient";
import { getPublishedSolutions } from "@/lib/solutions/data";
import { LogoMark } from "@/components/LogoMark";

export default async function BusinessSolutionsPage() {
  // Fetch from DB
  const publishedSolutions = await getPublishedSolutions();

  return (
    <div className="p-8">
      <Suspense fallback={<div className="flex justify-center py-20 animate-pulse"><LogoMark size={48} /></div>}>
        <SolutionsPageClient initialSolutions={publishedSolutions} categories={categories} ecosystems={[]} />
      </Suspense>
    </div>
  );
}
