"use client";

import { Clock, PlayCircle, ShieldCheck, Award, TrendingUp, Users, Wrench, Lock } from "lucide-react";

// Types for the form data (subset of Solution)
export interface SolutionFormData {
  title: string;
  short_summary?: string;
  category: string;
  integrations: string[];
  implementation_price: number;
  delivery_days: number;
  support_days: number;
  outcome?: string;
  outline?: string[];
  monthly_cost_min?: number;
  monthly_cost_max?: number;
}

export function SolutionPreview({ data }: { data: SolutionFormData }) {
  // Mock badges for preview
  const badges = [
    { label: "Escrow", icon: Lock, className: "text-slate-700 bg-slate-50 border-slate-200" }
  ];
  
  if (data.support_days) {
    badges.unshift({ 
      label: `Support: ${data.support_days}d`, 
      icon: Wrench, 
      className: "text-emerald-700 bg-emerald-50 border-emerald-200" 
    });
  }

  return (
    <div className="sticky top-24">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Live Preview</h3>
      
      <div className="group relative rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
        
        {/* Top Section */}
        <div className="p-6 flex flex-col">
          
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4 gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded border border-border bg-secondary text-muted-foreground truncate max-w-[140px]">
              {data.category || "Category"}
            </span>
            
            <div className="flex items-center gap-1.5 shrink-0">
              {badges.map((badge, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.className}`}
                >
                  <badge.icon className="h-3 w-3" />
                  <span className="hidden xl:inline">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="font-bold text-lg leading-tight mb-2 text-foreground line-clamp-2 min-h-[3.5rem] tracking-tight">
            {data.title || "Solution Title"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {data.short_summary || "A short one-liner describing the impact of this solution..."}
          </p>

          {/* Outline / Highlights (New) */}
          {data.outline && data.outline.some(line => line.trim() !== "") && (
            <div className="mb-4 space-y-1">
              {data.outline.filter(line => line.trim() !== "").slice(0, 3).map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 w-1 h-1 rounded-full bg-primary shrink-0" />
                  <span className="line-clamp-1">{line}</span>
                </div>
              ))}
            </div>
          )}

          {/* Outcome Line */}
          {data.outcome && (
            <div className="mb-4 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded-md border border-emerald-100 flex items-start gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="leading-snug">{data.outcome}</span>
            </div>
          )}

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-[26px]">
            {data.integrations.length > 0 ? (
              data.integrations.slice(0, 3).map((tool) => (
                <span key={tool} className="text-xs font-medium border border-border bg-background px-2 py-1 rounded text-muted-foreground">
                  {tool}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">Tools used...</span>
            )}
            {data.integrations.length > 3 && (
              <span className="text-xs font-medium border border-border bg-background px-2 py-1 rounded text-muted-foreground">
                +{data.integrations.length - 3}
              </span>
            )}
          </div>

          {/* Proof Strip Placeholder */}
          <div className="mt-auto pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary/70" />
              <span className="truncate">Trusted by 0+ teams (New Listing)</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Pricing */}
        <div className="p-6 pt-0 bg-card">
          <div className="flex items-end justify-between py-4 border-t border-border">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Implementation</p>
              <p className="font-bold text-xl text-foreground tracking-tight">
                ${data.implementation_price ? data.implementation_price.toLocaleString() : "0"}
              </p>
              
              <div className="flex flex-col gap-0.5 mt-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 
                  Delivery: {data.delivery_days || 7} days
                </p>
                {data.support_days > 0 && (
                  <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    Support: {data.support_days} days
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right pl-4">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Est. Monthly AI</p>
              <p className="font-medium text-sm text-foreground">
                ${data.monthly_cost_min || 0}-${data.monthly_cost_max || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button disabled className="flex-1 text-center bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-bold opacity-50 cursor-not-allowed">
              View Solution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
