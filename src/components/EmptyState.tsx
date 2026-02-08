import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export function EmptyState({
  title,
  description,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-card border border-border rounded-xl">
      <h2 className="text-2xl font-bold mb-2 text-foreground">{title}</h2>
      <p className="text-muted-foreground mb-8 max-w-md">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {primaryCtaLabel && primaryCtaHref && (
          <Link 
            href={primaryCtaHref}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center"
          >
            {primaryCtaLabel} <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        
        {secondaryCtaLabel && secondaryCtaHref && (
          <Link 
            href={secondaryCtaHref}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors justify-center"
          >
            {secondaryCtaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
