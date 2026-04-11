import { Suspense } from "react";
import {
  getAdminData,
  getDisputedOrders,
  getAuditCompletions,
  getEliteApplications,
} from "@/actions/admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { redirect } from "next/navigation";
import type { Solution, SolutionStatus } from "@/types";
import type { AdminExpert } from "@/components/admin/AdminDashboard";
import type { AdminDispute } from "@/components/admin/DisputeManagementTab";

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

  // Map Prisma camelCase fields to the snake_case fields expected by Solution type
  const solutions = (
    data.solutions as {
      implementationPriceCents: number;
      monthlyCostMinCents: number | null;
      monthlyCostMaxCents: number | null;
      deliveryDays: number;
      status: string;
      outcome: string | null;
      [key: string]: unknown;
    }[]
  ).map((s) => ({
    ...s,
    implementation_price_cents: s.implementationPriceCents,
    implementation_price: s.implementationPriceCents / 100,
    monthly_cost_min: s.monthlyCostMinCents ? s.monthlyCostMinCents / 100 : 0,
    monthly_cost_max: s.monthlyCostMaxCents ? s.monthlyCostMaxCents / 100 : 0,
    delivery_days: s.deliveryDays,
    status: s.status as SolutionStatus,
    outcome: s.outcome ?? undefined,
  })) as unknown as Solution[];

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
      initialExperts={data.experts as unknown as AdminExpert[]}
      initialSolutions={solutions}
      initialOrders={data.orders}
      initialBusinesses={data.businesses}
      initialDisputes={disputes}
      // initialAuditCompletions={(auditCompletions ?? []) as AuditCompletion[]}
      initialEliteApplications={eliteApplications}
      stats={data.stats}
    />
  );
}
