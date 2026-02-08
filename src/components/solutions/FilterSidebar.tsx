"use client";

import { useEffect, useState } from "react";
import { Filter, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { SolutionFilters } from "@/lib/solutions/filters";
import { Category } from "@/types";

interface FilterSidebarProps {
  filters: SolutionFilters;
  onChange: (filters: SolutionFilters) => void;
  categories: Category[];
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function FilterSidebar({ 
  filters, 
  onChange, 
  categories, 
  className = "",
  isMobileOpen = false,
  onMobileClose
}: FilterSidebarProps) {
  
  // Handlers for specific filter types
  const update = (key: keyof SolutionFilters, val: any) => {
    onChange({ ...filters, [key]: val });
  };

  const toggleArrayItem = (key: "businessGoals" | "tools" | "industries" | "trustSignals", item: string) => {
    const current = filters[key];
    if (current.includes(item)) {
      update(key, current.filter(i => i !== item));
    } else {
      update(key, [...current, item]);
    }
  };

  // Section visibility state (all open by default for now)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    maintenance: true,
    delivery: true,
    goals: true,
    tools: true,
    complexity: true,
    tier: true,
    roi: true,
    industry: true,
    trust: true
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

      {/* Categories */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">Category</label>
        <select 
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          value={filters.category || ""}
          onChange={(e) => update("category", e.target.value || null)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
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
            { label: "< $1k", min: null, max: 1000 },
            { label: "$1k-$3k", min: 1000, max: 3000 },
            { label: "$3k-$5k", min: 3000, max: 5000 },
            { label: "$5k+", min: 5000, max: null }
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

      {/* 2. Maintenance */}
      <Section id="maintenance" title="Maintenance Cost">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="radio" 
              name="maintenance" 
              checked={filters.maintenance === "any"} 
              onChange={() => update("maintenance", "any")} 
              className="text-primary focus:ring-primary"
            />
            Any
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="radio" 
              name="maintenance" 
              checked={filters.maintenance === "none"} 
              onChange={() => update("maintenance", "none")} 
              className="text-primary focus:ring-primary"
            />
            No ongoing cost
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="radio" 
              name="maintenance" 
              checked={filters.maintenance === "available"} 
              onChange={() => update("maintenance", "available")} 
              className="text-primary focus:ring-primary"
            />
            Maintenance available
          </label>
          
          {filters.maintenance === "available" && (
            <div className="pl-6 pt-2 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="number" 
                  placeholder="Min $" 
                  className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                  value={filters.minMaintenancePrice || ""}
                  onChange={(e) => update("minMaintenancePrice", e.target.value ? Number(e.target.value) : null)}
                />
                <span className="text-muted-foreground">-</span>
                <input 
                  type="number" 
                  placeholder="Max $" 
                  className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                  value={filters.maxMaintenancePrice || ""}
                  onChange={(e) => update("maxMaintenancePrice", e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* 3. Delivery Time */}
      <Section id="delivery" title="Delivery Time">
        {[
          { label: "Up to 3 days", val: 3 },
          { label: "Up to 7 days", val: 7 },
          { label: "Up to 2 weeks", val: 14 },
          { label: "2+ weeks", val: null } // Just clears the max filter effectively
        ].map(opt => (
          <label key={opt.label} className="flex items-center gap-2 text-sm cursor-pointer mb-1">
            <input 
              type="radio" 
              name="delivery"
              checked={filters.deliveryMaxDays === opt.val}
              onChange={() => update("deliveryMaxDays", opt.val)}
              className="text-primary focus:ring-primary"
            />
            {opt.label}
          </label>
        ))}
      </Section>

      {/* 4. Business Goal */}
      <Section id="goals" title="Business Goal">
        {[
          "Lead generation", "Sales automation", "Customer support", 
          "Finance & invoicing", "Operations / internal efficiency", 
          "Marketing automation", "Reporting & dashboards"
        ].map(goal => (
          <label key={goal} className="flex items-center gap-2 text-sm cursor-pointer mb-1">
            <input 
              type="checkbox" 
              checked={filters.businessGoals.includes(goal)}
              onChange={() => toggleArrayItem("businessGoals", goal)}
              className="rounded text-primary focus:ring-primary"
            />
            {goal}
          </label>
        ))}
      </Section>

      {/* 5. Tools */}
      <Section id="tools" title="Tools Used">
        <div className="flex flex-wrap gap-2">
          {[
            "HubSpot", "Salesforce", "Zapier", "Make", "n8n", 
            "Slack", "Google Sheets", "Shopify", "Stripe", "Notion", "OpenAI", "Python"
          ].map(tool => (
            <button
              key={tool}
              onClick={() => toggleArrayItem("tools", tool)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                filters.tools.includes(tool)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      </Section>

      {/* 6. Complexity */}
      <Section id="complexity" title="Complexity">
        {["Simple", "Medium", "Advanced"].map(c => (
          <label key={c} className="flex items-center gap-2 text-sm cursor-pointer mb-1">
            <input 
              type="radio" 
              name="complexity"
              checked={filters.complexity === c}
              onChange={() => update("complexity", c)}
              className="text-primary focus:ring-primary"
            />
            {c}
          </label>
        ))}
      </Section>

      {/* 7. Expert Tier */}
      <Section id="tier" title="Expert Tier">
        {[
          { label: "Vetted Expert", val: "vetted" },
          { label: "Founding Expert", val: "founding" },
          { label: "Agency-ready", val: "agency" }
        ].map(tier => (
          <label key={tier.val} className="flex items-center gap-2 text-sm cursor-pointer mb-1">
            <input 
              type="radio" 
              name="tier"
              checked={filters.expertTier === tier.val}
              onChange={() => update("expertTier", tier.val)}
              className="text-primary focus:ring-primary"
            />
            {tier.label}
          </label>
        ))}
      </Section>

      {/* 8. ROI / Payback */}
      <Section id="roi" title="ROI / Payback">
        {[
          { label: "< 1 month", val: "lt_1m" },
          { label: "1–3 months", val: "1_3m" },
          { label: "Long-term efficiency", val: "long_term" }
        ].map(roi => (
          <label key={roi.val} className="flex items-center gap-2 text-sm cursor-pointer mb-1">
            <input 
              type="radio" 
              name="roi"
              checked={filters.paybackPeriod === roi.val}
              onChange={() => update("paybackPeriod", roi.val)}
              className="text-primary focus:ring-primary"
            />
            {roi.label}
          </label>
        ))}
      </Section>

      {/* 9. Industry Fit */}
      <Section id="industry" title="Industry Fit">
        {["eCommerce", "SaaS", "Real estate", "Agencies", "Professional services", "Finance", "Healthcare"].map(ind => (
          <label key={ind} className="flex items-center gap-2 text-sm cursor-pointer mb-1">
            <input 
              type="checkbox" 
              checked={filters.industries.includes(ind)}
              onChange={() => toggleArrayItem("industries", ind)}
              className="rounded text-primary focus:ring-primary"
            />
            {ind}
          </label>
        ))}
      </Section>

      {/* 10. Trust Signals */}
      <Section id="trust" title="Trust & Compliance">
        {[
          "NDA included", "Zero-data handover", "No admin access required", "Read-only access only"
        ].map(sig => (
          <label key={sig} className="flex items-center gap-2 text-sm cursor-pointer mb-1">
            <input 
              type="checkbox" 
              checked={filters.trustSignals.includes(sig)}
              onChange={() => toggleArrayItem("trustSignals", sig)}
              className="rounded text-primary focus:ring-primary"
            />
            {sig}
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
