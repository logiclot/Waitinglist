"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";
import { submitSellerReview, submitBuyerReview } from "@/actions/reviews";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

interface ReviewFormProps {
  orderId: string;
  role: "buyer" | "seller";
  onSubmitted: () => void;
}

export function ReviewForm({ orderId, role, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isBuyer = role === "buyer";

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    const action = isBuyer ? submitBuyerReview : submitSellerReview;
    const res = await action(orderId, rating, comment);
    setSubmitting(false);

    if ("success" in res) {
      toast.success("Review submitted!");
      onSubmitted();
    } else {
      toast.error(res.error ?? "Failed to submit review.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Star picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {isBuyer ? "How was your experience with this expert?" : "How was your experience with this client?"}
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-xs text-muted-foreground">
            {rating === 1 && "Poor"}
            {rating === 2 && "Below average"}
            {rating === 3 && "Average"}
            {rating === 4 && "Good"}
            {rating === 5 && "Excellent"}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Comments <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            isBuyer
              ? "What went well? What could be improved? This helps other buyers..."
              : "How was the communication? Was the scope clear?"
          }
          rows={3}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
        ) : (
          <><Send className="h-4 w-4" /> Submit Review</>
        )}
      </button>
    </div>
  );
}
