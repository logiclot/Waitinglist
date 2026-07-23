"use client";

import React from "react";
import {
  Award,
  ShieldCheck,
  TrendingUp,
  FileText,
  Lightbulb,
  Percent,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

interface GridItem {
  icon: LucideIcon;
  text: string;
  author?: string;
}

const items: GridItem[] = [
  {
    icon: Award,
    text: "Only the top 5% of automation architects earn the Founding Expert badge.",
  },
  {
    icon: ShieldCheck,
    text: "Zero-Data Handover: Keep your API keys private, we just build the engine.",
  },
  {
    icon: TrendingUp,
    text: "Nearly 60% of companies have already introduced some level of process automation.",
    author: "— McKinsey & Company",
  },
  {
    icon: FileText,
    text: "Every implementation is protected by a platform-wide Mutual NDA.",
  },
  {
    icon: Lightbulb,
    text: "Stop guessing. Let our Elite Experts propose the ideas to you for €50.",
  },
  {
    icon: Percent,
    text: "0% Platform Commission for Businesses. Pay for outcomes, not access.",
  },
  {
    icon: BarChart3,
    text: "The intelligent process automation market is projected to reach $44.7B by 2030.",
    author: "— Grand View Research, 2024",
  },
];

export function ValueGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="block bg-white border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-foreground font-medium leading-relaxed">
                  {item.text}
                </p>
                {item.author && (
                  <span className="block mt-2 text-sm text-muted-foreground font-normal">
                    {item.author}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}