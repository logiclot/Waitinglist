import { EmptyState } from "@/components/EmptyState";

export default function CompanyProfilePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Company Profile</h1>
      <EmptyState
        title="Company Information"
        description="Update your company details and preferences."
        primaryCtaLabel="Edit Details"
        primaryCtaHref="/dashboard/settings"
      />
    </div>
  );
}
