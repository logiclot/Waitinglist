import { Suspense } from "react";
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

function SolutionCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col h-full overflow-hidden animate-pulse">
      <div className="p-6 flex-1 flex flex-col">
        {/* Category badge + status badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="h-5 w-20 bg-muted rounded-full" />
          <div className="flex gap-1.5">
            <div className="h-5 w-14 bg-muted rounded-full" />
          </div>
        </div>
        {/* Title */}
        <div className="h-5 w-4/5 bg-muted rounded mb-2" />
        <div className="h-5 w-3/5 bg-muted rounded mb-4" />
        {/* Description */}
        <div className="h-4 w-full bg-muted rounded mb-1.5" />
        <div className="h-4 w-2/3 bg-muted rounded mb-4" />
        {/* Tech stack tags */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-muted rounded-md" />
          <div className="h-6 w-14 bg-muted rounded-md" />
          <div className="h-6 w-12 bg-muted rounded-md" />
        </div>
        {/* Proof strip */}
        <div className="mt-auto pt-3 border-t border-border">
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
      {/* Bottom pricing section */}
      <div className="p-6 pt-0 bg-secondary/5">
        {/* Expert attribution */}
        <div className="flex items-center gap-2 pb-3">
          <div className="w-6 h-6 rounded-full bg-muted" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
        <div className="flex items-end justify-between py-4 border-t border-border">
          <div>
            <div className="h-3 w-24 bg-muted rounded mb-2" />
            <div className="h-6 w-20 bg-muted rounded mb-2" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
          <div className="text-right">
            <div className="h-3 w-20 bg-muted rounded mb-2" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-10 bg-muted rounded-xl" />
          <div className="h-10 w-10 bg-muted rounded-lg" />
          <div className="h-10 w-10 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function MySolutionsSkeleton() {
  return (
    <>
      {/* SharePortfolioButton placeholder */}
      <div className="h-5 w-40 bg-muted rounded animate-pulse" />
      {/* Tabs skeleton */}
      <div className="border-b border-border flex gap-6">
        <div className="pb-3 flex items-center gap-1.5">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="pb-3 flex items-center gap-1.5">
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SolutionCardSkeleton />
        <SolutionCardSkeleton />
        <SolutionCardSkeleton />
      </div>
    </>
  );
}

export default function ExpertMySolutionsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">My Solutions</h1>
          <p className="text-muted-foreground">Manage your productized services, pricing, and visibility.</p>
        </div>
        <a
          href="/expert/add-solution"
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          + Add Solution
        </a>
      </div>

      <Suspense fallback={<MySolutionsSkeleton />}>
        <SolutionsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SolutionsContent({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!expert) {
    redirect("/onboarding");
  }

  const rawSolutions = await prisma.solution.findMany({
    where: { expertId: expert.id, status: { not: "archived" } },
    orderBy: { updatedAt: "desc" },
    include: { expert: true },
  });

  const solutionsWithLock = await Promise.all(
    rawSolutions.map(async (sol) => {
      const lockState = await getSolutionLockState(sol.id);
      return {
        ...sol,
        locked: lockState.locked,
        lockedReason: lockState.reason,
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

  const filteredSolutions = solutionsWithLock.filter((s) =>
    activeTab === "draft" ? s.status === "draft" : s.status === "published"
  );

  return (
    <>
      {expert.slug && (
        <div className="pt-1 -mt-6">
          <SharePortfolioButton slug={expert.slug} />
        </div>
      )}

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
          Published ({solutionsWithLock.filter((s) => s.status === "published").length})
        </a>
        <a
          href="/expert/my-solutions?tab=draft"
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "draft"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Drafts ({solutionsWithLock.filter((s) => s.status === "draft").length})
        </a>
      </div>

      {/* List */}
      {filteredSolutions.length === 0 ? (
        <EmptyState
          title={activeTab === "published" ? "No published solutions" : "No drafts"}
          description={
            activeTab === "published"
              ? "You haven't published any solutions yet. Finish a draft to go live."
              : "You don't have any drafts in progress."
          }
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
    </>
  );
}
