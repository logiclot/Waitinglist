import { Solution } from "@/types";

export interface SolutionFilters {
  query: string;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  maintenance: "any" | "none" | "available"; // none = 0/null, available = >0
  minMaintenancePrice: number | null;
  maxMaintenancePrice: number | null;
  deliveryMaxDays: number | null;
  businessGoals: string[];
  tools: string[];
  complexity: string | null;
  expertTier: string | null;
  paybackPeriod: string | null;
  industries: string[];
  trustSignals: string[];
  sort: string;
}

export const INITIAL_FILTERS: SolutionFilters = {
  query: "",
  category: null,
  minPrice: null,
  maxPrice: null,
  maintenance: "any",
  minMaintenancePrice: null,
  maxMaintenancePrice: null,
  deliveryMaxDays: null,
  businessGoals: [],
  tools: [],
  complexity: null,
  expertTier: null,
  paybackPeriod: null,
  industries: [],
  trustSignals: [],
  sort: "recommended"
};

export function parseFiltersFromSearchParams(searchParams: URLSearchParams): SolutionFilters {
  const getAll = (key: string) => {
    const val = searchParams.get(key);
    return val ? val.split(",") : [];
  };

  return {
    query: searchParams.get("q") || "",
    category: searchParams.get("category"),
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
    maintenance: (searchParams.get("maintenance") as "any" | "none" | "available") || "any",
    minMaintenancePrice: searchParams.get("minMaintenancePrice") ? Number(searchParams.get("minMaintenancePrice")) : null,
    maxMaintenancePrice: searchParams.get("maxMaintenancePrice") ? Number(searchParams.get("maxMaintenancePrice")) : null,
    deliveryMaxDays: searchParams.get("deliveryMaxDays") ? Number(searchParams.get("deliveryMaxDays")) : null,
    businessGoals: getAll("goals"),
    tools: getAll("tools"),
    complexity: searchParams.get("complexity"),
    expertTier: searchParams.get("tier"),
    paybackPeriod: searchParams.get("payback"),
    industries: getAll("industries"),
    trustSignals: getAll("trust"),
    sort: searchParams.get("sort") || "recommended"
  };
}

export function serializeFiltersToSearchParams(filters: SolutionFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
  if (filters.maintenance !== "any") params.set("maintenance", filters.maintenance);
  if (filters.minMaintenancePrice) params.set("minMaintenancePrice", filters.minMaintenancePrice.toString());
  if (filters.maxMaintenancePrice) params.set("maxMaintenancePrice", filters.maxMaintenancePrice.toString());
  if (filters.deliveryMaxDays) params.set("deliveryMaxDays", filters.deliveryMaxDays.toString());
  
  if (filters.businessGoals.length > 0) params.set("goals", filters.businessGoals.join(","));
  if (filters.tools.length > 0) params.set("tools", filters.tools.join(","));
  if (filters.complexity) params.set("complexity", filters.complexity);
  if (filters.expertTier) params.set("tier", filters.expertTier);
  if (filters.paybackPeriod) params.set("payback", filters.paybackPeriod);
  if (filters.industries.length > 0) params.set("industries", filters.industries.join(","));
  if (filters.trustSignals.length > 0) params.set("trust", filters.trustSignals.join(","));
  
  if (filters.sort !== "recommended") params.set("sort", filters.sort);

  return params;
}

export function applySolutionFilters(solutions: Solution[], filters: SolutionFilters): Solution[] {
  return solutions.filter(s => {
    // 1. Text Search
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matches = 
        s.title.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        (s.short_summary?.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // 2. Category
    if (filters.category && s.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-").replace(/[^\w-]+/g, "") !== filters.category) {
      // Note: Comparing slug to name is tricky if we don't have the map. 
      // Ideally we filter by slug if s.category is a slug, but mock data has "Sales Automations" (Name).
      // We'll try loose matching or rely on the category slug being passed correctly.
      // Let's assume s.category is the Display Name.
      // We should probably normalize s.category to slug for comparison.
      const sSlug = s.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-").replace(/[^\w-]+/g, "");
      if (sSlug !== filters.category) return false;
    }

    // 3. Price (One-time)
    // s.implementation_price is usually in dollars (mock) or derived from cents.
    // Let's use implementation_price (number).
    if (filters.minPrice !== null && s.implementation_price < filters.minPrice) return false;
    if (filters.maxPrice !== null && s.implementation_price > filters.maxPrice) return false;

    // 4. Maintenance
    // s.maintenancePriceCents
    const maintPrice = (s.maintenancePriceCents || 0) / 100;
    if (filters.maintenance === "none" && maintPrice > 0) return false;
    if (filters.maintenance === "available" && maintPrice === 0) return false;
    
    if (filters.minMaintenancePrice !== null && maintPrice < filters.minMaintenancePrice) return false;
    if (filters.maxMaintenancePrice !== null && maintPrice > filters.maxMaintenancePrice) return false;

    // 5. Delivery Time
    // s.delivery_days
    if (filters.deliveryMaxDays !== null && s.delivery_days > filters.deliveryMaxDays) return false;

    // 6. Business Goals (Multi-select OR logic usually, or AND? Let's do OR for coverage)
    if (filters.businessGoals.length > 0) {
      if (!s.businessGoals || !s.businessGoals.some(g => filters.businessGoals.includes(g))) return false;
    }

    // 7. Tools (Multi-select OR logic)
    if (filters.tools.length > 0) {
      // s.integrations
      if (!s.integrations.some(t => filters.tools.includes(t))) return false;
    }

    // 8. Complexity (Single select)
    if (filters.complexity && s.complexity !== filters.complexity) return false;

    // 9. Expert Tier
    if (filters.expertTier && s.expertTier !== filters.expertTier) return false;

    // 10. Payback
    if (filters.paybackPeriod && s.paybackPeriod !== filters.paybackPeriod) return false;

    // 11. Industries (Multi-select OR)
    if (filters.industries.length > 0) {
      if (!s.industries || !s.industries.some(i => filters.industries.includes(i))) return false;
    }

    // 12. Trust Signals (Checkboxes usually AND logic for constraints)
    // "NDA included" means the solution MUST have it.
    if (filters.trustSignals.length > 0) {
       // Check explicit trustSignals list AND boolean flags
       const hasSignal = (sig: string) => {
         if (s.trustSignals?.includes(sig)) return true;
         if (sig === "NDA included" && s.requires_nda) return true;
         // Add other mappings if needed
         return false;
       };
       
       // If ANY filter selected isn't present, return false (AND logic)
       if (!filters.trustSignals.every(hasSignal)) return false;
    }

    return true;
  });
}

export function sortSolutions(solutions: Solution[], sortOption: string): Solution[] {
  const sorted = [...solutions];
  switch (sortOption) {
    case "price_asc":
      return sorted.sort((a, b) => a.implementation_price - b.implementation_price);
    case "price_desc":
      return sorted.sort((a, b) => b.implementation_price - a.implementation_price);
    case "delivery_fast":
      return sorted.sort((a, b) => a.delivery_days - b.delivery_days);
    case "roi_high":
      return sorted.sort((a, b) => (b.avg_roi || 0) - (a.avg_roi || 0));
    case "recommended":
    default:
      // Assuming default order is "recommended"
      return sorted;
  }
}
