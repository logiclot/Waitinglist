import Link from "next/link";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { SolutionCard } from "@/components/SolutionCard";
import { solutions } from "@/data/mock";

export function FeaturedSolutions() {
  // Use the first 4 solutions from mock data as featured
  const featuredSolutions = solutions.slice(0, 4);

  return (
    <section className="py-24 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Ready-Made Solutions</h2>
            <p className="text-muted-foreground text-lg">Popular automations you can deploy this week</p>
          </div>
          <Link href="/solutions" className="hidden md:flex items-center text-primary hover:text-primary/80 transition-colors font-medium text-sm">
            View all solutions <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredSolutions.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>

        {/* Custom / Discovery Catch-all */}
        <div className="w-full p-8 md:p-10 rounded-xl border border-border bg-card/50 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative overflow-hidden group hover:border-primary/30 transition-all">
           <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           
           <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
                 <Crown className="h-7 w-7" />
              </div>
              <div>
                 <h3 className="text-xl font-bold mb-2 text-foreground tracking-tight">Custom / Discovery Required?</h3>
                 <p className="text-muted-foreground max-w-xl">
                    Didn&apos;t find a match? Describe your business needs. Our Elite-tier experts will provide custom architectural bids.
                 </p>
              </div>
           </div>
           <Link 
              href="/jobs/discovery"
              className="relative z-10 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap text-sm"
            >
              <Sparkles className="h-4 w-4" /> Launch Discovery Scan
            </Link>
        </div>
      </div>
    </section>
  );
}
