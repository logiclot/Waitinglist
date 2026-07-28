import { SpecialistTier } from "@prisma/client";
import { Award, Crown, TrendingUp } from "lucide-react";

type Tier = SpecialistTier;

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md";
}

export function TierBadge({
  tier,
  size = "sm",
}: TierBadgeProps) {
  const base =
    size === "md"
      ? "h-6 flex items-center gap-2 px-2 py-1 rounded-md"
      : "h-6 flex items-center gap-2 px-2 py-1 rounded-md";

  const isFoundingExpert = tier === "FOUNDING"
  const iconSize = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";

  const foundingBadge = isFoundingExpert ? (
    <span
      className={`${base} bg-amber-50`}
    >
      <Crown className={`${iconSize} text-amber-600`} />
      <span className="text-xs text-amber-600 font-medium">Founding Expert</span>
    </span>
  ) : null;

  const tierBadge = (() => {
    if (tier === "ELITE") {
      return (
        <span
          className={`${base} bg-blue-50`}
        >
          <Award className={`${iconSize} text-blue-600`} />
          <span className="text-xs text-blue-600 font-medium">Elite</span>
        </span>
      );
    }
    if (tier === "PROVEN") {
      return (
        <span
          className={`${base} bg-emerald-50`}
        >
          <TrendingUp className={`${iconSize} text-emerald-600`} />
          <span className="text-xs text-emerald-600 font-medium">Proven</span>
        </span>
      );
    }
    return null;
  })();

  // Show both badges if founding AND has earned a tier — founding always first
  if (foundingBadge && tierBadge) {
    return (
      <span className="flex items-center gap-2">
        {foundingBadge}
        {tierBadge}
      </span>
    );
  }

  return foundingBadge ?? tierBadge;
}
