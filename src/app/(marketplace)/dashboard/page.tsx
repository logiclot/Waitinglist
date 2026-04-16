import { ExpertOverview, ExpertOverviewSkeleton } from "@/components/dashboard/ExpertOverview";
import { Suspense } from "react";

export default async function DashboardPage() {
  return (
    <Suspense fallback={<ExpertOverviewSkeleton />}>
      <ExpertOverview />
    </Suspense>
  );
}





