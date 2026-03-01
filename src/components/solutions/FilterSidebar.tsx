"use client";

import { useState } from "react";
import { Filter, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { SolutionFilters } from "@/lib/solutions/filters";
import { Category, Solution } from "@/types";

interface FilterSidebarProps {
  filters: SolutionFilters;
  onChange: (filters: SolutionFilters) => void;
  categories: Category[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ecosystems?: any[];
  solutions?: Solution[]; // Add solutions prop for counters
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function FilterSidebar({ 
  filters, 
  onChange, 
  categories, 
  ecosystems,
  solutions = [], // Default to empty array
  className = "",
  isMobileOpen = false,
  onMobileClose
}: FilterSidebarProps) {
  
  // Handlers for specific filter types
  const update = (key: keyof SolutionFilters, val: string | number | null | string[]) => {
    onChange({ ...filters, [key]: val });
  };

  const toggleArrayItem = (key: "businessGoals" | "tools", item: string) => {
    const current = filters[key];
    if (current.includes(item)) {
      update(key, current.filter(i => i !== item));
    } else {
      update(key, [...current, item]);
    }
  };

  // Helper to count matches
  const getCount = (key: keyof Solution | 'delivery' | 'expertTier', value: string | number | null | boolean) => {
    if (!solutions) return 0;
    return solutions.filter(s => {
      if (key === 'category') {
        // Normalize category comparison
        const sSlug = s.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-").replace(/[^\w-]+/g, "");
        return sSlug === value;
      }
      if (key === 'delivery') {
        if (value === null) return true;
        return s.delivery_days <= (value as number);
      }
      if (key === 'expertTier') return s.expertTier === value;
      if (key === 'paybackPeriod') return s.paybackPeriod === value;
      
      // Arrays
      if (key === 'businessGoals') return s.businessGoals?.includes(value as string);
      if (key === 'integrations') return s.integrations?.includes(value as string); // tools
      return false;
    }).length;
  };

  // Section visibility state (all open by default for now)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    delivery: true,
    goals: true,
    tools: true,
    tier: true,
    roi: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <div className="border-b border-border py-4">
      <button 
        onClick={() => toggleSection(id)}
        className="flex items-center justify-between w-full text-sm font-bold mb-2 hover:text-primary transition-colors"
      >
        {title}
        {openSections[id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {openSections[id] && <div className="space-y-2 animate-in fade-in slide-in-from-top-1">{children}</div>}
    </div>
  );

  const Content = (
    <div className="space-y-1 pr-2">
      {/* Search */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">Search</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
          />
        </div>
      </div>

      {/* Stack Filter */}
      {ecosystems && ecosystems.length > 0 && (
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block text-muted-foreground">Stack</label>
          <select 
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            value={filters.stackId || ""}
            onChange={(e) => update("stackId", e.target.value || null)}
          >
            <option value="">Any</option>
            {ecosystems.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Categories */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">Category</label>
        <select 
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          value={filters.category || ""}
          onChange={(e) => update("category", e.target.value || null)}
        >
          <option value="">All Categories ({solutions.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>
              {c.name} ({getCount('category', c.slug)})
            </option>
          ))}
        </select>
      </div>

      {/* 1. Price */}
      <Section id="price" title="Price (One-time)">
        <div className="flex items-center gap-2 mb-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
            value={filters.minPrice || ""}
            onChange={(e) => update("minPrice", e.target.value ? Number(e.target.value) : null)}
          />
          <span className="text-muted-foreground">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
            value={filters.maxPrice || ""}
            onChange={(e) => update("maxPrice", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "< €1k", min: null, max: 1000 },
            { label: "€1k–€3k", min: 1000, max: 3000 },
            { label: "€3k–€5k", min: 3000, max: 5000 },
            { label: "€5k+", min: 5000, max: null }
          ].map(preset => (
            <button 
              key={preset.label}
              onClick={() => {
                update("minPrice", preset.min);
                update("maxPrice", preset.max);
              }}
              className="text-xs px-2 py-1 bg-secondary rounded border border-border hover:border-primary/50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Section>

      {/* 2. Delivery Time */}
      <Section id="delivery" title="Delivery Time">
        {[
          { label: "Up to 3 days", val: 3 },
          { label: "Up to 7 days", val: 7 },
          { label: "Up to 2 weeks", val: 14 },
          { label: "2+ weeks", val: null } // Just clears the max filter effectively
        ].map(opt => (
          <label key={opt.label} className="flex items-center gap-2 text-sm cursor-pointer mb-1 justify-between group">
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                name="delivery"
                checked={filters.deliveryMaxDays === opt.val}
                onChange={() => update("deliveryMaxDays", opt.val)}
                className="text-primary focus:ring-primary"
              />
              {opt.label}
            </div>
            {opt.val && (
              <span className="text-xs text-muted-foreground group-hover:text-foreground">{getCount('delivery', opt.val)}</span>
            )}
          </label>
        ))}
      </Section>

      {/* 3. Business Goal */}
      <Section id="goals" title="Business Goal">
        {[
          "Lead generation", "Sales automation", "Customer support", 
          "Finance & invoicing", "Operations / internal efficiency", 
          "Marketing automation", "Reporting & dashboards"
        ].map(goal => (
          <label key={goal} className="flex items-center gap-2 text-sm cursor-pointer mb-1 justify-between group">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={filters.businessGoals.includes(goal)}
                onChange={() => toggleArrayItem("businessGoals", goal)}
                className="rounded text-primary focus:ring-primary"
              />
              {goal}
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground">{getCount('businessGoals', goal)}</span>
          </label>
        ))}
      </Section>

      {/* 4. Tools */}
      <Section id="tools" title="Tools Used">
        <div className="flex flex-wrap gap-2">
          {[
            "HubSpot", "Salesforce", "Zapier", "Make", "n8n", 
            "Slack", "Google Sheets", "Shopify", "Stripe", "Notion", "OpenAI", "Python"
          ].map(tool => {
            const count = getCount('integrations', tool);
            return (
              <button
                key={tool}
                onClick={() => toggleArrayItem("tools", tool)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                  filters.tools.includes(tool)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-foreground"
                }`}
              >
                {tool}
                <span className={`text-[10px] ${filters.tools.includes(tool) ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* 5. Expert Tier */}
      <Section id="tier" title="Expert Tier">
        {[
          { label: "Vetted Expert", val: "vetted" },
          { label: "Founding Expert", val: "founding" },
          { label: "Agency-ready", val: "agency" }
        ].map(tier => (
          <label key={tier.val} className="flex items-center gap-2 text-sm cursor-pointer mb-1 justify-between group">
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                name="tier"
                checked={filters.expertTier === tier.val}
                onChange={() => update("expertTier", tier.val)}
                className="text-primary focus:ring-primary"
              />
              {tier.label}
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground">{getCount('expertTier', tier.val)}</span>
          </label>
        ))}
      </Section>

      {/* 6. ROI / Payback */}
      <Section id="roi" title="ROI / Payback">
        {[
          { label: "< 1 month", val: "lt_1m" },
          { label: "1–3 months", val: "1_3m" },
          { label: "4–6 months", val: "4_6m" },
          { label: "Long-term efficiency", val: "long_term" }
        ].map(roi => (
          <label key={roi.val} className="flex items-center gap-2 text-sm cursor-pointer mb-1 justify-between group">
            <div className="flex items-center gap-2">
              <input 
                type="radio" 
                name="roi"
                checked={filters.paybackPeriod === roi.val}
                onChange={() => update("paybackPeriod", roi.val)}
                className="text-primary focus:ring-primary"
              />
              {roi.label}
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground">{getCount('paybackPeriod', roi.val)}</span>
          </label>
        ))}
      </Section>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block w-64 flex-shrink-0 ${className}`}>
        <div className="flex items-center gap-2 font-bold mb-4">
          <Filter className="h-4 w-4" /> Filters
        </div>
        {Content}
      </div>

      {/* Mobile Drawer/Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative w-full max-w-xs bg-card h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={onMobileClose} className="p-2 hover:bg-secondary rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {Content}
            </div>
            <div className="p-4 border-t border-border">
              <button 
                onClick={onMobileClose}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
