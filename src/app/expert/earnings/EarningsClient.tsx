"use client";

import { useState } from "react";
import {
  DollarSign,
  Lock,
  Percent,
  CheckCircle,
  ExternalLink,
  TrendingUp,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

interface EarningsData {
  totalEarnedCents: number;
  inEscrowCents: number;
  commissionRate: number;
  tier: string;
  isFoundingExpert: boolean | null;
  completedSalesCount: number;
  stripeConnected: boolean;
  transactions: Array<{
    date: string;
    orderTitle: string;
    milestoneTitle: string;
    grossCents: number;
    feePercent: number;
    netCents: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    earnedCents: number;
    orderCount: number;
  }>;
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatMonth(monthStr: string): string {
  try {
    const [year, month] = monthStr.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString(
      "en-IE",
      { year: "numeric", month: "long" }
    );
  } catch {
    return monthStr;
  }
}

function getTierBadge(
  tier: string,
  isFoundingExpert: boolean | null
): { label: string; className: string } {
  if (isFoundingExpert) {
    return {
      label: "Founding",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }
  switch (tier) {
    case "ELITE":
      return {
        label: "Elite",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      };
    case "PROVEN":
      return {
        label: "Proven",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      };
    default:
      return {
        label: "Standard",
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function EarningsClient({ data }: { data: EarningsData }) {
  const [stripeLinkLoading, setStripeLinkLoading] = useState(false);

  const tierBadge = getTierBadge(data.tier, data.isFoundingExpert);

  const handleOpenStripeDashboard = async () => {
    setStripeLinkLoading(true);
    try {
      const res = await fetch("/api/stripe/dashboard-link", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.open(json.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Silently fail -- user can retry
    } finally {
      setStripeLinkLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">
            Track your revenue, commissions, and payouts.
          </p>
        </div>
        {data.stripeConnected && (
          <button
            onClick={handleOpenStripeDashboard}
            disabled={stripeLinkLoading}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <ExternalLink className="h-4 w-4" />
            {stripeLinkLoading ? "Opening..." : "View Stripe Dashboard"}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Total Earned
            </span>
          </div>
          <p className="text-2xl font-bold">
            {formatEur(data.totalEarnedCents)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            After platform fees
          </p>
        </div>

        {/* In Escrow */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              In Escrow
            </span>
          </div>
          <p className="text-2xl font-bold">
            {formatEur(data.inEscrowCents)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Funds awaiting release
          </p>
        </div>

        {/* Commission Rate */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Percent className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Commission Rate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{data.commissionRate}%</p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierBadge.className}`}
            >
              {tierBadge.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Platform fee on each payout
          </p>
        </div>

        {/* Completed Sales */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Completed Sales
            </span>
          </div>
          <p className="text-2xl font-bold">{data.completedSalesCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Lifetime completed orders
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-bold">Transaction History</h2>
        </div>
        {data.transactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ArrowUpRight className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              No transactions yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Completed milestone payouts will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-6 py-3 font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-muted-foreground">
                    Project
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-muted-foreground">
                    Milestone
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-muted-foreground">
                    Gross
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-muted-foreground">
                    Fee %
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-muted-foreground">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((t, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-6 py-3 font-medium max-w-[200px] truncate">
                      {t.orderTitle}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground max-w-[180px] truncate">
                      {t.milestoneTitle}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums">
                      {formatEur(t.grossCents)}
                    </td>
                    <td className="px-6 py-3 text-right text-muted-foreground tabular-nums">
                      {t.feePercent}%
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-green-600 dark:text-green-400 tabular-nums">
                      {formatEur(t.netCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Breakdown */}
      {data.monthlyBreakdown.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-bold">Monthly Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-6 py-3 font-semibold text-muted-foreground">
                    Month
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-muted-foreground">
                    Earned (Net)
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-muted-foreground">
                    Payouts
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyBreakdown.map((m) => (
                  <tr
                    key={m.month}
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium">
                      {formatMonth(m.month)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-green-600 dark:text-green-400 tabular-nums">
                      {formatEur(m.earnedCents)}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums">
                      {m.orderCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
