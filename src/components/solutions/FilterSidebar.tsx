"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Filter, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { SolutionFilters, applySolutionFilters } from "@/lib/solutions/filters";
import { Category, Solution } from "@/types";

interface FilterSidebarProps {
  filters: SolutionFilters;
  onChange: (filters: SolutionFilters) => void;
  categories: Category[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ecosystems?: any[];
  solutions?: Solution[]; // ALL solutions (unfiltered) — counts are computed with faceted logic
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

  // ── Local price state with debounce (prevents cursor jump on every keystroke) ──
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice?.toString() || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice?.toString() || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync local state when filters change externally (URL nav, preset click, clear)
  useEffect(() => {
    setLocalMinPrice(filters.minPrice?.toString() || "");
    setLocalMaxPrice(filters.maxPrice?.toString() || "");
  }, [filters.minPrice, filters.maxPrice]);

  const debouncedPriceUpdate = useCallback((key: "minPrice" | "maxPrice", raw: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      update(key, raw ? Number(raw) : null);
    }, 500);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Faceted counts: for each dimension, apply all OTHER active filters ──
  // This gives users accurate counts — "if I click this, how many results will I see?"
  const countBaseSets = useMemo(() => {
    const dimensions = ["category", "delivery", "businessGoals", "integrations", "expertTier", "paybackPeriod"] as const;
    const bases: Record<string, Solution[]> = {};
    for (const dim of dimensions) {
      const f: SolutionFilters = { ...filters };
      switch (dim) {
        case "category": f.category = null; break;
        case "delivery": f.deliveryMinDays = null; f.deliveryMaxDays = null; break;
        case "businessGoals": f.businessGoals = []; break;
        case "integrations": f.tools = []; break;
        case "expertTier": f.expertTier = null; break;
        case "paybackPeriod": f.paybackPeriod = null; break;
      }
      bases[dim] = applySolutionFilters(solutions, f);
    }
    return bases;
  }, [solutions, filters]);

  // Count matches within the faceted base set for each dimension
  const getCount = (key: keyof Solution | "delivery" | "expertTier", value: unknown) => {
    if (!solutions) return 0;
    const dimension = key === "delivery" ? "delivery"
      : key === "expertTier" ? "expertTier"
      : key === "integrations" ? "integrations"
      : (key as string);
    const base = countBaseSets[dimension] || solutions;
    return base.filter(s => {
      if (key === "category") {
        const sSlug = s.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-").replace(/[^\w-]+/g, "");
        return sSlug === value;
      }
      if (key === "delivery") {
        // Exclusive range: { min, max }
        const range = value as { min: number | null; max: number | null };
        if (range.min !== null && s.delivery_days < range.min) return false;
        if (range.max !== null && s.delivery_days > range.max) return false;
        return true;
      }
      if (key === "expertTier") return s.expertTier === value;
      if (key === "paybackPeriod") {
        if (value === "__none__") return !s.paybackPeriod;
        return s.paybackPeriod === value;
      }
      if (key === "businessGoals") return s.businessGoals?.includes(value as string);
      if (key === "integrations") return s.integrations?.includes(value as string);
      return false;
    }).length;
  };

  // Count of solutions matching all filters (for "All Categories" label)
  const totalFiltered = useMemo(() => applySolutionFilters(solutions, filters).length, [solutions, filters]);

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
          <option value="">All Categories ({totalFiltered})</option>
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Min"
            className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
            value={localMinPrice}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              setLocalMinPrice(v);
              debouncedPriceUpdate("minPrice", v);
            }}
            onBlur={() => update("minPrice", localMinPrice ? Number(localMinPrice) : null)}
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Max"
            className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
            value={localMaxPrice}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              setLocalMaxPrice(v);
              debouncedPriceUpdate("maxPrice", v);
            }}
            onBlur={() => update("maxPrice", localMaxPrice ? Number(localMaxPrice) : null)}
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
                onChange({ ...filters, minPrice: preset.min, maxPrice: preset.max });
              }}
              className="text-xs px-2 py-1 bg-secondary rounded border border-border hover:border-primary/50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Section>

      {/* 2. Delivery Time (exclusive ranges) */}
      <Section id="delivery" title="Delivery Time">
        {[
          { label: "Up to 3 days", min: null, max: 3 },
          { label: "4–7 days", min: 4, max: 7 },
          { label: "1–2 weeks", min: 8, max: 14 },
          { label: "2+ weeks", min: 15, max: null }
        ].map(opt => {
          const isSelected = filters.deliveryMinDays === opt.min && filters.deliveryMaxDays === opt.max;
          const count = getCount('delivery', { min: opt.min, max: opt.max });
          return (
            <label key={opt.label} className="flex items-center gap-2 text-sm cursor-pointer mb-1 justify-between group">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="delivery"
                  checked={isSelected}
                  onChange={() => {
                    onChange({ ...filters, deliveryMinDays: opt.min, deliveryMaxDays: opt.max });
                  }}
                  className="text-primary focus:ring-primary"
                />
                {opt.label}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">{count}</span>
            </label>
          );
        })}
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
          { label: "Standard", val: "standard" },
          { label: "Proven (5+ sales)", val: "proven" },
          { label: "Elite (10+ sales)", val: "elite" },
          { label: "Founding Expert", val: "founding" }
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
          { label: "Long-term efficiency", val: "long_term" },
          { label: "Not specified", val: "__none__" }
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
