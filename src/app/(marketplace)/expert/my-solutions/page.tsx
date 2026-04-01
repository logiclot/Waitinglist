import { EmptyState } from "@/components/EmptyState";
import { SolutionCard } from "@/components/SolutionCard";
import { SharePortfolioButton } from "@/components/dashboard/SharePortfolioButton";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSolutionLockState } from "@/lib/solutions/lock";
import { SolutionStatus, ModerationStatus } from "@/types";
import { mapPrismaExpert } from "@/lib/solutions/data";

export default async function ExpertMySolutionsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!expert) {
    redirect("/onboarding");
  }

  // Fetch all solutions for this expert
  const rawSolutions = await prisma.solution.findMany({
    where: { expertId: expert.id, status: { not: "archived" } }, // Exclude archived
    orderBy: { updatedAt: "desc" },
    include: {
      expert: true
    }
  });

  // Calculate lock state for each solution
  const solutionsWithLock = await Promise.all(
    rawSolutions.map(async (sol) => {
      const lockState = await getSolutionLockState(sol.id);
      return {
        ...sol,
        locked: lockState.locked,
        lockedReason: lockState.reason,
        // Map Prisma camelCase fields to Solution type
        implementation_price_cents: sol.implementationPriceCents,
        implementation_price: sol.implementationPriceCents / 100,
        monthly_cost_min: sol.monthlyCostMinCents ? sol.monthlyCostMinCents / 100 : 0,
        monthly_cost_max: sol.monthlyCostMaxCents ? sol.monthlyCostMaxCents / 100 : 0,
        delivery_days: sol.deliveryDays,
        support_days: sol.supportDays,
        short_summary: sol.shortSummary,
        status: sol.status as SolutionStatus,
        outcome: sol.outcome ?? undefined,
        longDescription: sol.longDescription ?? undefined,
        moderationStatus: sol.moderationStatus as ModerationStatus | undefined,
        expert: sol.expert ? mapPrismaExpert(sol.expert) : undefined,
      } as unknown as import("@/types").Solution & { locked: boolean; lockedReason: string | undefined };
    })
  );

  const activeTab = searchParams.tab || "published";
  
  const filteredSolutions = solutionsWithLock.filter(s => 
    activeTab === "draft" ? s.status === "draft" : s.status === "published"
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">My Solutions</h1>
          <p className="text-muted-foreground">Manage your productized services, pricing, and visibility.</p>
          {expert.slug && (
            <div className="pt-1">
              <SharePortfolioButton slug={expert.slug} />
            </div>
          )}
        </div>
        <a
          href="/expert/add-solution"
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          + Add Solution
        </a>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-6">
        <a 
          href="/expert/my-solutions?tab=published" 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "published" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Published ({solutionsWithLock.filter(s => s.status === "published").length})
        </a>
        <a 
          href="/expert/my-solutions?tab=draft" 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "draft" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Drafts ({solutionsWithLock.filter(s => s.status === "draft").length})
        </a>
      </div>

      {/* List */}
      {filteredSolutions.length === 0 ? (
        <EmptyState
          title={activeTab === "published" ? "No published solutions" : "No drafts"}
          description={activeTab === "published" 
            ? "You haven't published any solutions yet. Finish a draft to go live." 
            : "You don't have any drafts in progress."}
          primaryCtaLabel={activeTab === "published" ? undefined : "Create Draft"}
          primaryCtaHref={activeTab === "published" ? undefined : "/expert/add-solution"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSolutions.map((solution) => (
            <SolutionCard 
              key={solution.id} 
              solution={solution}
              editHref={`/expert/solutions/${solution.id}/edit`}
              isLocked={solution.locked}
              lockReason={solution.lockedReason}
            />
          ))}
        </div>
      )}
    </div>
  );
}
