import { Crown, TrendingUp, Star } from "lucide-react";
import { Badge, type BadgeVariant } from "./Badge";

interface ExpertBadgeProps {
  isFoundingExpert?: boolean;
  tier?: string;
  className?: string;
}

export function ExpertBadge({ isFoundingExpert, tier, className }: ExpertBadgeProps) {
  if (isFoundingExpert) {
    return (
      <Badge
        variant="founding"
        label="Founding Expert"
        icon={<Crown className="h-3 w-3 text-amber-400" />}
        className={className}
      />
    );
  }

  if (!tier) return null;

  const tierUpper = tier.toUpperCase();

  if (tierUpper === "ELITE") {
    return (
      <Badge
        variant="elite"
        label="Elite"
        icon={<Star className="h-3 w-3" />}
        className={className}
      />
    );
  }

  if (tierUpper === "PROVEN") {
    return (
      <Badge
        variant="proven"
        label="Proven"
        icon={<TrendingUp className="h-3 w-3" />}
        className={className}
      />
    );
  }

  return null;
}

export type { BadgeVariant };
