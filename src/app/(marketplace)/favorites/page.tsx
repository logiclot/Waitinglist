import { FavoritesPageClient } from "@/components/favorites/FavoritesPageClient";
import { BRAND_NAME } from "@/lib/branding";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";


export const metadata = {
  title: `Favorites | ${BRAND_NAME}`,
  description: "View your saved solutions and suites.",
};

export default async function FavoritesPage() {
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

      <FavoritesPageClient />
    </div>
  );
}
