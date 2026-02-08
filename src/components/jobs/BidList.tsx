"use client";

import { awardBid } from "@/actions/jobs";
import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BidList({ bids, jobId, isOwner }: { bids: any[], jobId: string, isOwner: boolean }) {
  const [awardingId, setAwardingId] = useState<string | null>(null);

  const handleAward = async (bidId: string) => {
    if (!confirm("Are you sure you want to award the job to this specialist? This will open a conversation.")) return;
    
    setAwardingId(bidId);
    const res = await awardBid(jobId, bidId);
    if (!res.success) {
      alert("Failed to award bid");
      setAwardingId(null);
    }
  };

  if (bids.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl">
        <h3 className="text-lg font-medium mb-1">No proposals yet</h3>
        <p className="text-muted-foreground">
          Elite specialists will respond here. If your request is urgent, refine the goal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Proposals ({bids.length})</h3>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {bids.map((bid: any) => (
        <div key={bid.id} className="bg-card border border-border rounded-xl p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <div className="font-bold text-lg">{bid.specialist.displayName}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-xs font-bold border border-yellow-500/20">ELITE</span>
                <span>• {bid.specialist.completedSalesCount} completed implementations</span>
              </div>
            </div>
            {bid.status === 'accepted' ? (
               <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-bold border border-green-500/20 flex items-center gap-1">
                 <CheckCircle className="h-4 w-4" /> Awarded
               </span>
            ) : isOwner ? (
              <button
                onClick={() => handleAward(bid.id)}
                disabled={!!awardingId}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {awardingId === bid.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept & Chat"}
              </button>
            ) : null}
          </div>
          
          <div className="bg-secondary/10 p-4 rounded-md mb-4 text-sm whitespace-pre-wrap">
            {bid.message}
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">Time Estimate</span>
              <span className="font-medium">{bid.estimatedTime}</span>
            </div>
            {bid.priceEstimate && (
              <div>
                <span className="text-muted-foreground block mb-1">Price Estimate</span>
                <span className="font-medium">{bid.priceEstimate}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
