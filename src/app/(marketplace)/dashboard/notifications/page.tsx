import { EmptyState } from "@/components/EmptyState";

export default function NotificationsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Notifications</h1>
      <EmptyState
        title="All caught up"
        description="You have no new notifications."
        primaryCtaLabel="Go to Dashboard"
        primaryCtaHref="/dashboard"
      />
    </div>
  );
}
