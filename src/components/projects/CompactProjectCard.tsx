"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CompactProjectCardProps {
  /** The compact summary bar — always visible, clickable to toggle details */
  summary: ReactNode;
  /** The full detail content — shown only when expanded */
  children: ReactNode;
}

export function CompactProjectCard({ summary, children }: CompactProjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left hover:bg-secondary/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <div className="flex items-center p-5 gap-4">
          <div className="flex-1 min-w-0">{summary}</div>
          <div className="shrink-0">
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
