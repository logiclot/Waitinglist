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
    (filters.deliveryMinDays !== null || filters.deliveryMaxDays !== null ? 1 : 0) +
    filters.businessGoals.length +
    filters.tools.length +
    (filters.expertTier ? 1 : 0) +
    (filters.paybackPeriod ? 1 : 0);

  if (activeCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
      
      {filters.category && (
        <Chip label={`Category: ${filters.category}`} onRemove={() => onRemove("category", null)} />
      )}
      
      {(filters.minPrice || filters.maxPrice) && (
        <Chip 
          label={`Price: ${filters.minPrice ? `€${filters.minPrice}` : '0'} - ${filters.maxPrice ? `€${filters.maxPrice}` : 'Any'}`} 
          onRemove={() => { onRemove("minPrice", null); onRemove("maxPrice", null); }} 
        />
      )}

      {(filters.deliveryMinDays !== null || filters.deliveryMaxDays !== null) && (
        <Chip
          label={`Delivery: ${filters.deliveryMinDays ? `${filters.deliveryMinDays}` : '0'}–${filters.deliveryMaxDays ? `${filters.deliveryMaxDays}` : '∞'} days`}
          onRemove={() => { onRemove("deliveryMinDays", null); onRemove("deliveryMaxDays", null); }}
        />
      )}

      {filters.businessGoals.map(g => (
        <Chip key={g} label={g} onRemove={() => onRemove("businessGoals", g)} />
      ))}

      {filters.tools.map(t => (
        <Chip key={t} label={t} onRemove={() => onRemove("tools", t)} />
      ))}

      {filters.expertTier && (
        <Chip label={`Tier: ${filters.expertTier}`} onRemove={() => onRemove("expertTier", null)} />
      )}

      {filters.paybackPeriod && (
        <Chip label={`ROI: ${filters.paybackPeriod}`} onRemove={() => onRemove("paybackPeriod", null)} />
      )}

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
