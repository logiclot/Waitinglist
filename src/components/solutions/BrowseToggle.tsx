"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3X3, Layers } from "lucide-react";

export function BrowseToggle() {
  const pathname = usePathname();
  const isOnSuites = pathname.startsWith("/stacks");

  const activeClass =
    "bg-card shadow-sm text-foreground border border-border";
  const inactiveClass =
    "text-muted-foreground hover:text-foreground";

  return (
    <div className="inline-flex items-center bg-secondary/50 border border-border rounded-lg p-1">
      <Link
        href="/solutions"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          !isOnSuites ? activeClass : inactiveClass
        }`}
      >
        <Grid3X3 className="w-4 h-4" />
        Solutions
      </Link>
      <Link
        href="/stacks"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          isOnSuites ? activeClass : inactiveClass
        }`}
      >
        <Layers className="w-4 h-4" />
        Suites
      </Link>
    </div>
  );
}
