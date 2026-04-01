import { NotificationsList } from "@/components/NotificationsList";

export default function ExpertNotificationsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <NotificationsList />
    </div>
  );
}
