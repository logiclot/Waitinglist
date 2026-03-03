import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { prisma } from "@/lib/prisma";

export default async function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/dashboard");
  }
  const role = session.user.role || "EXPERT";

  // Basic Gating (Middleware handles most, but double check)
  if (role !== "EXPERT" && role !== "ADMIN") {
     redirect("/dashboard");
  }

  let publishedSolutionCount = 0;
  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, slug: true },
  });
  if (expert) {
    publishedSolutionCount = await prisma.solution.count({
      where: { expertId: expert.id, status: "published" },
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="EXPERT" portfolioSlug={expert?.slug ?? null} publishedSolutionCount={publishedSolutionCount} />
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
