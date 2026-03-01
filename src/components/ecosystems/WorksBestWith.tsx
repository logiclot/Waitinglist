import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface EcosystemItem {
  id: string;
  solution: { slug: string; title: string; implementationPriceCents: number };
}

interface WorksBestEcosystem {
  id: string;
  title: string;
  slug: string;
  shortPitch: string;
  items: EcosystemItem[];
}

export function WorksBestWith({ ecosystems }: { ecosystems: WorksBestEcosystem[] }) {
  if (!ecosystems || ecosystems.length === 0) {
    return (
      <div className="bg-secondary/20 border border-border rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No recommended suite yet — this solution works great as a standalone.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ecosystems.map((eco) => (
        <div key={eco.id} className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                Part of a Suite
              </span>
              <h3 className="font-bold text-lg">{eco.title}</h3>
            </div>
            <Link href={`/stacks/${eco.slug}`} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              View Suite <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">{eco.shortPitch}</p>
          
          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Also in this suite:</p>
            {eco.items.slice(0, 3).map((item: EcosystemItem) => (
              <Link 
                key={item.id} 
                href={`/solutions/${item.solution.slug}`}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors group"
              >
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{item.solution.title}</span>
                <span className="text-xs text-muted-foreground">${(item.solution.implementationPriceCents / 100).toLocaleString()}</span>
              </Link>
            ))}
            {eco.items.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{eco.items.length - 3} more solutions
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
