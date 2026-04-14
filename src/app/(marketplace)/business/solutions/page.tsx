import { Suspense } from "react";
import { SolutionsPageClient } from "@/components/solutions/SolutionsPageClient";
import { SolutionsPageSkeleton } from "@/components/solutions/SolutionsPageSkeleton";

export default function BusinessSolutionsPage() {
  return (
    <div className="p-8">
      <Suspense fallback={<SolutionsPageSkeleton />}>
        <SolutionsPageClient />
      </Suspense>
    </div>
  );
}
