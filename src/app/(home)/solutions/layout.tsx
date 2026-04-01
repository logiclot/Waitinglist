import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { prisma } from "@/lib/prisma";

function SidebarSkeleton() {
  return (
    <aside className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden md:flex flex-col">
      <div className="p-4 space-y-1 flex-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
            <div
              className="h-4 rounded bg-muted animate-pulse"
              style={{ width: `${60 + ((i * 17) % 40)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border space-y-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
            <div
              className="h-4 rounded bg-muted animate-pulse"
              style={{ width: `${50 + ((i * 23) % 30)}%` }}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}

async function ExpertSolutionsSidebar({ userId }: { userId: string }) {
  return <Sidebar role="EXPERT" />;
}

export default async function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const sidebarRole =
    role === "EXPERT"
      ? "EXPERT"
      : role === "BUSINESS" || role === "ADMIN"
        ? "BUSINESS"
        : null;

  if (!sidebarRole) {
    return <>{children}</>;
  }

  const sidebar =
    sidebarRole === "EXPERT" && session?.user?.id ? (
      <Suspense fallback={<SidebarSkeleton />}>
        <ExpertSolutionsSidebar userId={session.user.id} />
      </Suspense>
    ) : (
      <Sidebar role={sidebarRole} />
    );

  return (
    <div className="flex min-h-screen bg-background">
      {sidebar}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
