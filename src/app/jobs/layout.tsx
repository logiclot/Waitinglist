import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Find Work | ${BRAND_NAME}`,
  description: `Discovery Scans and Custom Projects — post your automation needs and receive expert proposals on ${BRAND_NAME}.`,
};

export default async function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/jobs/new");
  }
  const role = session.user.role || "BUSINESS";
  // EXPERT keeps their sidebar; everyone else (BUSINESS, ADMIN) gets the BUSINESS sidebar
  const sidebarRole = role === "EXPERT" ? "EXPERT" : "BUSINESS";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={sidebarRole} />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
