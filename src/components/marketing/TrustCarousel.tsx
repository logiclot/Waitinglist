"use client";

import { ShieldCheck, Zap, Lightbulb, CheckCircle2, Award, Lock, TrendingUp } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    text: "Every implementation is protected by a platform-wide Mutual NDA.",
    highlight: ["Mutual NDA"],
  },
  {
    icon: Lightbulb,
    text: "Stop guessing. Let our Elite Experts propose the ideas to you for €50.",
    highlight: ["€50"],
  },
  {
    icon: CheckCircle2,
    text: "0% Platform Commission for Businesses. Pay for outcomes, not access.",
    highlight: ["0%"],
  },
  {
    icon: TrendingUp,
    text: "The intelligent process automation market is projected to reach $44.7B by 2030.",
    highlight: ["$44.7B"],
    source: "Grand View Research, 2024",
  },
  {
    icon: Award,
    text: "Only the top 5% of automation architects earn the Founding Expert badge.",
    highlight: ["top 5%"],
  },
  {
    icon: Lock,
    text: "Zero-Data Handover: Keep your API keys private, we just build the engine.",
    highlight: ["Zero-Data"],
  },
  {
    icon: Zap,
    text: "Nearly 60% of companies have already introduced some level of process automation.",
    highlight: ["60%"],
    source: "McKinsey & Company",
  },
];

export function TrustCarousel() {
  const renderText = (text: string, highlights?: string[]) => {
    if (!highlights || highlights.length === 0) return text;
    
    // Simple replacement for one highlight occurrence per string for MVP efficiency
    const parts = text.split(new RegExp(`(${highlights.join("|")})`, 'g'));
    
    return (
      <>
        {parts.map((part, i) => (
          highlights.includes(part) ? (
            <span key={i} className="text-primary font-bold">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        ))}
      </>
    );
  };

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
            <div key={index} className="flex items-center gap-3 mx-8 text-sm md:text-base font-medium text-muted-foreground">
              <item.icon className="h-5 w-5 text-primary/80" />
              <span>{renderText(item.text, item.highlight)}</span>
              {item.source && <span className="text-muted-foreground/50 text-xs ml-1">— {item.source}</span>}
            </div>
          ))}
        </div>
        {/* Second Loop (Duplicate) */}
        <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 items-center">
          {trustItems.map((item, index) => (
            <div key={`dup-${index}`} className="flex items-center gap-3 mx-8 text-sm md:text-base font-medium text-muted-foreground">
              <item.icon className="h-5 w-5 text-primary/80" />
              <span>{renderText(item.text, item.highlight)}</span>
              {item.source && <span className="text-muted-foreground/50 text-xs ml-1">— {item.source}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
