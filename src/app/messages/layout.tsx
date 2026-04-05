import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { prisma } from "@/lib/prisma";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const role = session.user.role || "BUSINESS";
  const sidebarRole =
    role === "EXPERT" ? "EXPERT" : role === "ADMIN" ? "ADMIN" : "BUSINESS";

  let portfolioSlug: string | null = null;

  if (sidebarRole === "EXPERT") {
    const expert = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, slug: true },
    });
    if (expert) {
      portfolioSlug = expert.slug;
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={sidebarRole} portfolioSlug={portfolioSlug} />
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}
