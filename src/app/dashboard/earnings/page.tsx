import { EmptyState } from "@/components/EmptyState";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EarningsPage() {
  const session = await getServerSession(authOptions);
  // @ts-expect-error: role is in session
  const role = session?.user?.role;
  const isExpert = role === "SPECIALIST";

  if (!isExpert) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Billing & Payments</h1>
             <EmptyState
                title="No transaction history"
                description="Your payment history and invoices will be listed here."
                primaryCtaLabel="Browse Solutions"
                primaryCtaHref="/solutions"
             />
        </div>
      );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Earnings</h1>
      <EmptyState
        title="No earnings yet"
        description="Track your revenue and payouts here once you start completing projects."
        primaryCtaLabel="Find Work"
        primaryCtaHref="/jobs"
      />
    </div>
  );
}
