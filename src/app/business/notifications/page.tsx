import { EmptyState } from "@/components/EmptyState";

export default function BusinessNotificationsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <EmptyState
        title="No notifications"
        description="You're all caught up! Important updates will appear here."
        primaryCtaLabel="Go to Dashboard"
        primaryCtaHref="/business"
      />
    </div>
  );
}
