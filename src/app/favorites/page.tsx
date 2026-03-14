import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSavedSolutionsFull } from "@/actions/saved";
import { getPublishedEcosystemsFull } from "@/actions/ecosystems";
import { FavoritesPageClient } from "@/components/favorites/FavoritesPageClient";
import { BRAND_NAME } from "@/lib/branding";
import type { Solution, SuiteCardData } from "@/types";

export const metadata = {
  title: `Favorites | ${BRAND_NAME}`,
  description: "View your saved solutions and suites.",
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/favorites");
  }

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
