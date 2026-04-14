"use client";

import Link from "next/link";
import { awardBid, unawardBid } from "@/actions/jobs";
import { useState } from "react";
import { Loader2, CheckCircle, MessageCircle, Undo2 } from "lucide-react";
import { TierBadge } from "@/components/ui/TierBadge";
import { SpecialistTier } from "@prisma/client";

interface BidSpecialist {
  displayName?: string | null;
  tier?: SpecialistTier | null;
  isFoundingExpert?: boolean | null;
  completedSalesCount?: number | null;
}

interface BidItem {
  id: string;
  specialistId?: string;
  message: string;
  estimatedTime: string;
  priceEstimate?: string | null;
  status: string;
  specialist?: BidSpecialist | null;
  order?: { id: string; milestones: unknown } | null;
}

export function BidList({
  bids,
  jobId,
  isOwner,
}: {
  bids: BidItem[];
  jobId: string;
  isOwner: boolean;
}) {
  const [awardingId, setAwardingId] = useState<string | null>(null);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const handleUndo = async (bidId: string) => {
    if (
      !confirm(
        "Reverse this acceptance? The proposal and all others will go back to pending review.",
      )
    )
      return;
    setUndoingId(bidId);
    const res = await unawardBid(jobId, bidId);
    if (!res.success) {
      alert(res.error ?? "Could not reverse — please try again.");
      setUndoingId(null);
      return;
    }
    window.location.reload();
  };

  const handleAward = async (bidId: string) => {
    if (!confirm("Accept this proposal and proceed to fund milestone 1?"))
      return;

    setAwardingId(bidId);
    const res = await awardBid(jobId, bidId);
    if (!res.success) {
      alert(res.error ?? "Failed to award bid");
      setAwardingId(null);
      return;
    }
    if (res.orderId) {
      try {
        const fundRes = await fetch("/api/checkout/fund-milestone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: res.orderId, milestoneIndex: 0 }),
        });
        const fundData = await fundRes.json();
        if (fundData.url) {
          window.location.href = fundData.url;
          return;
        }
      } catch {
        /* fall through */
      }
      window.location.href = "/business/projects";
    }
  };

  if (bids.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl">
        <h3 className="text-lg font-medium mb-1">No proposals yet</h3>
        <p className="text-muted-foreground">
          Elite specialists will respond here. If your request is urgent, refine
          the goal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Proposals ({bids.length})</h3>
      {bids.map((bid: BidItem) => (
        <div
          key={bid.id}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="font-bold text-lg">
                {bid.specialist?.displayName ?? "Expert"}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                <TierBadge
                  tier={bid.specialist?.tier ?? "STANDARD"}
                />
                <span>
                  {bid.specialist?.completedSalesCount ?? 0} completed
                  implementations
                </span>
              </div>
            </div>
            {bid.status === "accepted" ? (
              (() => {
                const ms =
                  (bid.order?.milestones as
                    | Record<string, unknown>[]
                    | undefined) ?? [];
                const funded = ms.some((m) => {
                  const s = (m as { status?: string }).status;
                  return (
                    s === "in_escrow" || s === "releasing" || s === "released"
                  );
                });
                return (
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-bold border border-green-500/20 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Awarded
                    </span>
                    {isOwner && !funded && (
                      <button
                        type="button"
                        onClick={() => handleUndo(bid.id)}
                        disabled={undoingId !== null}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        title="Reverse this acceptance — all proposals go back to pending"
                      >
                        {undoingId === bid.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Undo2 className="h-3 w-3" />
                        )}
                        Undo acceptance
                      </button>
                    )}
                  </div>
                );
              })()
            ) : isOwner ? (
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => handleAward(bid.id)}
                  disabled={!!awardingId}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {awardingId === bid.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Accept & Fund Milestone 1"
                  )}
                </button>
                {bid.specialistId && (
                  <Link
                    href={`/messages/new?expert=${bid.specialistId}&job=${jobId}`}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Ask a Question
                  </Link>
                )}
              </div>
            ) : null}
          </div>

          <div className="bg-secondary/10 p-4 rounded-md mb-4 text-sm whitespace-pre-wrap">
            {bid.message}
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">
                Time Estimate
              </span>
              <span className="font-medium">{bid.estimatedTime}</span>
            </div>
            {bid.priceEstimate && (
              <div>
                <span className="text-muted-foreground block mb-1">
                  Price Estimate
                </span>
                <span className="font-medium">{bid.priceEstimate}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
