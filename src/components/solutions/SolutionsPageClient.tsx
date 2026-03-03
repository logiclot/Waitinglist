"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SolutionFilters,
  INITIAL_FILTERS,
  parseFiltersFromSearchParams,
  serializeFiltersToSearchParams,
  applySolutionFilters,
  sortSolutions
} from "@/lib/solutions/filters";
import { Solution, Category } from "@/types";
import { SolutionCard } from "@/components/SolutionCard";
import { FilterSidebar } from "@/components/solutions/FilterSidebar";
import { ActiveFilterChips } from "@/components/solutions/ActiveFilterChips";
import { ArrowUpDown, Search, SlidersHorizontal, PlusCircle, Heart, X } from "lucide-react";
import { useSavedSolutionsContext } from "@/hooks/SavedSolutionsContext";

const PAGE_SIZE = 12;

interface SolutionsPageClientProps {
  initialSolutions: Solution[];
  categories: Category[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ecosystems?: any[]; // Optional ecosystems for suite filtering
}

export function SolutionsPageClient({ initialSolutions, categories, ecosystems }: SolutionsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL on mount (and update when URL changes)
  const [filters, setFilters] = useState<SolutionFilters>(INITIAL_FILTERS);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { savedIds } = useSavedSolutionsContext();

  useEffect(() => {
    const parsed = parseFiltersFromSearchParams(searchParams);
    setFilters(parsed);
  }, [searchParams]);

  // Update URL when filters change (debounced for text, immediate for others)
  const updateFilters = (newFilters: SolutionFilters) => {
    setFilters(newFilters);
    const params = serializeFiltersToSearchParams(newFilters);
    // Use replace to avoid cluttering history stack too much, or push for navigation feel
    const currentPath = window.location.pathname;
    router.replace(`${currentPath}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    updateFilters(INITIAL_FILTERS);
  };

  const removeFilter = (key: keyof SolutionFilters, value?: string | number | null) => {
    const newFilters = { ...filters };
    
    if (Array.isArray(newFilters[key])) {
      // @ts-expect-error: known array type
      newFilters[key] = newFilters[key].filter((item: string) => item !== value);
    } else {
      // @ts-expect-error: generic assignment
      newFilters[key] = INITIAL_FILTERS[key];
    }
    
    updateFilters(newFilters);
  };

  // Client-side filtering and sorting
  const filteredSolutions = useMemo(() => {
    const filtered = applySolutionFilters(initialSolutions, filters);
    return sortSolutions(filtered, filters.sort);
  }, [initialSolutions, filters]);

  // Apply favorites filter on top of regular filters
  const displayedSolutions = useMemo(() => {
    if (!showFavoritesOnly) return filteredSolutions;
    return filteredSolutions.filter(s => savedIds.has(s.id));
  }, [filteredSolutions, showFavoritesOnly, savedIds]);

  // Reset visible count when filters or favorites toggle change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, showFavoritesOnly]);

  // Slice for infinite scroll
  const visibleSolutions = displayedSolutions.slice(0, visibleCount);
  const hasMore = visibleCount < displayedSolutions.length;

  // Intersection observer for infinite scroll
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, displayedSolutions.length));
  }, [displayedSolutions.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  // Global Empty State (No solutions in DB)
  if (initialSolutions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center min-h-[60vh]">
        <div className="bg-secondary/50 p-6 rounded-full mb-6">
           <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-3">No solutions yet</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          New solutions are published daily. Check back soon or post a request to get custom bids from experts.
        </p>
        <button 
          onClick={() => router.push('/business/add-request')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> Post a Request
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <FilterSidebar 
        filters={filters} 
        onChange={updateFilters} 
        categories={categories} 
        ecosystems={ecosystems} // Pass ecosystems
        solutions={initialSolutions} // Pass ALL solutions for counters
        isMobileOpen={isMobileFiltersOpen}
        onMobileClose={() => setIsMobileFiltersOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Browse Solutions</h1>
            <p className="text-muted-foreground text-sm">
              {displayedSolutions.length} automation{displayedSolutions.length !== 1 ? 's' : ''} found
              {showFavoritesOnly && <span className="text-red-500 ml-1">· Favorites only</span>}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                showFavoritesOnly
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">Favorites</span>
              {savedIds.size > 0 && <span className="text-xs">({savedIds.size})</span>}
            </button>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-medium"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  className="appearance-none bg-card border border-border text-foreground text-sm rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  value={filters.sort}
                  onChange={(e) => updateFilters({ ...filters, sort: e.target.value })}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="delivery_fast">Fastest Delivery</option>
                  <option value="roi_high">Highest ROI</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <ActiveFilterChips
          filters={filters}
          onRemove={removeFilter}
          onClear={clearFilters}
        />

        {/* Favorites active banner with clear exit */}
        {showFavoritesOnly && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <Heart className="h-4 w-4 fill-current" />
              <span className="font-medium">Showing your favorites</span>
              <span className="text-red-500">({displayedSolutions.length})</span>
            </div>
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Show all solutions
            </button>
          </div>
        )}

        {displayedSolutions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {visibleSolutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            )}
          </>
        ) : showFavoritesOnly ? (
          /* Favorites-specific empty state */
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Click the heart icon on solutions you like to save them here.
            </p>
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Browse all solutions
            </button>
          </div>
        ) : (
          /* Regular filter empty state */
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No solutions match your filters</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Try adjusting or clearing some filters to see more results.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                Clear filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Browse all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
