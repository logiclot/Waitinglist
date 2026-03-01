import { StarRating } from "./StarRating";
import { User, CheckCircle2 } from "lucide-react";

interface ReviewCardProps {
  rating: number;
  comment: string | null;
  submittedAt: string;
  authorLabel: string;
  isOwn?: boolean;
  variant?: "buyer" | "seller";
}

export function ReviewCard({ rating, comment, submittedAt, authorLabel, isOwn, variant }: ReviewCardProps) {
  const date = new Date(submittedAt);
  const formatted = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{authorLabel}</span>
              {isOwn && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  You
                </span>
              )}
              {variant === "buyer" && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">
                  Client
                </span>
              )}
              {variant === "seller" && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                  Expert
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formatted}</p>
          </div>
        </div>
        <StarRating value={rating} readonly size="sm" />
      </div>

      {/* Comment */}
      {comment ? (
        <p className="text-sm text-muted-foreground leading-relaxed">{comment}</p>
      ) : (
        <p className="text-sm text-muted-foreground/50 italic">No written comment</p>
      )}

      {/* Verified badge */}
      <div className="flex items-center gap-1 text-xs text-emerald-600">
        <CheckCircle2 className="w-3 h-3" />
        <span>Verified transaction</span>
      </div>
    </div>
  );
}
