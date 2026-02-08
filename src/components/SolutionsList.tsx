"use client";

import { Solution, Category } from "@/types";
import { SolutionCard } from "@/components/SolutionCard";
import { Search, Filter, X, ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

interface SolutionsListProps {
  solutions: Solution[];
  categories: Category[];
}

export function SolutionsList({ solutions, categories }: SolutionsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current filters from URL
  const selectedCategory = searchParams.get("category");
  const searchQuery = searchParams.get("q") || "";
  const sortOption = searchParams.get("sort") || "recommended";

  // Create a new URLSearchParams object for updates
  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const updateFilter = (name: string, value: string | null) => {
    router.push(pathname + "?" + createQueryString(name, value));
  };

  // Filter and Sort Logic
  const filteredSolutions = useMemo(() => {
    const result = solutions.filter((solution) => {
      const matchesCategory = selectedCategory ? solution.category === categories.find(c => c.slug === selectedCategory)?.name : true;
      const matchesSearch = solution.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            solution.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sorting
    if (sortOption === "price_asc") {
      result.sort((a, b) => a.implementation_price - b.implementation_price);
    } else if (sortOption === "price_desc") {
      result.sort((a, b) => b.implementation_price - a.implementation_price);
    } else if (sortOption === "delivery_fast") {
      result.sort((a, b) => a.delivery_days - b.delivery_days);
    }
    // "recommended" uses default order

    return result;
  }, [solutions, selectedCategory, searchQuery, sortOption, categories]);

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </h3>
            {(selectedCategory || searchQuery) && (
              <button 
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search solutions..."
                  className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => updateFilter("q", e.target.value || null)}
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter("category", null)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    !selectedCategory
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => updateFilter("category", category.slug)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.slug
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Browse Solutions</h1>
            <p className="text-muted-foreground text-sm">
              {filteredSolutions.length} automation{filteredSolutions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
            <div className="relative">
              <select
                className="appearance-none bg-card border border-border text-foreground text-sm rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                value={sortOption}
                onChange={(e) => updateFilter("sort", e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="delivery_fast">Delivery Speed</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {filteredSolutions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSolutions.map((solution) => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No solutions found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <button 
              onClick={clearFilters}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
