"use client";

import React from "react";
import {
  Award,
  ShieldCheck,
  TrendingUp,
  FileText,
  Lightbulb,
  Percent,
  type LucideIcon,
} from "lucide-react";

interface GridItem {
  icon: LucideIcon;
  text: string;
  description: string;
}

const items: GridItem[] = [
  {
    icon: Award,
    text: "Only the top 5% of automation architects earn the Founding Expert badge.",
    description: "Rigorous vetting ensures you work exclusively with proven, top-tier engineering talent.",
  },
  {
    icon: ShieldCheck,
    text: "Zero-Data Handover: Keep your API keys private, we just build the engine.",
    description: "Your sensitive credentials stay safe on your end while we configure and test the workflows.",
  },
  {
    icon: TrendingUp,
    text: "Nearly 60% of companies have already introduced process automation.",
    description: "Modern teams leverage intelligent workflows to eliminate repetitive tasks and scale faster.",
  },
  {
    icon: FileText,
    text: "Every implementation is protected by a platform-wide Mutual NDA.",
    description: "Your business logic, custom code, and internal data structures remain 100% confidential.",
  },
  {
    icon: Lightbulb,
    text: "Stop guessing. Let our Elite Experts propose the ideas to you for €50.",
    description: "Get a tailored automation blueprint and actionable roadmap before committing to full development.",
  },
  {
    icon: Percent,
    text: "0% Platform Commission for Businesses. Pay for outcomes, not access.",
    description: "Transparent pricing with no hidden marketplace fees—you pay directly for completed results.",
  },
];

export function ValueGrid() {
  return (
    <div>
      {/* Header Secțiune */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3">
          Why LogicLot
        </p>
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
          Engineered for Trust & High-Impact Results
        </h2>
        <p className="text-lg max-w-md mx-auto leading-relaxed">
          Discover how our platform protects your business, guarantees quality, and simplifies automation execution.
        </p>
      </div>

      {/* Grid-ul cu mt-10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-10">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="block bg-white border border-border rounded-xl p-5 md:p-8 hover:border-primary/20 transition-colors group"
            >
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="size-10 bg-ash-100 flex items-center justify-center border border-ash-300 ring-2 ring-ash-100 rounded-xl">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-ask-900 font-noto font-medium tracking-tight">
                    {item.text}
                  </h3>
                  <p className="text-sm leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}