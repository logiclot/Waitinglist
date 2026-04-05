import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Lock, Sparkles, Crown, Compass, Briefcase,
  ArrowRight, Clock, Euro
} from "lucide-react";
import { markJobsViewed } from "@/actions/jobs";

export const dynamic = "force-dynamic";

// Extracts a human-readable preview from a job's goal field.
// If the goal is stored as BriefV2 JSON, we pull the business model + top pain points.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function goalPreview(goal: string): string {
  if (!goal) return "";
  if (!goal.trim().startsWith("{")) {
    return goal.slice(0, 200).replace(/\*\*/g, "").trim();
  }
  try {
    const brief = JSON.parse(goal);
    if (brief.version && Array.isArray(brief.sections)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sA = brief.sections.find((s: any) => s.id === "A");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sD = brief.sections.find((s: any) => s.id === "D");
      const model    = sA?.qa?.[0]?.a;
      const products = sA?.qa?.[1]?.a;
      const pain     = sD?.qa?.[0]?.a;
      const modelStr    = Array.isArray(model)    ? model.join(", ")    : (model ?? "");
      const productsStr = Array.isArray(products) ? products.join(", ") : (products ?? "");
      const painArr     = Array.isArray(pain)     ? pain                : (pain ? [pain] : []);
      const parts: string[] = [];
      if (modelStr)           parts.push(modelStr);
      if (productsStr)        parts.push(`selling ${productsStr}`);
      if (painArr.length > 0) parts.push(`Key pain: ${painArr.slice(0, 2).join(", ")}`);
      return parts.join(" · ") || "Discovery Scan — view for full brief";
    }
  } catch { /* fall through */ }
  return "Discovery Scan — view for full brief";
}

const isDiscovery = (category: string) =>
  category === "Discovery" || category === "Discovery Scan";

