import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryBadge } from "@/components/ui/CategoryBadge";

interface SimilarSolution {
  id: string;
  slug: string;
  title: string;
  category: string;
  implementation_price: number;
  short_summary: string;
  outcome: string;
  expertName: string;
}

interface SimilarSolutionsProps {
  solutions: SimilarSolution[];
}

export function SimilarSolutions({ solutions }: SimilarSolutionsProps) {
  if (solutions.length === 0) return null;

  return (
    <section className="py-12 border-t border-border bg-secondary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Recommended for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((solution) => (
            <Link
              key={solution.id}
              href={`/solutions/${solution.slug || solution.id}`}
              className="group block h-full bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-md flex flex-col"
            >
              <div className="mb-3 flex items-start justify-between">
                <CategoryBadge category={solution.category} size="sm" />
                <span className="text-sm font-semibold">
                  &euro;{solution.implementation_price.toLocaleString("de-DE")}
                </span>
              </div>

              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {solution.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                {solution.short_summary || solution.outcome || "A productized automation solution."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center font-bold text-[10px]">
                    {solution.expertName.substring(0, 1).toUpperCase()}
                  </div>
                  {solution.expertName}
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
