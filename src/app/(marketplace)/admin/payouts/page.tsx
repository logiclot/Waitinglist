import { PayoutsTable } from "@/components/admin/PayoutsTable";

export default function AdminPayoutsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manual Payouts</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage payouts for experts in Stripe-unsupported countries.
        </p>
      </div>
      <PayoutsTable />
    </div>
  );
}
