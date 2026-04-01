import { EmptyState } from "@/components/EmptyState";

export default function BillingPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Billing & Plans</h1>
      <EmptyState
        title="Payment Methods"
        description="Manage your payment methods and view billing history."
        primaryCtaLabel="Browse Solutions"
        primaryCtaHref="/solutions"
      />
    </div>
  );
}