export default async function JobsIndexPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/sign-in?next=/jobs");

  const isBuyer      = session.user.role === "BUSINESS";
  const isSpecialist = session.user.role === "EXPERT";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let jobs: any[]  = [];
  let canViewJobs  = false;
  let expertTier   = "STANDARD";
  let isFoundingExpert = false;
  // Set of job IDs the current expert has already bid on
  const alreadyBidJobIds = new Set<string>();

  if (isBuyer) {
    canViewJobs = true;
    jobs = await prisma.jobPost.findMany({
      where: { buyerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bids: true } } },
    });
  } else if (isSpecialist) {
    const profile = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, tier: true, isFoundingExpert: true },
    });
    expertTier = profile?.tier ?? "STANDARD";
    isFoundingExpert = profile?.isFoundingExpert ?? false;
    // PROVEN experts see the feed (with Custom Projects blurred)
    // ELITE + Founding have full access
    canViewJobs = expertTier === "ELITE" || expertTier === "PROVEN" || isFoundingExpert;
    if (canViewJobs && profile) {
      jobs = await prisma.jobPost.findMany({
        where: { status: "open" },
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { include: { businessProfile: true } },
          _count: { select: { bids: true } },
        },
      });
      // Find which of these jobs the expert already submitted a bid for
      const myBids = await prisma.bid.findMany({
        where: {
          specialistId: profile.id,
          jobPostId: { in: jobs.map((j) => j.id) },
        },
        select: { jobPostId: true },
      });
      myBids.forEach((b) => alreadyBidJobIds.add(b.jobPostId));
    }

    // Mark jobs as viewed to clear the "Find Work" sidebar badge
    await markJobsViewed();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">
          {isBuyer ? "My Job Requests" : "Open Jobs"}
        </h1>
        {isBuyer && (
          <div className="flex gap-3">
            <Link
              href="/jobs/discovery"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"
            >
              <Sparkles className="h-4 w-4" /> Discovery Scan
              <span className="text-xs opacity-60">€50</span>
            </Link>
            <Link
              href="/jobs/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
            >
              <Crown className="h-4 w-4" /> Custom Project
              <span className="text-xs opacity-70">€100</span>
            </Link>
          </div>
        )}
      </div>

      {/* Expert locked out (STANDARD tier) */}
      {isSpecialist && !canViewJobs && (
        <div className="bg-secondary/10 border border-border rounded-xl p-12 text-center">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Proven Tier Required</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Complete <strong>5 successful projects</strong> to reach Proven tier and unlock Discovery Scans and Custom Projects.
          </p>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors text-sm"
          >
            View my progress
          </Link>
        </div>
      )}

      {/* Feed */}
      {canViewJobs && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <h3 className="text-lg font-medium mb-2">
                {isBuyer ? "No jobs posted yet" : "No open jobs right now"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
                {isBuyer
                  ? "Post a Discovery Scan or Custom Project to start receiving expert proposals."
                  : "New posts arrive regularly. Check back soon."}
              </p>
              {isBuyer && (
                <div className="flex justify-center gap-4">
                  <Link href="/jobs/discovery" className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium text-sm">
                    <Sparkles className="h-4 w-4" /> Launch Discovery Scan
                  </Link>
                  <Link href="/jobs/new" className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium text-sm">
                    <Crown className="h-4 w-4" /> Post Custom Project
                  </Link>
                </div>
              )}
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isBuyer={isBuyer}
                alreadyBid={alreadyBidJobIds.has(job.id)}
                isCustomProjectLocked={false}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface JobCardJob {
  id: string;
  category: string;
  goal: string | null;
  status: string;
  title: string;
  budgetRange?: string | null;
  timeline?: string | null;
  createdAt: Date;
  _count: { bids: number };
}

function JobCard({ job, isBuyer, alreadyBid = false, isCustomProjectLocked = false }: {
  job: JobCardJob; isBuyer: boolean; alreadyBid?: boolean; isCustomProjectLocked?: boolean;
}) {
  const discovery = isDiscovery(job.category);
  const preview   = goalPreview(job.goal ?? "");
  const maxBids   = discovery ? 5 : 3;
  const ctaLabel  = isBuyer || alreadyBid ? "View" : "Bid";

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden transition-colors ${isCustomProjectLocked ? "opacity-75" : "hover:border-primary/40"} relative touch-manipulation`}>
      {/* Category stripe */}
      <div className={`flex items-center gap-2 px-5 py-2.5 border-b text-xs font-semibold ${
        discovery
          ? "bg-primary/5 border-primary/15 text-primary"
          : "bg-secondary/60 border-border text-muted-foreground"
      }`}>
        {discovery
          ? <><Compass className="h-3.5 w-3.5" /> Discovery Scan</>
          : <><Briefcase className="h-3.5 w-3.5" /> Custom Project</>}
        {alreadyBid && !isBuyer && (
          <span className="ml-auto text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
            Bid submitted
          </span>
        )}
        {job.status === "pending_payment" && (
          <span className="ml-auto text-xs bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-2 py-0.5 rounded-full">
            Pending payment
          </span>
        )}
      </div>

      {/* Body */}
      <div className={`p-5 flex items-start justify-between gap-4 ${isCustomProjectLocked ? "blur-sm select-none pointer-events-none" : ""}`}>
        <div className="flex-1 min-w-0 space-y-2.5">
          <h3 className="font-bold text-base leading-snug">{job.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{preview}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
            {!discovery && job.budgetRange && (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Euro className="h-3 w-3" />{job.budgetRange}
              </span>
            )}
            {!discovery && job.timeline && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />{job.timeline}
              </span>
            )}
            <span>{job._count.bids} / {maxBids} proposals</span>
            <span>{new Date(job.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
          </div>
        </div>
        <div className="shrink-0">
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-lg text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 justify-center"
          >
            {ctaLabel}<ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Lock overlay for PROVEN experts viewing Custom Projects */}
      {isCustomProjectLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
          <div className="bg-card border border-border rounded-xl px-5 py-4 text-center shadow-lg max-w-xs mx-4">
            <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="font-semibold text-sm mb-1">Proven Tier Required</p>
            <p className="text-xs text-muted-foreground">
              Complete 5 projects to unlock all job types.
            </p>
            <Link href="/dashboard" className="text-xs text-primary hover:underline mt-2 block">
              View my progress →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
