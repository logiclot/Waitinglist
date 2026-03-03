"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Zap, CheckCircle2, Clock, Users, Copy, Gift, ArrowRight, BarChart2 } from "lucide-react";
import { ActiveCoupons } from "./ActiveCoupons";
import { toast } from "sonner";

interface ActiveOrder {
  id: string;
  solutionTitle: string;
  status: string;
}

interface RecommendedSolution {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  implementationPrice: number;
  deliveryDays: number;
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

interface BusinessOverviewProps {
  referralStats?: ReferralStats;
  activeCoupons?: { code: string; title: string }[];
  activeOrders?: ActiveOrder[];
  recommendedSolutions?: RecommendedSolution[];
  completedProjectCount?: number;
}

export function BusinessOverview({
  referralStats,
  activeCoupons = [],
  activeOrders = [],
  recommendedSolutions = [],
  completedProjectCount = 0,
}: BusinessOverviewProps) {
  const hasActiveWork = activeOrders.length > 0;

  const [referralLink, setReferralLink] = useState("");
  useEffect(() => {
    setReferralLink(`${window.location.origin}/auth/signup?ref=${referralStats?.referralCode || ""}`);
  }, [referralStats?.referralCode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "in_progress": return { label: "In Progress", className: "bg-blue-500/10 text-blue-500" };
      case "delivered": return { label: "Awaiting Approval", className: "bg-yellow-500/10 text-yellow-600" };
      default: return { label: status, className: "bg-secondary text-muted-foreground" };
    }
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

      {/* Hero */}
      <section className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-foreground tracking-tight">
            Automate your operations, without the complexity.
          </h1>
          <p className="text-base text-muted-foreground mb-5">
            Work with vetted experts to automate your exact workflow — or explore the solution library.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Link
              href="/jobs/discovery"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Post a Discovery Scan
            </Link>
            <Link
              href="/business/add-request"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-primary text-primary font-bold text-base hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Post a Custom Project
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center gap-1.5 justify-center px-5 py-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              Browse Solutions →
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Not sure where to start?{" "}
            <Link href="/how-it-works" className="underline hover:text-foreground transition-colors">
              See how each option works.
            </Link>
          </p>
        </div>
        <div className="hidden md:block">
          <div className="w-36 h-36 bg-secondary/30 rounded-full flex items-center justify-center border border-border/50">
            <Zap className="w-14 h-14 text-primary/20" />
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1.5 flex items-center gap-2">
              <Users className="w-5 h-5 text-foreground" /> Referral Program
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
              Share your link. When a referred business buys a solution, you receive{" "}
              <span className="font-bold text-foreground">5% off your next purchase</span> — automatically applied at checkout.
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
            {(referralStats?.referralRewards?.businessDiscountCount || 0) > 0 && (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  <Gift className="w-4 h-4 text-green-500 shrink-0" />
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      {referralStats?.referralRewards?.businessDiscountCount} discount credit
                      {referralStats?.referralRewards?.businessDiscountCount !== 1 ? "s" : ""} available
                    </p>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70">
                      5% off next purchase · auto-applied at checkout
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
              <p className="text-xs text-muted-foreground mt-1">Businesses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Projects or How It Works */}
      {hasActiveWork ? (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-bold">Your Active Projects</h2>
            </div>
            <Link href="/business/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeOrders.map((order) => {
                  const { label, className } = statusLabel(order.status);
                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-medium truncate max-w-[240px]">{order.solutionTitle}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${className}`}>{label}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href="/business/projects" className="text-xs font-bold text-primary hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="bg-secondary/20 rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 text-sm">1</div>
              <div>
                <h3 className="font-bold mb-1 text-sm">Choose or request</h3>
                <p className="text-sm text-muted-foreground">Browse vetted solutions or describe your unique problem.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 text-sm">2</div>
              <div>
                <h3 className="font-bold mb-1 text-sm">Expert builds &amp; deploys</h3>
                <p className="text-sm text-muted-foreground">A vetted expert implements the automation inside your existing tools.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 text-sm">3</div>
              <div>
                <h3 className="font-bold mb-1 text-sm">Review &amp; go live</h3>
                <p className="text-sm text-muted-foreground">Approve the work before funds are released. No lock-in.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Re-engagement — shown after completing at least one project with no active work */}
      {completedProjectCount > 0 && !hasActiveWork && (
        <section className="bg-primary/5 border border-primary/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-foreground mb-1">What to automate next?</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                You&apos;ve completed {completedProjectCount} project{completedProjectCount !== 1 ? "s" : ""}. Take our free audit to find your next highest-ROI automation opportunity.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/audit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Take the Free Audit <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/solutions"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-sm font-medium"
                >
                  Browse Solutions
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recommended Solutions */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold">Recommended for you</h2>
          </div>
          <Link href="/solutions" className="text-sm text-primary hover:underline flex items-center gap-1">
            Browse all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recommendedSolutions.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
            <Link href="/solutions" className="text-primary hover:underline font-medium">Browse the solution library →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedSolutions.map((solution) => (
              <Link
                key={solution.id}
                href={`/solutions/${solution.id}`}
                className="block bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer"
              >
                <div className="mb-3">
                  <span className="text-[10px] uppercase font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                    {solution.category}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                  {solution.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{solution.description}</p>
                <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                  <span className="font-bold">€{solution.implementationPrice.toLocaleString()}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {solution.deliveryDays} days
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
