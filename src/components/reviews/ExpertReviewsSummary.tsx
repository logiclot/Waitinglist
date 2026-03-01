import { Star, MessageSquare } from "lucide-react";
import { StarRating } from "./StarRating";
import type { PublicReview } from "@/actions/reviews";

interface ExpertReviewsSummaryProps {
  reviews: PublicReview[];
  averageRating: number;
  totalCount: number;
}

export function ExpertReviewsSummary({ reviews, averageRating, totalCount }: ExpertReviewsSummaryProps) {
  if (totalCount === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Verified Reviews</h2>
        <span className="bg-amber-500/10 text-amber-600 text-sm font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          {averageRating.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">
          {totalCount} review{totalCount !== 1 ? "s" : ""}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Rating distribution bar */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
            <StarRating value={Math.round(averageRating)} readonly size="sm" />
            <p className="text-xs text-muted-foreground mt-1">{totalCount} review{totalCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.buyerRating === star).length;
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{star}</span>
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((r, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Verified Buyer</p>
                  {r.orderTitle && (
                    <p className="text-xs text-muted-foreground">{r.orderTitle}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <StarRating value={r.buyerRating} readonly size="sm" />
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(r.buyerSubmittedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            {r.buyerComment && (
              <p className="text-sm text-muted-foreground leading-relaxed">{r.buyerComment}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
