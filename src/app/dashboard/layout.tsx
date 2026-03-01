import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/dashboard");
  }

  const role = ((session.user as { role?: string }).role || "BUSINESS") as "BUSINESS" | "EXPERT" | "ADMIN";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
