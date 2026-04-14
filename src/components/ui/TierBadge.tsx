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
      ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
      : "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border";

  const isFoundingExpert = tier === "FOUNDING"
  const iconSize = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";

  const foundingBadge = isFoundingExpert ? (
    <span
      className={`${base} bg-gradient-to-r from-neutral-900 to-neutral-800 text-white border-neutral-700`}
    >
      <Crown className={`${iconSize} text-amber-400`} />
      Founding Expert
    </span>
  ) : null;

  const tierBadge = (() => {
    if (tier === "ELITE") {
      return (
        <span
          className={`${base} bg-foreground text-background border-foreground`}
        >
          <Award className={iconSize} />
          Elite
        </span>
      );
    }
    if (tier === "PROVEN") {
      return (
        <span
          className={`${base} bg-primary/10 text-primary border-primary/20`}
        >
          <TrendingUp className={iconSize} />
          Proven
        </span>
      );
    }
    return null;
  })();

  // Show both badges if founding AND has earned a tier — founding always first
  if (foundingBadge && tierBadge) {
    return (
      <span className="inline-flex items-center gap-1">
        {foundingBadge}
        {tierBadge}
      </span>
    );
  }

  return foundingBadge ?? tierBadge;
}
