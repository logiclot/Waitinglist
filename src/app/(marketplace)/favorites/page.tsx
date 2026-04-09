import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSavedSolutionsFull } from "@/actions/saved";
import { getPublishedEcosystemsFull } from "@/actions/ecosystems";
import { FavoritesPageClient } from "@/components/favorites/FavoritesPageClient";
import { FavoritesSkeleton } from "@/components/favorites/FavoritesSkeleton";
import { BRAND_NAME } from "@/lib/branding";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Solution, SuiteCardData } from "@/types";

export const metadata = {
  title: `Favorites | ${BRAND_NAME}`,
  description: "View your saved solutions and suites.",
};

async function FavoritesContent() {
  const [savedSolutions, allSuites] = await Promise.all([
    getSavedSolutionsFull(),
    getPublishedEcosystemsFull(),
  ]);

  return (
    <FavoritesPageClient
      savedSolutions={savedSolutions as unknown as Solution[]}
      allSuites={allSuites as unknown as SuiteCardData[]}
    />
  );
}

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/favorites");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Static Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-500 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Favorites</h1>
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

      {/* Dynamic Content with Suspense */}
      <Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesContent />
      </Suspense>
    </div>
  );
}
