import { EmptyState } from "@/components/EmptyState";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <EmptyState
        title="Account Settings"
        description="Manage your account preferences, security, and notifications."
        primaryCtaLabel="Back to Dashboard"
        primaryCtaHref="/dashboard"
      />
    </div>
  );
}
