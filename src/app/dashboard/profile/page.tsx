import { EmptyState } from "@/components/EmptyState";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  // @ts-expect-error: role is in session
  const role = session?.user?.role;
  const isExpert = role === "SPECIALIST";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{isExpert ? "Public Profile" : "User Profile"}</h1>
      {/* Real profile editing would go here, for now empty state */}
      <EmptyState
        title="Profile Settings"
        description="Manage your public profile, bio, and portfolio here."
        primaryCtaLabel="Edit Settings"
        primaryCtaHref="/dashboard/settings"
      />
    </div>
  );
}
