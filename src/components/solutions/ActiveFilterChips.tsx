"use client";

import { X } from "lucide-react";
import { SolutionFilters } from "@/lib/solutions/filters";

interface ActiveFilterChipsProps {
  filters: SolutionFilters;
  onRemove: (key: keyof SolutionFilters, value?: string | number | null) => void;
  onClear: () => void;
}

export function ActiveFilterChips({ filters, onRemove, onClear }: ActiveFilterChipsProps) {
  const activeCount = 
    (filters.category ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.maintenance !== "any" ? 1 : 0) +
    (filters.deliveryMaxDays ? 1 : 0) +
    filters.businessGoals.length +
    filters.tools.length +
    (filters.complexity ? 1 : 0) +
    (filters.expertTier ? 1 : 0) +
    (filters.paybackPeriod ? 1 : 0) +
    filters.industries.length +
    filters.trustSignals.length;

  if (activeCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
      
      {filters.category && (
        <Chip label={`Category: ${filters.category}`} onRemove={() => onRemove("category", null)} />
      )}
      
      {(filters.minPrice || filters.maxPrice) && (
        <Chip 
          label={`Price: ${filters.minPrice ? `$${filters.minPrice}` : '0'} - ${filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}`} 
          onRemove={() => { onRemove("minPrice", null); onRemove("maxPrice", null); }} 
        />
      )}

      {filters.maintenance !== "any" && (
        <Chip 
          label={
            filters.maintenance === "available" && (filters.minMaintenancePrice || filters.maxMaintenancePrice)
              ? `Maint: $${filters.minMaintenancePrice || 0} - ${filters.maxMaintenancePrice || 'Any'}/mo`
              : `Maintenance: ${filters.maintenance}`
          } 
          onRemove={() => {
            onRemove("maintenance", "any");
            onRemove("minMaintenancePrice", null);
            onRemove("maxMaintenancePrice", null);
          }} 
        />
      )}

      {filters.deliveryMaxDays && (
        <Chip label={`Delivery: < ${filters.deliveryMaxDays} days`} onRemove={() => onRemove("deliveryMaxDays", null)} />
      )}

      {filters.businessGoals.map(g => (
        <Chip key={g} label={g} onRemove={() => onRemove("businessGoals", g)} />
      ))}

      {filters.tools.map(t => (
        <Chip key={t} label={t} onRemove={() => onRemove("tools", t)} />
      ))}

      {filters.complexity && (
        <Chip label={`Complexity: ${filters.complexity}`} onRemove={() => onRemove("complexity", null)} />
      )}

      {filters.expertTier && (
        <Chip label={`Tier: ${filters.expertTier}`} onRemove={() => onRemove("expertTier", null)} />
      )}

      {filters.paybackPeriod && (
        <Chip label={`ROI: ${filters.paybackPeriod}`} onRemove={() => onRemove("paybackPeriod", null)} />
      )}

      {filters.industries.map(i => (
        <Chip key={i} label={i} onRemove={() => onRemove("industries", i)} />
      ))}

      {filters.trustSignals.map(t => (
        <Chip key={t} label={t} onRemove={() => onRemove("trustSignals", t)} />
      ))}

      <button 
        onClick={onClear}
        className="text-xs text-primary font-medium hover:underline ml-2"
      >
        Clear all
      </button>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
      {label}
      <button onClick={onRemove} className="hover:text-foreground text-muted-foreground">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
