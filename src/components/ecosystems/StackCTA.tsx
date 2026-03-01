"use client";

import Link from "next/link";
import { MessageSquare, PlayCircle } from "lucide-react";

interface StackEcosystem {
  id: string;
  expertId: string;
  items: Array<{ solution: { implementationPriceCents?: number | null } }>;
}

export function StackCTA({ ecosystem }: { ecosystem: StackEcosystem }) {
  const totalPrice = ecosystem.items.reduce((sum: number, item: { solution: { implementationPriceCents?: number | null } }) => sum + (item.solution.implementationPriceCents || 0), 0);
  
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">Total Suite Value</p>
        <div className="text-3xl font-bold text-foreground">${(totalPrice / 100).toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Includes {ecosystem.items.length} solutions in this suite.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href={`/messages/new?expert=${ecosystem.expertId}&type=demo&stack=${ecosystem.id}`}
          className="block w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-bold text-lg transition-colors shadow-md shadow-primary/20 flex items-center justify-center gap-2"
        >
          <PlayCircle className="w-5 h-5" /> Request Suite Demo
        </Link>
        <p className="text-[10px] text-muted-foreground text-center px-2">
          Demo happens in the expert’s environment before any access is granted.
        </p>

        <Link
          href={`/messages/new?expert=${ecosystem.expertId}&stack=${ecosystem.id}`}
          className="block w-full text-center border border-border bg-background hover:bg-secondary/50 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 text-foreground"
        >
          <MessageSquare className="w-4 h-4" /> Ask a question
        </Link>
      </div>

      <div className="pt-6 mt-6 border-t border-border text-center">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Or buy individually</p>
        <p className="text-xs text-muted-foreground">
          Scroll down to purchase specific solutions from this suite.
        </p>
      </div>
    </div>
  );
}
