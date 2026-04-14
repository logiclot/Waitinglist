"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SolutionFilters,
  INITIAL_FILTERS,
  parseFiltersFromSearchParams,
  serializeFiltersToSearchParams,
  applySolutionFilters,
  sortSolutions
} from "@/lib/solutions/filters";
import { SolutionCard } from "@/components/SolutionCard";
import { FilterSidebar } from "@/components/solutions/FilterSidebar";
import { ActiveFilterChips } from "@/components/solutions/ActiveFilterChips";
import { ArrowUpDown, Search, SlidersHorizontal, PlusCircle, Heart } from "lucide-react";
import { useSavedSolutionsContext } from "@/hooks/SavedSolutionsContext";
import { useSavedSuitesContext } from "@/hooks/SavedSuitesContext";
import { BrowseToggle } from "@/components/solutions/BrowseToggle";
import Link from "next/link";
import { useSolutions } from "@/hooks/use-solutions";
import { deriveCategoriesFromSolutions } from "@/lib/utils";
import { useSuites } from "@/hooks/use-suites";
import {
  SidebarSkeleton,
  CardGridSkeleton,
  HeaderSkeleton,
} from "@/components/solutions/SolutionsPageSkeleton";

export function SolutionsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const solutions = useSolutions();
  const suites = useSuites();

  const solutionsData = useMemo(() => solutions.data ?? [], [solutions.data]);
  const categories = useMemo(
    () => deriveCategoriesFromSolutions(solutionsData),
    [solutionsData]
  );

  const [filters, setFilters] = useState<SolutionFilters>(INITIAL_FILTERS);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { savedIds } = useSavedSolutionsContext();
  const { savedIds: savedSuiteIds } = useSavedSuitesContext();
  const totalFavoritesCount = savedIds.size + savedSuiteIds.size;

  useEffect(() => {
    const parsed = parseFiltersFromSearchParams(searchParams);
    setFilters(parsed);
  }, [searchParams]);

  const updateFilters = (newFilters: SolutionFilters) => {
    setFilters(newFilters);
    const params = serializeFiltersToSearchParams(newFilters);
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

  const filteredSolutions = useMemo(() => {
    const filtered = applySolutionFilters(solutionsData, filters);
    return sortSolutions(filtered, filters.sort);
  }, [solutionsData, filters]);

  const solutionsLoading = solutions.isLoading;
  const suitesLoading = suites.isLoading;

  // Global Empty State (No solutions in DB) — only after load completes
  if (!solutionsLoading && solutionsData.length === 0) {
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
      {solutionsLoading || suitesLoading ? (
        <SidebarSkeleton />
      ) : (
        <FilterSidebar
          filters={filters}
          onChange={updateFilters}
          categories={categories}
          ecosystems={suites.data}
          solutions={solutionsData}
          isMobileOpen={isMobileFiltersOpen}
          onMobileClose={() => setIsMobileFiltersOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {solutionsLoading ? (
          <>
            <HeaderSkeleton />
            <CardGridSkeleton />
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="mb-3">
                  <BrowseToggle />
                </div>
                <h1 className="text-3xl font-bold mb-1">Browse Solutions</h1>
                <p className="text-muted-foreground text-sm">
                  {filteredSolutions.length} automation{filteredSolutions.length !== 1 ? 's' : ''} found
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

            {filteredSolutions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {filteredSolutions.map((solution) => (
                  <SolutionCard key={solution.id} solution={solution} />
                ))}
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
          </>
        )}
      </div>
    </div>
  );
}
