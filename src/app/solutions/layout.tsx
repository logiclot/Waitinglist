import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  // ADMIN gets the BUSINESS sidebar by default
  const sidebarRole =
    role === "EXPERT" ? "EXPERT" : (role === "BUSINESS" || role === "ADMIN") ? "BUSINESS" : null;

  if (!sidebarRole) {
    // Not logged in — render without sidebar (public browsing)
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={sidebarRole} />
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
