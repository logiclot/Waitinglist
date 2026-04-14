"use client";

import { Clock, Coffee, Eye, Rocket, Tag } from "lucide-react";

const trustItems = [
  {
    icon: Coffee,
    text: "Get your evenings back",
  },
  {
    icon: Clock,
    text: "Reclaim 10+ hours per week",
  },
  {
    icon: Tag,
    text: "Fixed price",
  },
  {
    icon: Eye,
    text: "See it works before you pay",
  },
  {
    icon: Rocket,
    text: "Live in days",
  },
];

export function TrustCarousel() {
  return (
    <section className="relative overflow-hidden py-4">
      {/* Top border — gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(to right, #111827 0%, transparent 45%, transparent 55%, #111827 100%)",
        }}
      />
      {/* Bottom border — gradient line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(to right, #111827 0%, transparent 45%, transparent 55%, #111827 100%)",
        }}
      />
      <div className="flex w-full overflow-hidden">
        {/* First Loop */}
        <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 items-center">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mx-8 text-sm md:text-base font-medium text-foreground">
              <item.icon className="h-5 w-5 text-primary/80" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        {/* Second Loop (Duplicate) */}
        <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 items-center">
          {trustItems.map((item, index) => (
            <div key={`dup-${index}`} className="flex items-center gap-3 mx-8 text-sm md:text-base font-medium text-foreground">
              <item.icon className="h-5 w-5 text-primary/80" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
