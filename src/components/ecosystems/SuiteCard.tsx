"use client";

import { type MouseEvent } from "react";
import Link from "next/link";
import { Clock, Wrench, TrendingUp, ArrowRight, Shield, Heart, Tag } from "lucide-react";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { TierBadge } from "@/components/ui/TierBadge";
import { formatCentsToCurrency } from "@/lib/commission";
import { useSavedSuitesContext } from "@/hooks/SavedSuitesContext";
import type { SuiteCardData } from "@/types";

interface SuiteCardProps {
  ecosystem: SuiteCardData;
}

export function SuiteCard({ ecosystem }: SuiteCardProps) {
  const { items, expert } = ecosystem;
  const { savedIds, toggleSaved } = useSavedSuitesContext();
  const isSaved = savedIds.has(ecosystem.id);

  const handleSave = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(ecosystem.id);
  };

  // ── Computed values ──────────────────────────────────────────────────────────

  const totalPriceCents = items.reduce(
    (sum, item) => sum + item.solution.implementationPriceCents,
    0
  );

  const monthlyMin = items.reduce(
    (sum, item) => sum + (item.solution.monthlyCostMinCents || 0),
    0
  );
  const monthlyMax = items.reduce(
    (sum, item) => sum + (item.solution.monthlyCostMaxCents || 0),
    0
  );
  const hasMonthly = monthlyMax > 0;

  const totalDeliveryDays = items.reduce(
    (sum, item) => sum + item.solution.deliveryDays,
    0
  );

  const maxSupportDays = items.length > 0
    ? Math.max(...items.map((item) => item.solution.supportDays))
    : 0;

  // Bundle discount
  const hasBundleDiscount =
    ecosystem.bundlePriceCents != null &&
    ecosystem.bundlePriceCents < totalPriceCents;
  const savingsCents = hasBundleDiscount
    ? totalPriceCents - ecosystem.bundlePriceCents!
    : 0;
  const savingsPercent = hasBundleDiscount
    ? Math.round((savingsCents / totalPriceCents) * 100)
    : 0;

  // Extended support
  const hasExtendedSupport =
    ecosystem.extSupport6mCents != null ||
    ecosystem.extSupport12mCents != null;

  // Single Provider: all solutions belong to the suite owner
  const isSingleProvider =
    items.length > 0 &&
    items.every((item) => item.solution.expertId === ecosystem.expertId);

  // Primary category (most common)
  const categoryCount: Record<string, number> = {};
  items.forEach((item) => {
    categoryCount[item.solution.category] =
      (categoryCount[item.solution.category] || 0) + 1;
  });
  const primaryCategory =
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Automation";

  // First available outcome line
  const primaryOutcome = items.find(
    (item) => item.solution.outcome
  )?.solution.outcome;

  const expertImageUrl = expert.user?.profileImageUrl;

  return (
    <Link href={`/stacks/${ecosystem.slug}`} className="group block">
      <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5">
        <div className="p-4 sm:p-5">
          {/* Row 1: Category + solution count + single provider badge */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <CategoryBadge category={primaryCategory} size="sm" />
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              {items.length} Solution{items.length !== 1 ? "s" : ""}
            </span>
            {isSingleProvider && (
              <span className="relative group/badge" title="Single Provider">
                <Shield className="h-4 w-4 text-amber-500 fill-amber-100" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] font-semibold text-white bg-neutral-800 rounded whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none">
                  Single Provider
                </span>
              </span>
            )}
          </div>

          {/* Row 2: Title */}
          <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors mb-3">
            {ecosystem.title}
          </h3>

          {/* Row 3: Horizontal solution timeline */}
          <div className="flex items-start gap-0 mb-4 overflow-x-auto pb-2 scrollbar-thin">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center shrink-0">
                {/* Dot + label */}
                <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {index + 1}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 text-center leading-tight max-w-[64px] line-clamp-2">
                    {item.solution.title}
                  </span>
                </div>
                {/* Connector line */}
                {index < items.length - 1 && (
                  <div className="h-0.5 w-4 sm:w-6 bg-border shrink-0 mt-[-16px]" />
                )}
              </div>
            ))}
          </div>

          {/* Row 4: Stats row */}
          <div className="flex flex-wrap items-center justify-between text-sm mb-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                {hasBundleDiscount ? "Suite " : ""}Price{" "}
              </span>
              {hasBundleDiscount ? (
                <span>
                  <span className="font-bold text-foreground">
                    {formatCentsToCurrency(ecosystem.bundlePriceCents!)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through ml-1">
                    {formatCentsToCurrency(totalPriceCents)}
                  </span>
                </span>
              ) : (
                <span className="font-bold text-foreground">
                  {formatCentsToCurrency(totalPriceCents)}
                </span>
              )}
            </div>
            {hasMonthly && (
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Monthly{" "}
                </span>
                <span className="font-medium text-foreground">
                  {formatCentsToCurrency(monthlyMin)}–{formatCentsToCurrency(monthlyMax)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground">~{totalDeliveryDays}d</span>
            </div>
            <div className="flex items-center gap-1">
              <Wrench className="h-3 w-3 text-primary shrink-0" />
              <span className="font-medium text-primary">{maxSupportDays}d</span>
              {hasExtendedSupport && (
                <span className="text-[10px] font-medium text-emerald-600">+ext</span>
              )}
            </div>
            {/* Savings inline */}
            {hasBundleDiscount && (
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <Tag className="h-3 w-3 shrink-0" />
                Save {formatCentsToCurrency(savingsCents)} ({savingsPercent}%)
              </div>
            )}
          </div>

          {/* Outcome */}
          {primaryOutcome && (
            <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-100 flex items-start gap-1.5 mb-3">
              <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="leading-snug line-clamp-1">{primaryOutcome}</span>
            </div>
          )}

          {/* Row 6: Expert + CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2 min-w-0">
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 border border-primary/15 overflow-hidden relative">
                {expertImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={expertImageUrl}
                    alt={expert.displayName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  expert.displayName.slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="text-sm font-medium text-muted-foreground truncate max-w-[120px]">
                {expert.displayName}
              </span>
              {(expert.isFoundingExpert ||
                (expert.tier && expert.tier !== "STANDARD")) && (
                <TierBadge
                  tier={
                    (expert.tier || "STANDARD") as
                      | "STANDARD"
                      | "PROVEN"
                      | "ELITE"
                  }
                  isFoundingExpert={expert.isFoundingExpert}
                  size="sm"
                />
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSave}
                className={`p-2 rounded-lg border transition-all ${
                  isSaved
                    ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
                title={isSaved ? "Saved" : "Save Suite"}
              >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              </button>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold transition-all shadow-sm group-hover:shadow-md">
                View Suite <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
