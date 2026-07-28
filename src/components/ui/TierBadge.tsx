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
      ? "h-6 flex items-center gap-2 px-4 py-1 rounded-full"
      : "h-6 flex items-center gap-2 px-4 py-1 rounded-full";

  const isFoundingExpert = tier === "FOUNDING"
  const iconSize = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";

  const foundingBadge = isFoundingExpert ? (
    <span
      className={`${base} bg-amber-900`}
    >
      <Crown className={`${iconSize} text-amber-400`} />
      <span className="text-sm text-amber-400 font-semibold">Founding Expert</span>
    </span>
  ) : null;

  const tierBadge = (() => {
    if (tier === "ELITE") {
      return (
        <span
          className={`${base}`}
        >
          <Award className={iconSize} />
          <span className="text-sm font-semibold">Elite</span>
        </span>
      );
    }
    if (tier === "PROVEN") {
      return (
        <span
          className={`${base}`}
        >
          <TrendingUp className={iconSize} />
          <span className="text-sm font-semibold">Proven</span>
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
