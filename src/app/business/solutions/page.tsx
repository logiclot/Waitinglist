import { Suspense } from "react";
import { categories } from "@/data/mock"; // Categories can still be mock/static for now if they are just filter options
import { SolutionsPageClient } from "@/components/solutions/SolutionsPageClient";
import { getPublishedSolutions } from "@/lib/solutions/data";

export default async function BusinessSolutionsPage() {
  // Fetch from DB
  const publishedSolutions = await getPublishedSolutions();

  return (
    <div className="p-8">
      <Suspense fallback={<div>Loading solutions...</div>}>
        <SolutionsPageClient initialSolutions={publishedSolutions} categories={categories} />
      </Suspense>
    </div>
  );
}
