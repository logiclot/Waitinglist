"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Solution } from "@/types";
import { SolutionCard } from "@/components/SolutionCard";

interface SmartEmptyStateProps {
  relatedSolutions: Solution[];
}

export function SmartEmptyState({
  relatedSolutions,
}: SmartEmptyStateProps) {
  // Scenario 2: Related solutions found — show as recommendations
  if (relatedSolutions.length > 0) {
    return (
      <div className="space-y-8">
        {/* Recommendation header */}
        <div>
          <h3 className="text-xl font-bold mb-1">Worth exploring</h3>
          <p className="text-muted-foreground text-sm">
            These solutions could help with what you&apos;re looking for
          </p>
        </div>

        {/* Solution cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedSolutions.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>

        {/* Discovery Scan upsell banner */}
        <div className="p-6 rounded-2xl bg-[#111827] flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/70 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Not sure where to start?
              </h4>
              <p className="text-xs text-white/50">
                Tell us what you need and get expert proposals within 48h.
              </p>
            </div>
          </div>
          <Link
            href="/jobs/discovery"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors shrink-0"
          >
            Discovery Scan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Browse all link */}
        <div className="text-center">
          <Link
            href="/solutions"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse all solutions
          </Link>
        </div>
      </div>
    );
  }

  // Scenario 3: Nothing close — frame Discovery Scan as the premium path
  return (
    <div className="text-center py-16 border border-border rounded-2xl bg-card">
      <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>

      <h3 className="text-xl font-bold mb-3">
        The best way to solve this? A custom project.
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-8 px-4">
        For something this specific, a tailored solution gets the best results.
        Our experts will send you proposals within 48h.
      </p>

      <Link
        href="/jobs/discovery"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
      >
        Get Expert Proposals <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="mt-6">
        <Link
          href="/solutions"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Or browse all solutions
        </Link>
      </div>
    </div>
  );
}
