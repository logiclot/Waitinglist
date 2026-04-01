import { Suspense } from "react";
import { categories } from "@/data/mock";
import { SolutionsPageClient } from "@/components/solutions/SolutionsPageClient";
import { getPublishedSolutions } from "@/lib/solutions/data";
import { SolutionsPageSkeleton } from "@/components/solutions/SolutionsPageSkeleton";

async function SolutionsContent() {
  const publishedSolutions = await getPublishedSolutions();

  return (
    <SolutionsPageClient
      initialSolutions={publishedSolutions}
      categories={categories}
      ecosystems={[]}
    />
  );
}

export default function BusinessSolutionsPage() {
  return (
    <div className="p-8">
      <Suspense fallback={<SolutionsPageSkeleton />}>
        <SolutionsContent />
      </Suspense>
    </div>
  );
}
