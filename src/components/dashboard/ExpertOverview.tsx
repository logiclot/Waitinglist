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
} from "lucide-react";
import { toast } from "sonner";
import { formatCentsToCurrency } from "@/lib/commission";
import { ActiveCoupons } from "./ActiveCoupons";

interface ActiveOrder {
  id: string;
  solutionTitle: string;
  buyerName: string;
}

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

interface ExpertOverviewProps {
  referralStats?: ReferralStats;
  activeCoupons?: { code: string; title: string }[];
  hasCalendarUrl?: boolean;
  hasStripeConnected?: boolean;
  isFoundingExpert?: boolean;
  publishedSolutionCount?: number;
  earningsThisMonthCents?: number;
  inEscrowCents?: number;
  activeOrders?: ActiveOrder[];
  topSolution?: TopSolution | null;
  recentJobs?: RecentJob[];
  totalCompletedSales?: number;
  portfolioSlug?: string | null;
}

export function ExpertOverview({
  referralStats,
  activeCoupons = [],
  hasCalendarUrl,
  hasStripeConnected,
  isFoundingExpert,
  publishedSolutionCount = 0,
  earningsThisMonthCents = 0,
  inEscrowCents = 0,
  activeOrders = [],
  topSolution,
  recentJobs = [],
  totalCompletedSales = 0,
  portfolioSlug,
}: ExpertOverviewProps) {
  const [referralLink, setReferralLink] = useState("");
  useEffect(() => {
    setReferralLink(`${window.location.origin}/auth/signup?ref=${referralStats?.referralCode || ""}`);
  }, [referralStats?.referralCode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* Active Coupons */}
      {activeCoupons.length > 0 && (
        <section className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">Your coupons:</span>
          <ActiveCoupons coupons={activeCoupons} />
        </section>
      )}

      {/* Header + Earnings */}
      <section className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-1.5">Build once. Earn on every delivery.</h1>
          <p className="text-muted-foreground text-sm">Qualified requests arrive daily. You focus on delivery.</p>
        </div>

        <div className="flex gap-3">
          {isFoundingExpert && (
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-4 min-w-[130px] flex flex-col justify-center">
              <p className="text-xs text-neutral-300 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" /> Founder
              </p>
              <p className="text-sm font-medium text-white">11% Fee Locked</p>
            </div>
          )}
          <div className="bg-card border border-border rounded-xl p-4 min-w-[130px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">This Month</p>
            <p className="text-2xl font-bold">
              {earningsThisMonthCents > 0 ? formatCentsToCurrency(earningsThisMonthCents) : "—"}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 min-w-[130px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">In Escrow</p>
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
              Share your link. When a referred expert stays active for 3 days and publishes a solution, you receive{" "}
              <span className="font-bold text-foreground">5% off our platform fee</span> for your next 2 sales.
            </p>
            <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md p-2 w-fit">
              <code className="text-sm font-mono text-muted-foreground truncate max-w-[200px] md:max-w-none">
                {referralLink}
              </code>
              <button onClick={copyToClipboard} className="p-1 hover:bg-secondary rounded-md transition-colors" title="Copy link">
                <Copy className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>

          <div className="flex gap-8 text-right">
            {(referralStats?.referralRewards?.expertDiscountCount || 0) > 0 && (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  <Gift className="w-4 h-4 text-green-500 shrink-0" />
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      {referralStats?.referralRewards?.expertDiscountCount} discount credit
                      {referralStats?.referralRewards?.expertDiscountCount !== 1 ? "s" : ""} available
                    </p>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70">
                      5% off platform fee · auto-applied on next sale
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col items-end">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Referrals</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{referralStats?.referralCount || 0}</span>
                <span className="text-sm font-medium text-muted-foreground">joined</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Experts</p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Priority Actions */}
      {(!hasStripeConnected || !hasCalendarUrl || (!isFoundingExpert && publishedSolutionCount < 3) || publishedSolutionCount < 3) && (
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
                  <p className="text-xs text-muted-foreground truncate">Required to receive payouts</p>
                </div>
                <Link href="/expert/settings" className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors">
                  Connect
                </Link>
              </div>
            )}
            {!hasCalendarUrl && (
              <div className="min-w-[300px] flex-shrink-0 snap-start bg-primary/5 border border-primary/15 p-4 rounded-xl flex items-center gap-4">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">Link Work Calendar</p>
                  <p className="text-xs text-muted-foreground truncate">Let clients book demos and calls</p>
                </div>
                <Link href="/expert/settings" className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors">
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
                    Publish {3 - publishedSolutionCount} more solution{3 - publishedSolutionCount !== 1 ? "s" : ""} to unlock 11% fee
                  </p>
                </div>
                <Link href="/expert/my-solutions/new" className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors">
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
                    Publish {3 - publishedSolutionCount} more solution{3 - publishedSolutionCount !== 1 ? "s" : ""} to unlock
                  </p>
                </div>
                {portfolioSlug ? (
                  <Link href={`/p/${portfolioSlug}`} className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors">
                    View
                  </Link>
                ) : (
                  <Link href="/expert/add-solution" className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 transition-colors">
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
              <Link href="/jobs/discovery" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
                No open requests right now.{" "}
                <Link href="/jobs/discovery" className="text-primary hover:underline">Check the full feed.</Link>
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
                      <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="bg-secondary px-1.5 py-0.5 rounded">{job.category}</span>
                        <span className="text-green-500 font-medium">{job.budgetRange}</span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-1 rounded">New</span>
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
                <Link href="/solutions" className="text-primary hover:underline">Publish a solution</Link> to start getting orders.
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
                        <td className="px-4 py-3 font-medium truncate max-w-[180px]">{order.solutionTitle}</td>
                        <td className="px-4 py-3 text-muted-foreground">{order.buyerName}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full font-bold">In Progress</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/expert/projects/${order.id}`} className="text-xs font-bold text-primary hover:underline">
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <p className="text-xs text-muted-foreground">{topSolution.category}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="text-center p-2 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground">Sales</p>
                    <p className="font-bold text-sm">{topSolution.completedSalesCount}</p>
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
                <p className="text-sm text-muted-foreground mb-3">No published solutions yet.</p>
                <Link href="/expert/my-solutions/new" className="text-xs text-primary hover:underline font-medium">
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
                <span className="text-sm text-muted-foreground">Completed Sales</span>
                <span className="font-bold text-sm flex items-center gap-1">
                  {totalCompletedSales}
                  {totalCompletedSales > 0 && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Orders</span>
                <span className="font-bold text-sm">{activeOrders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rating</span>
                <span className="text-sm text-muted-foreground italic">No reviews yet</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
