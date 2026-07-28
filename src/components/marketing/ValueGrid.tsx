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
        <p className="text-xs text-ash-500 font-medium uppercase tracking-widest bg-white inline-flex py-1.5 px-3 border border-ash-300 ring-2 ring-ash-100 rounded-lg">
          Why LogicLot
        </p>
        <h2 className="text-2xl text-ash-800 text-balance font-noto font-semibold tracking-tight mt-6 md:text-4xl">
          Engineered for Trust & High-Impact Results
        </h2>
        <p className="max-w-md text-balance mx-auto mt-2 md:text-lg md:mt-4">
          Discover how our platform protects your business, guarantees quality, and simplifies automation execution.
        </p>
      </div>

      {/* Grid-ul cu mt-10 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 mt-10">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white border border-ash-300 shadow-2xl shadow-ash-200 rounded-2xl p-6 md:p-8"
            >
              <div className="flex flex-col h-full justify-between gap-6">
                <div className="size-11 bg-ash-100 flex items-center justify-center border border-ash-300 ring ring-ash-100 rounded-xl">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-ash-800 font-noto font-semibold tracking-tight">
                    {item.text}
                  </h3>
                  <p className="text-ash-500 mt-1">
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