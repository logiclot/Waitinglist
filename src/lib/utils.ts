import { Category } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toCapitalized(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export /** Derive category list from actual published solutions (always in sync) */
  function deriveCategoriesFromSolutions(
    solutions: { category: string }[],
  ): Category[] {
  const seen = new Set<string>();
  const cats: Category[] = [];
  for (const s of solutions) {
    if (!s.category || seen.has(s.category)) continue;
    seen.add(s.category);
    cats.push({
      id: s.category,
      name: s.category,
      slug: s.category
        .toLowerCase()
        .replace(/ & /g, "-")
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, ""),
      description: `Automations for ${s.category}`,
    });
  }
  return cats.sort((a, b) => a.name.localeCompare(b.name));
}
