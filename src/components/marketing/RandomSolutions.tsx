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
      {Array.from({ length: 6 }).map((_, i) => (
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
      const res = await fetch("/api/solutions/random?limit=6");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 120_000,
  });

  return (
    <section className="pt-14 md:pt-28">
      <div className="container mx-auto px-4 xl:px-8 max-w-7xl">
        <div className="text-center">
          <p className="text-xs text-ash-500 font-medium uppercase tracking-widest bg-white inline-flex py-1.5 px-3 border border-ash-300 ring-2 ring-ash-100 rounded-lg">
            Featured Solutions
          </p>
          <h2 className="text-2xl text-ash-800 text-balance font-noto font-semibold tracking-tight mt-6 md:text-4xl">
            Pre-built automation systems ready for instant deployment
          </h2>
          <p className="max-w-2xl text-balance mt-2 md:text-lg md:mt-4">
            Skip months of custom development. Explore pre-built, turn-key systems ready to be integrated directly into your business in days.
          </p>
        </div>

        {isPending ? (
          <SolutionsSkeleton />
        ) : solutions.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-6 text-center text-muted-foreground text-sm mt-10">
            <Link
              href="/solutions"
              className="text-primary hover:underline font-medium"
            >
              Browse the solution library →
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-4 mt-10 md:grid-cols-3">
            {solutions.map((solution) => (
              <Link
                key={solution.id}
                href={`/solutions/${solution.id}`}
                className="bg-ash-200 p-1 border border-ash-300 shadow-2xl shadow-ash-200 rounded-3xl"
              >
                <div className="bg-white p-6 rounded-[20px]">
                  <CategoryBadge category={solution.category} size="sm" />
                  <h3 className="text-ash-800 font-noto font-semibold tracking-tight mt-6">
                    {solution.title}
                  </h3>
                  <p className="text-ash-500 line-clamp-2 mt-1">
                    {solution.description}
                  </p>

                  {/* Expert Attribution */}
                  <div className="flex items-center gap-2 mt-6">
                    <div className="size-6 flex items-center justify-center relative overflow-hidden shrink-0 rounded-full">
                      {solution.expert.profileImageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={solution.expert.profileImageUrl}
                          alt={solution.expert.name}
                          loading="lazy"
                          className="size-full absolute inset-0 object-cover"
                        />
                      ) : (
                        (solution.expert.name || "?").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium truncate flex-1">
                      {solution.expert.name}
                    </span>
                    {solution.expert.tier &&
                      solution.expert.tier !== "STANDARD" && (
                        <TierBadge
                          tier={solution.expert.tier}
                          size="sm"
                        />
                      )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 py-2.5 px-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold">
                      €{solution.implementationPrice.toLocaleString()}
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {solution.deliveryDays} days
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold">See more</span>
                    <ArrowRight className="size-4 -rotate-45 mt-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Link
        href="/solutions"
        className="text-sm text-primary flex items-center gap-1 font-medium hover:scale-105 ease-in-out transition-transform"
      >
        <ShimmerButton className="shadow-2xl" shimmerColor="#000000" background="#ffffff" shimmerSize="0.09em">
          <span className="text-sm inline-flex gap-2 leading-none text-black font-medium tracking-tight whitespace-pre-wrap lg:text-sm">Browse all <ArrowRight className="w-3 h-3" /></span>
        </ShimmerButton>
      </Link>
    </section>
  );
}
