"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleProjectCardProps {
  /** Content always visible (the header row) */
  header: ReactNode;
  /** Content hidden when collapsed */
  children: ReactNode;
  /** Start collapsed? */
  defaultCollapsed?: boolean;
}

export function CollapsibleProjectCard({
  header,
  children,
  defaultCollapsed = false,
}: CollapsibleProjectCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Clickable header */}
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="w-full text-left"
      >
        <div className="relative">
          {header}
          {/* Toggle indicator */}
          <div className="absolute top-4 right-4 p-1.5 rounded-md bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors">
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </button>

      {/* Collapsible body */}
      {!collapsed && children}
    </div>
  );
}
