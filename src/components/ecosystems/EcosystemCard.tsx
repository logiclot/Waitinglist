import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EcosystemCard({ ecosystem }: { ecosystem: any }) {
  // Calculate total price or just show "Stack"
  const itemCount = ecosystem.items.length;
  
  return (
    <Link href={`/stacks/${ecosystem.slug}`} className="group block h-full">
      <div className="bg-card border border-border rounded-xl overflow-hidden h-full flex flex-col transition-all hover:shadow-md hover:border-primary/50">
        <div className="p-6 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
              Solution Suite
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Layers className="w-3 h-3" /> {itemCount} Solutions
            </span>
          </div>
          
          <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
            {ecosystem.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {ecosystem.description}
          </p>

          <div className="flex -space-x-2 overflow-hidden py-2">
            {/* Preview of included solutions icons/badges if available, or just generic */}
            {ecosystem.items.slice(0, 3).map((item: { solution: { title: string } }, i: number) => (
              <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                {item.solution.title[0]}
              </div>
            ))}
            {itemCount > 3 && (
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                +{itemCount - 3}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-secondary/30 border-t border-border flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground">Solution Suite</span>
          <span className="text-sm font-bold text-primary flex items-center gap-1">
            View Suite <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
