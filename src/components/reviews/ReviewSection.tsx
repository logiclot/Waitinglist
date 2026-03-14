"use client";

import { useState, useEffect, useCallback } from "react";
import { ReviewForm } from "./ReviewForm";
import { ReviewCard } from "./ReviewCard";
import { getReviewForOrder, type ReviewData } from "@/actions/reviews";
import { MessageSquare, Lock, Eye, Clock, Loader2 } from "lucide-react";

interface ReviewSectionProps {
  orderId: string;
  role: "buyer" | "seller";
  sellerName: string;
  buyerName?: string;
}

export function ReviewSection({ orderId, role, sellerName, buyerName }: ReviewSectionProps) {
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReview = useCallback(async () => {
    setLoading(true);
    const res = await getReviewForOrder(orderId);
    if (res.review) setReview(res.review);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  if (loading) {
    return (
      <div className="border border-border rounded-xl p-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading review...</span>
      </div>
    );
  }

  if (!review) return null;

  const isBuyer = role === "buyer";
  const isSeller = role === "seller";

  const sellerHasReviewed = review.sellerSubmittedAt !== null;
  const buyerHasReviewed = review.buyerSubmittedAt !== null;
  const bothReviewed = sellerHasReviewed && buyerHasReviewed;

  // ── Both reviewed: show both cards ──────────────────────────────────────────
  if (bothReviewed && review.isUnblinded) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Reviews</span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {review.buyerRating !== null && (
            <ReviewCard
              rating={review.buyerRating}
              comment={review.buyerComment}
              submittedAt={review.buyerSubmittedAt!}
              authorLabel={buyerName ?? "Client"}
              isOwn={isBuyer}
              variant="buyer"
            />
          )}
          {review.sellerRating !== null && (
            <ReviewCard
              rating={review.sellerRating}
              comment={review.sellerComment}
              submittedAt={review.sellerSubmittedAt!}
              authorLabel={sellerName}
              isOwn={isSeller}
              variant="seller"
            />
          )}
        </div>
      </div>
    );
  }

  // ── Seller view: hasn't reviewed yet ──────────────────────────────────────────
  if (isSeller && !sellerHasReviewed) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Leave a review</span>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4">
            Project complete! Share your experience working with this client. Your review will be visible to them only after they leave theirs.
          </p>
          <ReviewForm orderId={orderId} role="seller" onSubmitted={fetchReview} />
        </div>
      </div>
    );
  }

  // ── Seller view: reviewed, waiting for buyer ────────────────────────────────
  if (isSeller && sellerHasReviewed && !buyerHasReviewed) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-foreground">Review submitted — waiting for client</span>
        </div>
        <div className="p-5 space-y-4">
          {review.sellerRating !== null && (
            <ReviewCard
              rating={review.sellerRating}
              comment={review.sellerComment}
              submittedAt={review.sellerSubmittedAt!}
              authorLabel="You"
              isOwn
              variant="seller"
            />
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg px-4 py-3">
            <Lock className="w-4 h-4 shrink-0" />
            <span>The client&apos;s review will appear here once they submit theirs.</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Buyer view: seller hasn't reviewed yet → buyer can still review immediately ──
  if (isBuyer && !sellerHasReviewed && !buyerHasReviewed) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Leave a review</span>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4">
            Project complete! How was your experience with {sellerName}?
          </p>
          <ReviewForm orderId={orderId} role="buyer" onSubmitted={fetchReview} />
        </div>
      </div>
    );
  }

  // ── Buyer view: seller reviewed, buyer hasn't → teaser + form ─────────────
  if (isBuyer && sellerHasReviewed && !buyerHasReviewed) {
    return (
      <div className="border border-primary/30 bg-primary/5 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">A review is waiting for you!</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-background border border-border rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{sellerName} left you a review</p>
              <p className="text-xs text-muted-foreground">Submit your review to unlock and see what they wrote</p>
            </div>
          </div>
          <ReviewForm orderId={orderId} role="buyer" onSubmitted={fetchReview} />
        </div>
      </div>
    );
  }

  // ── Buyer reviewed but not unblinded yet (edge case) ──────────────────────
  if (isBuyer && buyerHasReviewed && !review.isUnblinded) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-foreground">Review submitted</span>
        </div>
        <div className="p-5 space-y-4">
          {review.buyerRating !== null && (
            <ReviewCard
              rating={review.buyerRating}
              comment={review.buyerComment}
              submittedAt={review.buyerSubmittedAt!}
              authorLabel="You"
              isOwn
              variant="buyer"
            />
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg px-4 py-3">
            <Lock className="w-4 h-4 shrink-0" />
            <span>The expert&apos;s review will be visible once both reviews are submitted.</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
