"use client";

import { useState, useMemo } from "react";
import { SuiteCard } from "@/components/ecosystems/SuiteCard";
import {
  SuiteFilterSidebar,
  SuiteFilters,
  INITIAL_SUITE_FILTERS,
} from "@/components/ecosystems/SuiteFilterSidebar";
import { BrowseToggle } from "@/components/solutions/BrowseToggle";
import { ArrowUpDown, Heart, Layers, SlidersHorizontal, X } from "lucide-react";
import { useSavedSuitesContext } from "@/hooks/SavedSuitesContext";
import { useSavedSolutionsContext } from "@/hooks/SavedSolutionsContext";
import Link from "next/link";
import type { SuiteCardData } from "@/types";

interface SuitesPageClientProps {
  ecosystems: SuiteCardData[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Compute aggregate values per suite for filtering */
function computeSuiteTotals(eco: SuiteCardData) {
  const sumOfPartsCents = eco.items.reduce(
    (s, i) => s + i.solution.implementationPriceCents,
    0
  );
  // Use bundle price when it exists and is lower than sum of parts
  const totalPriceCents =
    eco.bundlePriceCents != null && eco.bundlePriceCents < sumOfPartsCents
      ? eco.bundlePriceCents
      : sumOfPartsCents;
  const totalDeliveryDays = eco.items.reduce(
    (s, i) => s + i.solution.deliveryDays,
    0
  );
  // Collect all unique categories & business goals across solutions
  // Categories are also added to businessGoals so filtering by a goal
  // like "Marketing automation" also matches suites whose solutions have
  // that value as their category (users expect these to overlap).
  const categories = new Set<string>();
  const businessGoals = new Set<string>();
  for (const item of eco.items) {
    categories.add(item.solution.category);
    businessGoals.add(item.solution.category);
    for (const g of item.solution.businessGoals ?? []) {
      businessGoals.add(g);
    }
  }
  return { totalPriceCents, totalDeliveryDays, categories, businessGoals };
}

function applySuiteFilters(
  ecosystems: SuiteCardData[],
  filters: SuiteFilters
): SuiteCardData[] {
  return ecosystems.filter((eco) => {
    const { totalPriceCents, totalDeliveryDays, categories, businessGoals } =
      computeSuiteTotals(eco);
    const totalPriceEuro = totalPriceCents / 100;

    // 1. Text search
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matches =
        eco.title.toLowerCase().includes(q) ||
        eco.shortPitch.toLowerCase().includes(q) ||
        eco.items.some((i) => i.solution.title.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // 2. Category (match if ANY solution in the suite has this category)
    if (filters.category) {
      if (!categories.has(filters.category)) return false;
    }

    // 3. Price (total suite price in euros)
    if (filters.minPrice !== null && totalPriceEuro < filters.minPrice)
      return false;
    if (filters.maxPrice !== null && totalPriceEuro > filters.maxPrice)
      return false;

    // 4. Delivery time (total sequential days)
    if (
      filters.deliveryMinDays !== null &&
      totalDeliveryDays < filters.deliveryMinDays
    )
      return false;
    if (
      filters.deliveryMaxDays !== null &&
      totalDeliveryDays > filters.deliveryMaxDays
    )
      return false;

    // 5. Business goals (match if ANY solution in the suite has a matching goal)
    if (filters.businessGoals.length > 0) {
      if (!filters.businessGoals.some((g) => businessGoals.has(g)))
        return false;
    }

    return true;
  });
}

/** Get the effective price for a suite (uses bundle price when applicable) */
function getEffectivePrice(eco: SuiteCardData): number {
  return computeSuiteTotals(eco).totalPriceCents;
}

function sortSuites(
  ecosystems: SuiteCardData[],
  sort: string
): SuiteCardData[] {
  const sorted = [...ecosystems];
  switch (sort) {
    case "price_asc":
      return sorted.sort(
        (a, b) => getEffectivePrice(a) - getEffectivePrice(b)
      );
    case "price_desc":
      return sorted.sort(
        (a, b) => getEffectivePrice(b) - getEffectivePrice(a)
      );
    case "delivery_fast":
      return sorted.sort(
        (a, b) =>
          a.items.reduce((s, i) => s + i.solution.deliveryDays, 0) -
          b.items.reduce((s, i) => s + i.solution.deliveryDays, 0)
      );
    case "solutions_most":
      return sorted.sort((a, b) => b.items.length - a.items.length);
    default:
      return sorted;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function SuitesPageClient({ ecosystems }: SuitesPageClientProps) {
  const [filters, setFilters] = useState<SuiteFilters>(INITIAL_SUITE_FILTERS);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { savedIds } = useSavedSuitesContext();
  const { savedIds: savedSolutionIds } = useSavedSolutionsContext();
  const totalFavoritesCount = savedIds.size + savedSolutionIds.size;

  // Derive unique categories from all suites
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const eco of ecosystems) {
      for (const item of eco.items) {
        cats.add(item.solution.category);
      }
    }
    return Array.from(cats).sort();
  }, [ecosystems]);

  // Filter + sort
  const displayedSuites = useMemo(() => {
    const filtered = applySuiteFilters(ecosystems, filters);
    return sortSuites(filtered, filters.sort);
  }, [ecosystems, filters]);

  // Active filter count (for chip / clear button)
  const activeFilterCount =
    (filters.query ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.deliveryMinDays !== null || filters.deliveryMaxDays !== null
      ? 1
      : 0) +
    filters.businessGoals.length;

  const clearFilters = () => setFilters(INITIAL_SUITE_FILTERS);

  // Global empty state
  if (ecosystems.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
        <div className="mx-auto h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
          <Layers className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No suites published yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Suites are curated bundles of automations built to work together.
          Check back soon or browse individual solutions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <SuiteFilterSidebar
        filters={filters}
        onChange={setFilters}
        categories={allCategories}
        isMobileOpen={isMobileFiltersOpen}
        onMobileClose={() => setIsMobileFiltersOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="mb-3">
              <BrowseToggle />
            </div>
            <h1 className="text-3xl font-bold mb-1">Solution Suites</h1>
            <p className="text-muted-foreground text-sm">
              {displayedSuites.length} suite
              {displayedSuites.length !== 1 ? "s" : ""} available
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Favorites Link */}
            <Link
              href="/favorites"
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorites</span>
              {totalFavoritesCount > 0 && <span className="text-xs">({totalFavoritesCount})</span>}
            </Link>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-medium"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Sort by:
              </span>
              <div className="relative">
                <select
                  className="appearance-none bg-card border border-border text-foreground text-sm rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  value={filters.sort}
                  onChange={(e) =>
                    setFilters({ ...filters, sort: e.target.value })
                  }
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="delivery_fast">Fastest Delivery</option>
                  <option value="solutions_most">Most Solutions</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground mr-2">
              Active filters:
            </span>
            {filters.category && (
              <Chip
                label={`Category: ${filters.category}`}
                onRemove={() => setFilters({ ...filters, category: null })}
              />
            )}
            {(filters.minPrice !== null || filters.maxPrice !== null) && (
              <Chip
                label={`Price: ${filters.minPrice ? `€${filters.minPrice}` : "0"} – ${filters.maxPrice ? `€${filters.maxPrice}` : "Any"}`}
                onRemove={() =>
                  setFilters({ ...filters, minPrice: null, maxPrice: null })
                }
              />
            )}
            {(filters.deliveryMinDays !== null ||
              filters.deliveryMaxDays !== null) && (
              <Chip
                label={`Delivery: ${filters.deliveryMinDays ?? 0}–${filters.deliveryMaxDays ?? "∞"} days`}
                onRemove={() =>
                  setFilters({
                    ...filters,
                    deliveryMinDays: null,
                    deliveryMaxDays: null,
                  })
                }
              />
            )}
            {filters.businessGoals.map((g) => (
              <Chip
                key={g}
                label={g}
                onRemove={() =>
                  setFilters({
                    ...filters,
                    businessGoals: filters.businessGoals.filter(
                      (bg) => bg !== g
                    ),
                  })
                }
              />
            ))}
            <button
              onClick={clearFilters}
              className="text-xs text-primary font-medium hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Favorites active banner */}
        {/* Suite Cards */}
        {displayedSuites.length > 0 ? (
          <div className="space-y-5 animate-in fade-in duration-500">
            {displayedSuites.map((eco) => (
              <SuiteCard key={eco.id} ecosystem={eco} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Layers className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No suites match your filters
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Try adjusting or clearing some filters to see more results.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-foreground text-muted-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
