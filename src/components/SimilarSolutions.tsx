"use client";

import Link from "next/link";
import { solutions } from "@/data/mock";
import { ArrowRight, Search } from "lucide-react";

interface SimilarSolutionsProps {
  currentSlug: string;
  category: string;
}

export function SimilarSolutions({ currentSlug, category }: SimilarSolutionsProps) {
  // Mock logic: find up to 3 other solutions in the same category
  const similar = solutions
    .filter((s) => s.slug !== currentSlug && s.category === category && s.status === 'published')
    .slice(0, 3);

  if (similar.length === 0) {
    return (
      <section className="py-12 border-t border-border bg-secondary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Recommended for you</h2>
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl bg-card/50">
            <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">More solutions coming soon</h3>
            <p className="text-muted-foreground max-w-sm text-center">
              We&apos;re constantly adding new automation solutions. Check back later or post a request.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 border-t border-border bg-secondary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Recommended for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similar.map((solution) => (
            <Link 
              key={solution.id} 
              href={`/solutions/${solution.id}`}
              className="group block h-full bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-md flex flex-col"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">{solution.category}</span>
                <span className="text-sm font-semibold">${solution.implementation_price.toLocaleString()}</span>
              </div>
              
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {solution.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                {solution.short_summary || solution.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center font-bold">
                    {solution.expert?.name.substring(0, 1)}
                  </div>
                  {solution.expert?.name}
                </div>
                <div className="text-xs font-medium text-primary flex items-center">
                  View <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
