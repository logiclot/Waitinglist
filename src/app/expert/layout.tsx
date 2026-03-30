import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { prisma } from "@/lib/prisma";

function SidebarSkeleton() {
  return (
    <aside className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden md:flex flex-col">
      <div className="p-4 space-y-1 flex-1">
        {Array.from({ length: 10 }).map((_, i) => (
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

async function ExpertSidebar({ userId }: { userId: string }) {
  const expert = await prisma.specialistProfile.findUnique({
    where: { userId },
    select: { id: true, slug: true },
  });

  return <Sidebar role="EXPERT" portfolioSlug={expert?.slug ?? null} />;
}

export default async function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/dashboard");
  }

  if (session.user.role !== "EXPERT" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Suspense fallback={<SidebarSkeleton />}>
        <ExpertSidebar userId={session.user.id} />
      </Suspense>
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
