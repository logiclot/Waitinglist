import Link from "next/link";
import { categories } from "@/data/mock";

export function CategoryGrid() {
  return (
    <section className="py-8 bg-[#FBFAF8] border-b border-border" id="categories">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">Browse by category</p>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/solutions?category=${category.slug}`}
              className="px-4 py-2 rounded-full border border-border bg-white hover:bg-foreground hover:text-background hover:border-foreground transition-all text-sm font-medium text-muted-foreground"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
