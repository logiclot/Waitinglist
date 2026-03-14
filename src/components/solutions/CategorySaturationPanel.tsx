"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORY_DEFINITIONS, type CategoryDef } from "@/lib/categories";

interface CategorySaturation {
  category: string;
  count: number;
}

interface Props {
  saturationData: CategorySaturation[];
}

function getSaturationLevel(count: number) {
  if (count <= 2) {
    return {
      label: "Experts needed!",
      dotColor: "bg-green-500",
      textColor: "text-green-700 dark:text-green-400",
    };
  }
  if (count <= 7) {
    return {
      label: "Growing",
      dotColor: "bg-amber-500",
      textColor: "text-amber-700 dark:text-amber-400",
    };
  }
  return {
    label: "Popular",
    dotColor: "bg-slate-400",
    textColor: "text-slate-600 dark:text-slate-400",
  };
}

export function CategorySaturationPanel({ saturationData }: Props) {
  const [expanded, setExpanded] = useState(true);
  const countMap = new Map(saturationData.map((s) => [s.category, s.count]));

  // Sort: green (low count) first to highlight opportunity
  const sorted = [...CATEGORY_DEFINITIONS].sort((a, b) => {
    const countA = countMap.get(a.name) ?? 0;
    const countB = countMap.get(b.name) ?? 0;
    return countA - countB;
  });

  const greenCount = sorted.filter((c) => (countMap.get(c.name) ?? 0) <= 2).length;

  return (
    <div className="mb-6 bg-card border border-border rounded-xl overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Category Demand
          </span>
          {greenCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {greenCount} {greenCount === 1 ? "category needs" : "categories need"} experts
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded grid */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {sorted.map((cat: CategoryDef) => {
              const count = countMap.get(cat.name) ?? 0;
              const level = getSaturationLevel(count);
              const Icon = cat.icon;

              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-secondary/40"
                >
                  <div className={`w-6 h-6 rounded ${cat.color.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3 h-3 ${cat.color.text}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate leading-tight">{cat.name}</p>
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${level.dotColor}`} />
                      <span className={`text-[10px] ${level.textColor}`}>
                        {count} · {level.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            You can post in any category. This is just for your information.
          </p>
        </div>
      )}
    </div>
  );
}
