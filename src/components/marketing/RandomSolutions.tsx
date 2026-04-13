"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Zap, Clock, ArrowRight } from "lucide-react";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { TierBadge } from "@/components/ui/TierBadge";
import { SpecialistTier } from "@prisma/client";
import { ShimmerButton } from "../ui/shimmer-button";

interface Solution {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  implementationPrice: number;
  deliveryDays: number;
  expert: {
    name: string;
    profileImageUrl: string | null;
    tier: SpecialistTier;
  };
}

function SolutionsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-border rounded-xl p-5 space-y-3"
        >
          <div className="h-5 w-20 rounded bg-muted animate-pulse" />
          <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
          </div>
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RandomSolutions() {
  const { data: solutions = [], isPending } = useQuery<Solution[]>({
    queryKey: ["random-solutions"],
    queryFn: async () => {
      const res = await fetch("/api/solutions/random");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 120_000,
  });

  return (
    <section className="py-14 md:py-20 bg-[#FBFAF8] border-b border-border">
      <div className="container mx-auto px-4 xl:px-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-2">
              Featured Solutions
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Ready to deploy
            </h2>
          </div>
          <Link
            href="/solutions"
            className="text-sm text-primary flex items-center gap-1 font-medium hover:scale-105 ease-in-out transition-transform"
          >
            <ShimmerButton className="shadow-2xl" shimmerColor="#000000" background="#ffffff" shimmerSize="0.09em">
              <span className="text-sm inline-flex gap-2 leading-none text-black font-medium tracking-tight whitespace-pre-wrap lg:text-sm">Browse all <ArrowRight className="w-3 h-3" /></span>
            </ShimmerButton>
          </Link>
        </div>

        {isPending ? (
          <SolutionsSkeleton />
        ) : solutions.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
            <Link
              href="/solutions"
              className="text-primary hover:underline font-medium"
            >
              Browse the solution library →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {solutions.map((solution) => (
              <Link
                key={solution.id}
                href={`/solutions/${solution.id}`}
                className="block bg-white border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer"
              >
                <div className="mb-3">
                  <CategoryBadge category={solution.category} size="sm" />
                </div>
                <h3 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                  {solution.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {solution.description}
                </p>

                {/* Expert Attribution */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 border border-primary/15 overflow-hidden relative">
                    {solution.expert.profileImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={solution.expert.profileImageUrl}
                        alt={solution.expert.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      (solution.expert.name || "?").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground truncate flex-1">
                    {solution.expert.name}
                  </span>
                  {solution.expert.tier &&
                    solution.expert.tier !== "STANDARD" && (
                      <TierBadge
                        tier={solution.expert.tier}
                        isFoundingExpert={solution.expert.tier === "FOUNDING"}
                        size="sm"
                      />
                    )}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                  <span className="font-bold">
                    €{solution.implementationPrice.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {solution.deliveryDays} days
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
