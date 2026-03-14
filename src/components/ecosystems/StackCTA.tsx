"use client";

import Link from "next/link";
import { MessageSquare, PlayCircle, Tag, Wrench } from "lucide-react";
import { formatCentsToCurrency } from "@/lib/commission";

interface StackEcosystem {
  id: string;
  expertId: string;
  items: Array<{ solution: { implementationPriceCents?: number | null } }>;
}

interface StackCTAProps {
  ecosystem: StackEcosystem;
  bundlePriceCents?: number | null;
  extSupport6mCents?: number | null;
  extSupport12mCents?: number | null;
}

export function StackCTA({
  ecosystem,
  bundlePriceCents,
  extSupport6mCents,
  extSupport12mCents,
}: StackCTAProps) {
  const totalPriceCents = ecosystem.items.reduce(
    (sum: number, item: { solution: { implementationPriceCents?: number | null } }) =>
      sum + (item.solution.implementationPriceCents || 0),
    0
  );

  const hasBundleDiscount =
    bundlePriceCents != null && bundlePriceCents < totalPriceCents;
  const savingsCents = hasBundleDiscount
    ? totalPriceCents - bundlePriceCents!
    : 0;

  const hasExtendedSupport =
    extSupport6mCents != null || extSupport12mCents != null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
      <div className="mb-6">
        {hasBundleDiscount ? (
          <>
            <p className="text-sm text-muted-foreground mb-1">Suite Price</p>
            <div className="text-3xl font-bold text-foreground">
              {formatCentsToCurrency(bundlePriceCents!)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground line-through">
                {formatCentsToCurrency(totalPriceCents)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <Tag className="w-3 h-3" /> Save {formatCentsToCurrency(savingsCents)}
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-1">Total Suite Value</p>
            <div className="text-3xl font-bold text-foreground">
              {formatCentsToCurrency(totalPriceCents)}
            </div>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Includes {ecosystem.items.length} solutions in this suite.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href={`/messages/new?expert=${ecosystem.expertId}&type=demo&stack=${ecosystem.id}`}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-bold text-lg transition-colors shadow-md shadow-primary/20 flex items-center justify-center gap-2"
        >
          <PlayCircle className="w-5 h-5" /> Request Suite Demo
        </Link>
        <p className="text-[10px] text-muted-foreground text-center px-2">
          Demo happens in the expert&apos;s environment before any access is granted.
        </p>

        <Link
          href={`/messages/new?expert=${ecosystem.expertId}&stack=${ecosystem.id}`}
          className="w-full border border-border bg-background hover:bg-secondary/50 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 text-foreground"
        >
          <MessageSquare className="w-4 h-4" /> Ask a question
        </Link>
      </div>

      <div className="pt-6 mt-6 border-t border-border text-center">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Or buy individually</p>
        <p className="text-xs text-muted-foreground">
          Scroll down to purchase specific solutions from this suite.
        </p>
      </div>

      {/* Extended Support mention */}
      {hasExtendedSupport && (
        <div className="pt-4 mt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-foreground">Extended Support Available</span>
          </div>
          <div className="space-y-1">
            {extSupport6mCents != null && (
              <p className="text-xs text-muted-foreground">
                6 months — {formatCentsToCurrency(extSupport6mCents)}
              </p>
            )}
            {extSupport12mCents != null && (
              <p className="text-xs text-muted-foreground">
                12 months — {formatCentsToCurrency(extSupport12mCents)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
