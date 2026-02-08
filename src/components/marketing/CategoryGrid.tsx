import Link from "next/link";
import { categories } from "@/data/mock";

export function CategoryGrid() {
  return (
    <section className="py-24 bg-card/30 border-b border-border" id="categories">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground">Explore by Category</h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <Link 
              key={category.slug} 
              href={`/solutions?category=${category.slug}`}
              className="px-5 py-2.5 rounded-full border border-border bg-background hover:bg-secondary hover:border-secondary-foreground/20 transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
