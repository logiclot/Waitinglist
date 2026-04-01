import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/mock";
import { BRAND_NAME } from "@/lib/branding";

export const metadata = {
  title: `Categories | ${BRAND_NAME}`,
  description: "Browse AI automation solutions by category.",
};

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Browse Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg flex flex-col"
          >
            <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
              {category.name}
            </h2>
            <p className="text-muted-foreground mb-8 flex-grow">
              {category.description}
            </p>
            <div className="flex items-center text-sm font-medium text-primary mt-auto group-hover:translate-x-1 transition-transform">
              Browse Solutions <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
