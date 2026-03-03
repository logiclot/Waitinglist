"use client";

import { getCategoryByName, CATEGORY_DEFINITIONS } from "@/lib/categories";

interface CategoryBadgeProps {
  /** The category display name, e.g. "Marketing Automation" */
  category: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
  /** Show only icon (no text) */
  iconOnly?: boolean;
}

const sizeConfig = {
  sm: {
    wrapper: "gap-1.5",
    iconContainer: "h-6 w-6 rounded-md",
    iconSize: "h-3.5 w-3.5",
    text: "text-[11px] font-bold tracking-wide",
  },
  md: {
    wrapper: "gap-2",
    iconContainer: "h-7 w-7 rounded-md",
    iconSize: "h-4 w-4",
    text: "text-xs font-bold tracking-wide",
  },
  lg: {
    wrapper: "gap-2.5",
    iconContainer: "h-9 w-9 rounded-lg",
    iconSize: "h-5 w-5",
    text: "text-sm font-bold",
  },
};

export function CategoryBadge({
  category,
  size = "sm",
  className = "",
  iconOnly = false,
}: CategoryBadgeProps) {
  const def = getCategoryByName(category);
  const fallback = CATEGORY_DEFINITIONS.find(c => c.id === "other")!;
  const config = def ?? fallback;
  const Icon = config.icon;
  const { color } = config;
  const s = sizeConfig[size];

  return (
    <span className={`inline-flex items-center ${s.wrapper} ${className}`}>
      {/* Colored icon container */}
      <span
        className={`inline-flex items-center justify-center shrink-0 ${s.iconContainer} ${color.iconBg} ${color.text}`}
      >
        <Icon className={s.iconSize} />
      </span>

      {/* Category name — always black/foreground, only icon is colored */}
      {!iconOnly && (
        <span className={`${s.text} text-foreground truncate max-w-[140px]`}>
          {category}
        </span>
      )}
    </span>
  );
}
