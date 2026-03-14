"use client";

import { useState, useMemo } from "react";
import { Heart, Layers, Grid3X3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SolutionCard } from "@/components/SolutionCard";
import { SuiteCard } from "@/components/ecosystems/SuiteCard";
import { useSavedSuitesContext } from "@/hooks/SavedSuitesContext";
import type { Solution } from "@/types";
import type { SuiteCardData } from "@/types";

interface FavoritesPageClientProps {
  savedSolutions: Solution[];
  allSuites: SuiteCardData[];
}

type ActiveTab = "solutions" | "suites";

export function FavoritesPageClient({
  savedSolutions,
  allSuites,
}: FavoritesPageClientProps) {
  const { savedIds: savedSuiteIds } = useSavedSuitesContext();
  const [activeTab, setActiveTab] = useState<ActiveTab>("solutions");

  // Filter suites to only saved ones
  const savedSuites = useMemo(
    () => allSuites.filter((eco) => savedSuiteIds.has(eco.id)),
    [allSuites, savedSuiteIds]
  );

  const solutionCount = savedSolutions.length;
  const suiteCount = savedSuites.length;
  const totalCount = solutionCount + suiteCount;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-500 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Favorites</h1>
              <p className="text-muted-foreground text-sm">
                {totalCount} saved item{totalCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/solutions"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-foreground/30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Solutions
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit mb-8">
        <button
          onClick={() => setActiveTab("solutions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "solutions"
              ? "bg-card shadow-sm border border-border text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Grid3X3 className="h-4 w-4" />
          Solutions
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === "solutions"
                ? "bg-red-100 text-red-700"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {solutionCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("suites")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "suites"
              ? "bg-card shadow-sm border border-border text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          Suites
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === "suites"
                ? "bg-red-100 text-red-700"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {suiteCount}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "solutions" && (
        <div>
          {solutionCount > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {savedSolutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="solutions"

              browseHref="/solutions"
            />
          )}
        </div>
      )}

      {activeTab === "suites" && (
        <div>
          {suiteCount > 0 ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {savedSuites.map((eco) => (
                <SuiteCard key={eco.id} ecosystem={eco} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="suites"

              browseHref="/stacks"
            />
          )}
        </div>
      )}
    </div>
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
