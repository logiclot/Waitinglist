import Link from "next/link";
import { ArrowRight, Sparkles, Crown } from "lucide-react";
import { SolutionCard } from "@/components/SolutionCard";
import { solutions } from "@/data/mock";
import { DISCOVERY_SCAN_COPY, CUSTOM_PROJECT_COPY } from "@/lib/copy/requestCards";

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

        {/* Two-path CTA for visitors who didn't find a match */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-7 rounded-2xl bg-[#111827] flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Not sure where to start?</p>
                <h3 className="text-base font-bold text-white">Post a Discovery Scan</h3>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              {DISCOVERY_SCAN_COPY.shortDescription}
            </p>
            <Link
              href="/jobs/discovery"
              className="mt-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-7 rounded-2xl bg-[#111827] flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                <Crown className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Know exactly what you need?</p>
                <h3 className="text-base font-bold text-white">Post a Custom Project</h3>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              {CUSTOM_PROJECT_COPY.shortDescription}
            </p>
            <Link
              href="/jobs/new"
              className="mt-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-white text-sm font-bold hover:bg-white/8 transition-colors"
            >
              Post a Project <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
