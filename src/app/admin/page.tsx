import { getAdminData, getDisputedOrders } from "@/actions/admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { redirect } from "next/navigation";
import type { Solution, SolutionStatus } from "@/types";
import type { AdminExpert } from "@/components/admin/AdminDashboard";
import type { AdminDispute } from "@/components/admin/DisputeManagementTab";

export default async function AdminPage() {
  const [data, disputeData] = await Promise.all([
    getAdminData(),
    getDisputedOrders(),
  ]);

  if ("error" in data) {
    redirect("/auth/sign-in");
  }

  // Map Prisma camelCase fields to the snake_case fields expected by Solution type
  const solutions = (data.solutions as { implementationPriceCents: number; monthlyCostMinCents: number | null; monthlyCostMaxCents: number | null; deliveryDays: number; status: string; outcome: string | null; [key: string]: unknown }[]).map((s) => ({
    ...s,
    implementation_price_cents: s.implementationPriceCents,
    implementation_price: s.implementationPriceCents / 100,
    monthly_cost_min: s.monthlyCostMinCents ? s.monthlyCostMinCents / 100 : 0,
    monthly_cost_max: s.monthlyCostMaxCents ? s.monthlyCostMaxCents / 100 : 0,
    delivery_days: s.deliveryDays,
    status: s.status as SolutionStatus,
    outcome: s.outcome ?? undefined,
  })) as unknown as Solution[];

  const disputes = "error" in disputeData ? [] : (disputeData.disputes as unknown as AdminDispute[]);

  return (
    <AdminDashboard
      initialExperts={data.experts as unknown as AdminExpert[]}
      initialSolutions={solutions}
      initialOrders={data.orders}
      initialBusinesses={data.businesses}
      initialDisputes={disputes}
      stats={data.stats}
    />
  );
}
