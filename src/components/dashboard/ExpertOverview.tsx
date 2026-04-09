"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Zap,
  Search,
  TrendingUp,
  Briefcase,
  Crown,
  Users,
  Copy,
  Calendar,
  Gift,
  CheckCircle,
  ArrowRight,
  CreditCard,
  Award,
  Paintbrush,
  Star,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { formatCentsToCurrency, TIER_THRESHOLDS } from "@/lib/commission";
import { SpecialistTier } from "@prisma/client";

interface ActiveOrder {
  id: string;
  status: string;
  solutionTitle: string;
  buyerName: string;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  paid_pending_implementation: {
    label: "Action Required",
    className: "bg-amber-500/10 text-amber-600",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-500",
  },
  delivered: {
    label: "Awaiting Approval",
    className: "bg-amber-500/10 text-amber-600",
  },
  revision_requested: {
    label: "Revision Requested",
    className: "bg-amber-500/10 text-amber-600",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-600",
  },
  disputed: {
    label: "Under Review",
    className: "bg-amber-500/10 text-amber-600",
  },
  refunded: { label: "Refunded", className: "bg-slate-500/10 text-slate-500" },
};

interface TopSolution {
  id: string;
  title: string;
  category: string;
  completedSalesCount: number;
}

interface RecentJob {
  id: string;
  title: string;
  category: string;
  budgetRange: string;
}

interface ReferralRewards {
  expertDiscountCount: number;
  businessDiscountCount: number;
}

interface ReferralStats {
  referralCode?: string | null;
  referralRewards?: ReferralRewards | null;
  referralCount?: number;
  pendingCount?: number;
  error?: string;
}

interface EliteApplicationInfo {
  status: string | null; // "pending" | "approved" | "denied" | null
  appliedAt?: string | null;
  deniedAt?: string | null;
  deniedReason?: string | null;
  demotedAt?: string | null;
  demotedReason?: string | null;
}

interface ExpertOverviewProps {
  referralStats?: ReferralStats;
  activeCoupons?: { code: string; title: string }[];
  hasCalendarUrl?: boolean;
  hasStripeConnected?: boolean;
  isFoundingExpert?: boolean;
  tier?: SpecialistTier;
  publishedSolutionCount?: number;
  earningsThisMonthCents?: number;
  inEscrowCents?: number;
  activeOrders?: ActiveOrder[];
  topSolution?: TopSolution | null;
  recentJobs?: RecentJob[];
  totalCompletedSales?: number;
  portfolioSlug?: string | null;
  eliteApplication?: EliteApplicationInfo | null;
  newExpertBoostUntil?: string | null;
}

