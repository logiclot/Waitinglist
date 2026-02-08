import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, solutions } from "@/data/mock";
import { SolutionCard } from "@/components/SolutionCard";
import { ArrowLeft } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateMetadata({ params }: PageProps) {
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} Solutions | ${BRAND_NAME}`,
    description: category.description,
  };
}

export default function CategoryPage({ params }: PageProps) {
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  // Filter solutions by category name match
  const categorySolutions = solutions.filter(
    (s) => s.category === category.name
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-4">
          <ArrowLeft className="mr-1 h-3 w-3" /> Back to categories
        </Link>
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          {category.description}
        </p>
      </div>

      {categorySolutions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categorySolutions.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/10 rounded-xl border border-border">
          <h3 className="text-xl font-semibold mb-2">No solutions found</h3>
          <p className="text-muted-foreground">
            We currently don&apos;t have any listed solutions for this category.
            <br />
            Check back soon or browse other categories.
          </p>
          <Link
            href="/categories"
            className="inline-block mt-6 px-6 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            Browse all categories
          </Link>
        </div>
      )}
    </div>
  );
}
