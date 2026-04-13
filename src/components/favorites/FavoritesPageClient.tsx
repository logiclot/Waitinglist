"use client";

import { SolutionCard } from "@/components/SolutionCard";
import { SuiteCard } from "@/components/ecosystems/SuiteCard";
import { CardSkeleton } from "@/components/favorites/FavoritesSkeleton";
import { useFavouriteSuites, useFavouriteSolutions } from "@/hooks/use-favourties";
import { Grid3X3, Heart, Layers } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ActiveTab = "solutions" | "suites";

export function FavoritesPageClient() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("solutions");
  const savedSolutions = useFavouriteSolutions()
  const savedSuites = useFavouriteSuites()

  const solutionCount = savedSolutions.data?.length ?? 0;
  const suiteCount = savedSuites.data?.length ?? 0;
  const isLoading = savedSolutions.isPending || savedSuites.isPending;
  const totalCount = solutionCount + suiteCount;

  return (
    <>
      {/* Count subtitle */}
      <p className="text-muted-foreground text-sm -mt-6 mb-8">
        {isLoading ? "Loading saved items..." : `${totalCount} saved item${totalCount !== 1 ? "s" : ""}`}
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit mb-8">
        <button
          onClick={() => setActiveTab("solutions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "solutions"
            ? "bg-card shadow-sm border border-border text-foreground"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <Grid3X3 className="h-4 w-4" />
          Solutions
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === "solutions"
              ? "bg-red-100 text-red-700"
              : "bg-secondary text-muted-foreground"
              }`}
          >
            {savedSolutions.isPending ? "…" : solutionCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("suites")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "suites"
            ? "bg-card shadow-sm border border-border text-foreground"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <Layers className="h-4 w-4" />
          Suites
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === "suites"
              ? "bg-red-100 text-red-700"
              : "bg-secondary text-muted-foreground"
              }`}
          >
            {savedSuites.isPending ? "…" : suiteCount}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "solutions" && (
        <div>
          {savedSolutions.isPending ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : solutionCount > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {savedSolutions.data?.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          ) : (
            <EmptyState type="solutions" browseHref="/solutions" />
          )}
        </div>
      )}

      {activeTab === "suites" && (
        <div>
          {savedSuites.isPending ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : suiteCount > 0 ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {savedSuites.data?.map((eco) => (
                <SuiteCard key={eco.id} ecosystem={eco} />
              ))}
            </div>
          ) : (
            <EmptyState type="suites" browseHref="/stacks" />
          )}
        </div>
      )}
    </>
  );
}

function EmptyState({
  type,
  browseHref,
}: {
  type: "solutions" | "suites";
  browseHref: string;
}) {
  const isSolutions = type === "solutions";
  return (
    <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
      <div className="mx-auto h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <Heart className="h-6 w-6 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        No favorite {isSolutions ? "solutions" : "suites"} yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {isSolutions
          ? "Click the heart icon on solutions you like to save them here."
          : "Click the heart icon on suites you like to save them here."}
      </p>
      <Link
        href={browseHref}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors inline-block"
      >
        Browse {isSolutions ? "solutions" : "suites"}
      </Link>
    </div>
  );
}
