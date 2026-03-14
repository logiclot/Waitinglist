"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Filter, X, Search, ChevronDown, ChevronUp } from "lucide-react";

export interface SuiteFilters {
  query: string;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  deliveryMinDays: number | null;
  deliveryMaxDays: number | null;
  businessGoals: string[];
  sort: string;
}

export const INITIAL_SUITE_FILTERS: SuiteFilters = {
  query: "",
  category: null,
  minPrice: null,
  maxPrice: null,
  deliveryMinDays: null,
  deliveryMaxDays: null,
  businessGoals: [],
  sort: "recommended",
};

interface SuiteFilterSidebarProps {
  filters: SuiteFilters;
  onChange: (filters: SuiteFilters) => void;
  /** All unique categories derived from suites */
  categories: string[];
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function SuiteFilterSidebar({
  filters,
  onChange,
  categories,
  isMobileOpen = false,
  onMobileClose,
}: SuiteFilterSidebarProps) {
  const update = (key: keyof SuiteFilters, val: string | number | null | string[]) => {
    onChange({ ...filters, [key]: val });
  };

  const toggleGoal = (goal: string) => {
    const current = filters.businessGoals;
    if (current.includes(goal)) {
      update("businessGoals", current.filter((g) => g !== goal));
    } else {
      update("businessGoals", [...current, goal]);
    }
  };

  // ── Local price state with debounce ──
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice?.toString() || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice?.toString() || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalMinPrice(filters.minPrice?.toString() || "");
    setLocalMaxPrice(filters.maxPrice?.toString() || "");
  }, [filters.minPrice, filters.maxPrice]);

  const debouncedPriceUpdate = useCallback(
    (key: "minPrice" | "maxPrice", raw: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        update(key, raw ? Number(raw) : null);
      }, 500);
    },
    [filters] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Section visibility
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    delivery: true,
    goals: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-border py-4">
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center justify-between w-full text-sm font-bold mb-2 hover:text-primary transition-colors"
      >
        {title}
        {openSections[id] ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {openSections[id] && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
          {children}
        </div>
      )}
    </div>
  );

  const Content = (
    <div className="space-y-1 pr-2">
      {/* Search */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search suites..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
          />
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">
          Category
        </label>
        <select
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          value={filters.category || ""}
          onChange={(e) => update("category", e.target.value || null)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <Section id="price" title="Total Price">
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
            onBlur={() =>
              update("minPrice", localMinPrice ? Number(localMinPrice) : null)
            }
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
            onBlur={() =>
              update("maxPrice", localMaxPrice ? Number(localMaxPrice) : null)
            }
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "< €2k", min: null, max: 2000 },
            { label: "€2k–€5k", min: 2000, max: 5000 },
            { label: "€5k–€10k", min: 5000, max: 10000 },
            { label: "€10k+", min: 10000, max: null },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() =>
                onChange({
                  ...filters,
                  minPrice: preset.min,
                  maxPrice: preset.max,
                })
              }
              className="text-xs px-2 py-1 bg-secondary rounded border border-border hover:border-primary/50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Delivery Time */}
      <Section id="delivery" title="Delivery Time">
        {[
          { label: "Up to 7 days", min: null, max: 7 },
          { label: "1–2 weeks", min: 8, max: 14 },
          { label: "2–4 weeks", min: 15, max: 28 },
          { label: "4+ weeks", min: 29, max: null },
        ].map((opt) => {
          const isSelected =
            filters.deliveryMinDays === opt.min &&
            filters.deliveryMaxDays === opt.max;
          return (
            <label
              key={opt.label}
              className="flex items-center gap-2 text-sm cursor-pointer mb-1 group"
            >
              <input
                type="radio"
                name="suite-delivery"
                checked={isSelected}
                onChange={() =>
                  onChange({
                    ...filters,
                    deliveryMinDays: opt.min,
                    deliveryMaxDays: opt.max,
                  })
                }
                className="text-primary focus:ring-primary"
              />
              {opt.label}
            </label>
          );
        })}
      </Section>

      {/* Business Goal */}
      <Section id="goals" title="Business Goal">
        {[
          "Lead generation",
          "Sales automation",
          "Customer support",
          "Finance & invoicing",
          "Operations / internal efficiency",
          "Marketing automation",
          "Reporting & dashboards",
        ].map((goal) => (
          <label
            key={goal}
            className="flex items-center gap-2 text-sm cursor-pointer mb-1 group"
          >
            <input
              type="checkbox"
              checked={filters.businessGoals.includes(goal)}
              onChange={() => toggleGoal(goal)}
              className="rounded text-primary focus:ring-primary"
            />
            {goal}
          </label>
        ))}
      </Section>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-60 flex-shrink-0">
        <div className="flex items-center gap-2 font-bold mb-4">
          <Filter className="h-4 w-4" /> Filters
        </div>
        {Content}
      </div>

      {/* Mobile Drawer/Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative w-full max-w-xs bg-card h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg">Filters</h2>
              <button
                onClick={onMobileClose}
                className="p-2 hover:bg-secondary rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{Content}</div>
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
