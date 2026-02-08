"use client";

import { ShieldCheck, Zap, Lightbulb, CheckCircle2, Award, Lock, Star } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    text: "Every implementation is protected by a platform-wide Mutual NDA.",
    highlight: ["Mutual NDA"]
  },
  {
    icon: Lightbulb,
    text: "Stop guessing. Let our Elite Experts propose the ideas to you for $50.",
    highlight: ["$50"]
  },
  {
    icon: CheckCircle2,
    text: "0% Platform Commission for Businesses. Pay for outcomes, not access.",
    highlight: ["0%"]
  },
  {
    icon: Zap,
    text: "Saved 15 hours of manual data entry in my first week. Game changer.",
    author: "SaaS Founder"
  },
  {
    icon: Award,
    text: "Only the top 5% of automation architects earn the Founding Expert badge.",
    highlight: ["top 5%"]
  },
  {
    icon: Lock,
    text: "Zero-Data Handover: Keep your API keys private, we just build the engine.",
    highlight: ["Zero-Data"]
  },
  {
    icon: Star,
    text: "The Discovery Scan credited back to my project. It’s a no-brainer.",
    author: "E-com Owner"
  }
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
    <section className="border-y border-border bg-secondary/30 overflow-hidden py-4">
      <div className="flex w-full overflow-hidden">
        {/* First Loop */}
        <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 items-center">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mx-8 text-sm md:text-base font-medium text-muted-foreground">
              <item.icon className="h-5 w-5 text-primary/80" />
              <span>
                {item.author ? `"${item.text}"` : renderText(item.text, item.highlight)}
              </span>
              {item.author && <span className="text-primary text-xs uppercase tracking-wide font-bold ml-1">— {item.author}</span>}
            </div>
          ))}
        </div>
        {/* Second Loop (Duplicate) */}
        <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 items-center">
          {trustItems.map((item, index) => (
            <div key={`dup-${index}`} className="flex items-center gap-3 mx-8 text-sm md:text-base font-medium text-muted-foreground">
              <item.icon className="h-5 w-5 text-primary/80" />
              <span>
                {item.author ? `"${item.text}"` : renderText(item.text, item.highlight)}
              </span>
              {item.author && <span className="text-primary text-xs uppercase tracking-wide font-bold ml-1">— {item.author}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
