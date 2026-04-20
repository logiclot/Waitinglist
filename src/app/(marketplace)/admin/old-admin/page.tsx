import { Suspense } from "react";
import {
  getAdminData,
  getDisputedOrders,
  getEliteApplications,
} from "@/actions/admin";
import { AdminDashboard } from "@/components/admin/old-admin/AdminDashboard";
import { redirect } from "next/navigation";
import type { Solution, SolutionStatus } from "@/types";
import type { AdminDispute } from "@/components/admin/old-admin/DisputeManagementTab";

function AdminLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="h-10 w-full bg-muted rounded" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminLoadingSkeleton />}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  const data = await getAdminData();

  if ("error" in data) {
    redirect("/auth/sign-in");
  }

  const disputeData = await getDisputedOrders();
  const eliteAppsData = await getEliteApplications();

  const disputes =
    "error" in disputeData
      ? []
      : (disputeData.disputes as unknown as AdminDispute[]);
  const eliteApplications =
    eliteAppsData && !("error" in eliteAppsData)
      ? eliteAppsData.applications
      : [];

  return (
    <AdminDashboard
      initialOrders={data.orders}
      initialDisputes={disputes}
      initialEliteApplications={eliteApplications}
    />
  );
}