export function ExpertOverview({
  referralStats,
  activeCoupons = [],
  hasCalendarUrl,
  hasStripeConnected,
  isFoundingExpert,
  tier = "STANDARD",
  publishedSolutionCount = 0,
  earningsThisMonthCents = 0,
  inEscrowCents = 0,
  activeOrders = [],
  topSolution,
  recentJobs = [],
  totalCompletedSales = 0,
  portfolioSlug,
  eliteApplication,
  newExpertBoostUntil,
}: ExpertOverviewProps) {
  const [referralLink, setReferralLink] = useState("");
  useEffect(() => {
    setReferralLink(
      `${window.location.origin}/auth/signup?ref=${referralStats?.referralCode || ""}`,
    );
  }, [referralStats?.referralCode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Coupon banner removed for experts — coupons are applied automatically to their platform fee */}

      {/* Header + Earnings */}
      <section className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-1.5">
            Build once. Earn on every delivery.
          </h1>
          <p className="text-muted-foreground text-sm">
            Qualified requests arrive daily. You focus on delivery.
          </p>
        </div>

        <div className="flex gap-3">
          {(() => {
            // Use admin override → founding rate → DB tier (authoritative)
            const fee = TIER_THRESHOLDS[tier];
            const tierLabel = isFoundingExpert
              ? "Founder"
              : tier === "ELITE"
                ? "Elite"
                : tier === "PROVEN"
                  ? "Proven"
                  : "Standard";
            const TierIcon = isFoundingExpert
              ? Crown
              : tier === "ELITE"
                ? Award
                : TrendingUp;
            const isFounder = isFoundingExpert;
            return (
              <div
                className={`rounded-xl p-4 min-w-[130px] flex flex-col justify-center ${
                  isFounder
                    ? "bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700"
                    : "bg-card border border-border"
                }`}
              >
                <p
                  className={`text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-1 ${
                    isFounder ? "text-neutral-300" : "text-muted-foreground"
                  }`}
                >
                  <TierIcon
                    className={`w-3 h-3 ${isFounder ? "text-amber-400" : "text-foreground"}`}
                  />{" "}
                  {tierLabel}
                </p>
                <p
                  className={`text-sm font-medium ${isFounder ? "text-white" : "text-foreground"}`}
                >
                  {fee}% Fee
                </p>
              </div>
            );
          })()}
          <div className="bg-card border border-border rounded-xl p-4 min-w-[130px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              This Month
            </p>
            <p className="text-2xl font-bold">
              {earningsThisMonthCents > 0
                ? formatCentsToCurrency(earningsThisMonthCents)
                : "—"}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 min-w-[130px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              In Escrow
            </p>
            <p className="text-2xl font-bold text-muted-foreground">
              {inEscrowCents > 0 ? formatCentsToCurrency(inEscrowCents) : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Referral Section — shown only after first sale */}
      {totalCompletedSales >= 1 && (
        <section className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-base mb-1.5 flex items-center gap-2">
                <Users className="w-5 h-5 text-foreground" /> Referral Program
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                Share your link. When a referred expert stays active for 3 days
                and publishes a solution, you receive{" "}
                <span className="font-bold text-foreground">
                  5% off our platform fee
                </span>{" "}
                for your next 2 sales.
              </p>
              <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md p-2 w-fit">
                <code className="text-sm font-mono text-muted-foreground truncate max-w-[200px] md:max-w-none">
                  {referralLink}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-secondary rounded-md transition-colors"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>

            <div className="flex gap-8 text-right">
              {(referralStats?.referralRewards?.expertDiscountCount || 0) >
                0 && (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                    <Gift className="w-4 h-4 text-green-500 shrink-0" />
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        {referralStats?.referralRewards?.expertDiscountCount}{" "}
                        discount credit
                        {referralStats?.referralRewards?.expertDiscountCount !==
                        1
                          ? "s"
                          : ""}{" "}
                        available
                      </p>
                      <p className="text-xs text-green-600/70 dark:text-green-400/70">
                        5% off platform fee · auto-applied on next sale
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-end">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                  Referrals
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {referralStats?.referralCount || 0}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    joined
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Experts</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New Expert Boost Banner */}
      {newExpertBoostUntil && new Date(newExpertBoostUntil) > new Date() && (
        <section className="bg-card border border-primary/20 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">New Expert Boost Active</h3>
            <p className="text-xs text-muted-foreground">
              Your solutions get extra visibility for{" "}
              {Math.ceil(
                (new Date(newExpertBoostUntil).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              )}{" "}
              more day
              {Math.ceil(
                (new Date(newExpertBoostUntil).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              ) !== 1
                ? "s"
                : ""}
              . Make the most of it by publishing your best work.
            </p>
          </div>
        </section>
      )}

      {/* Progress toward next tier */}
      {tier === "STANDARD" && !isFoundingExpert && totalCompletedSales < 5 && (
        <section className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Progress to Proven
            </h3>
            <span className="text-xs text-muted-foreground">
              {totalCompletedSales}/5 sales
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${Math.min((totalCompletedSales / 5) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {5 - totalCompletedSales} more sale
            {5 - totalCompletedSales !== 1 ? "s" : ""} to unlock Proven tier (
            {TIER_THRESHOLDS.PROVEN}% fee) and access to Discovery Scans and
            Custom Projects.
          </p>
        </section>
      )}

      {/* Elite Application Section */}
      {tier === "PROVEN" &&
        !isFoundingExpert &&
        totalCompletedSales >= 10 &&
        eliteApplication?.status !== "approved" && (
          <EliteApplicationCard
            application={eliteApplication}
            onApply={async () => {
              const { applyForElite } = await import("@/actions/expert");
              const res = await applyForElite();
              if (res.error) {
                toast.error(res.error);
                return;
              }
              toast.success(
                "Elite application submitted! We'll review it shortly.",
              );
              window.location.reload();
            }}
          />
        )}

      {/* Priority Actions */}
      {(!hasStripeConnected ||
        !hasCalendarUrl ||
        (!isFoundingExpert && publishedSolutionCount < 3) ||
        publishedSolutionCount < 3) && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Priority Actions</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
            {!hasStripeConnected && (
              <div className="min-w-[300px] flex-shrink-0 snap-start bg-primary/5 border border-primary/15 p-4 rounded-xl flex items-center gap-4">
                <CreditCard className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">Connect Stripe</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Required to receive payouts
                  </p>
                </div>
                <Link
                  href="/expert/settings"
                  className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  Connect
                </Link>
              </div>
            )}
            {!hasCalendarUrl && (
              <div className="min-w-[300px] flex-shrink-0 snap-start bg-primary/5 border border-primary/15 p-4 rounded-xl flex items-center gap-4">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">Link Work Calendar</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Let clients book demos and calls
                  </p>
                </div>
                <Link
                  href="/expert/settings"
                  className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  Link
                </Link>
              </div>
            )}
            {!isFoundingExpert && publishedSolutionCount < 3 && (
              <div className="min-w-[300px] flex-shrink-0 snap-start bg-primary/5 border border-primary/15 p-4 rounded-xl flex items-center gap-4">
                <Award className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">Founding Expert Badge</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Publish {3 - publishedSolutionCount} more solution
                    {3 - publishedSolutionCount !== 1 ? "s" : ""} to unlock 11%
                    fee
                  </p>
                </div>
                <Link
                  href="/expert/my-solutions/new"
                  className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  Create
                </Link>
              </div>
            )}
            {publishedSolutionCount < 3 && (
              <div className="min-w-[300px] flex-shrink-0 snap-start bg-primary/5 border border-primary/15 p-4 rounded-xl flex items-center gap-4">
                <Paintbrush className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">Customize Portfolio</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Publish {3 - publishedSolutionCount} more solution
                    {3 - publishedSolutionCount !== 1 ? "s" : ""} to unlock
                  </p>
                </div>
                {portfolioSlug ? (
                  <Link
                    href={`/p/${portfolioSlug}`}
                    className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors"
                  >
                    View
                  </Link>
                ) : (
                  <Link
                    href="/expert/add-solution"
                    className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors"
                  >
                    Create
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* New Opportunities */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">New Opportunities</h2>
              </div>
              <Link
                href="/jobs/discovery"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
                No open requests right now.{" "}
                <Link
                  href="/jobs/discovery"
                  className="text-primary hover:underline"
                >
                  Check the full feed.
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="group bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="bg-secondary px-1.5 py-0.5 rounded">
                          {job.category}
                        </span>
                        <span className="text-green-500 font-medium">
                          {job.budgetRange}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-1 rounded">
                      New
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Active Projects */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Active Projects</h2>
            </div>

            {activeOrders.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
                No active projects yet.{" "}
                <Link
                  href="/solutions"
                  className="text-primary hover:underline"
                >
                  Publish a solution
                </Link>{" "}
                to start getting orders.
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3 font-medium truncate max-w-[180px]">
                          {order.solutionTitle}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {order.buyerName}
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const badge = STATUS_BADGE[order.status] ?? {
                              label: order.status.replace(/_/g, " "),
                              className: "bg-muted text-muted-foreground",
                            };
                            return (
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-bold ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/expert/projects/${order.id}`}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {activeCoupons.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-t border-emerald-100 text-xs text-emerald-700">
                    <Gift className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      5% referral discount applied automatically on your
                      platform fee for the next{" "}
                      {activeCoupons.length === 1
                        ? "sale"
                        : `${activeCoupons.length} sales`}
                      .
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Col (1/3) */}
        <div className="space-y-6">
          {/* Top Solution */}
          <section className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" /> Top Solution
            </h3>
            {topSolution ? (
              <>
                <div className="mb-3">
                  <p className="font-medium text-sm">{topSolution.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {topSolution.category}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="text-center p-2 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground">Sales</p>
                    <p className="font-bold text-sm">
                      {topSolution.completedSalesCount}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-sm">{totalCompletedSales}</p>
                  </div>
                </div>
                <Link
                  href={`/expert/solutions/${topSolution.id}/edit`}
                  className="block w-full py-2 text-center bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-bold transition-colors"
                >
                  Improve Listing
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  No published solutions yet.
                </p>
                <Link
                  href="/expert/my-solutions/new"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Create your first solution →
                </Link>
              </div>
            )}
          </section>

          {/* Stats */}
          <section className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold mb-3 text-sm">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Completed Sales
                </span>
                <span className="font-bold text-sm flex items-center gap-1">
                  {totalCompletedSales}
                  {totalCompletedSales > 0 && (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Active Orders
                </span>
                <span className="font-bold text-sm">{activeOrders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rating</span>
                <span className="text-sm text-muted-foreground italic">
                  No reviews yet
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Elite Application Card ────────────────────────────────────────────────────

function EliteApplicationCard({
  application,
  onApply,
}: {
  application?: EliteApplicationInfo | null;
  onApply: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await onApply();
    } finally {
      setLoading(false);
    }
  };

  // Denied — show reason + re-apply countdown
  if (application?.status === "denied") {
    const deniedAt = application.deniedAt
      ? new Date(application.deniedAt)
      : null;
    const canReapply = deniedAt
      ? (Date.now() - deniedAt.getTime()) / (1000 * 60 * 60 * 24) >= 14
      : true;
    const daysLeft = deniedAt
      ? Math.max(
          0,
          Math.ceil(
            14 - (Date.now() - deniedAt.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

    return (
      <section className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">Elite Application</h3>
            {application.deniedReason && (
              <p className="text-xs text-muted-foreground mb-2">
                Previous application feedback: {application.deniedReason}
              </p>
            )}
            {canReapply ? (
              <button
                onClick={handleApply}
                disabled={loading}
                className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Re-apply for Elite"}
              </button>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> You can re-apply in {daysLeft} day
                {daysLeft !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Pending
  if (application?.status === "pending") {
    return (
      <section className="bg-card border border-primary/20 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-0.5">
              Elite Application Under Review
            </h3>
            <p className="text-xs text-muted-foreground">
              Your application is being reviewed. We will notify you once a
              decision is made.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Demoted — show reason + option to re-apply
  if (application?.demotedReason) {
    const demotedAt = application.demotedAt
      ? new Date(application.demotedAt)
      : null;
    const canReapply = demotedAt
      ? (Date.now() - demotedAt.getTime()) / (1000 * 60 * 60 * 24) >= 14
      : true;
    const daysLeft = demotedAt
      ? Math.max(
          0,
          Math.ceil(
            14 - (Date.now() - demotedAt.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

    return (
      <section className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">Re-apply for Elite</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Previous feedback: {application.demotedReason}
            </p>
            {canReapply ? (
              <button
                onClick={handleApply}
                disabled={loading}
                className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Re-apply for Elite"}
              </button>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> You can re-apply in {daysLeft} day
                {daysLeft !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default: eligible, not yet applied
  return (
    <section className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Star className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-0.5">
            You are eligible for Elite
          </h3>
          <p className="text-xs text-muted-foreground">
            Apply to unlock 12% commission, priority placement, and the Elite
            badge.
          </p>
        </div>
        <button
          onClick={handleApply}
          disabled={loading}
          className="shrink-0 px-4 py-2 bg-foreground text-background rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Apply for Elite"}
        </button>
      </div>
    </section>
  );
}
