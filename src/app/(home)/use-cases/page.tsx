import Link from "next/link";
import { ArrowRight, Clock, TrendingDown } from "lucide-react";
import { USE_CASES } from "@/data/use-cases";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

const BASE_URL = `https://${BRAND_DOMAIN}`;

export const metadata = {
  title: `Automation Use Cases | ${BRAND_NAME}`,
  description:
    "Explore 15 real-world automation use cases across sales, marketing, finance, support, and operations. See the problem, solution, time savings, and tools for each.",
  openGraph: {
    title: `Automation Use Cases | ${BRAND_NAME}`,
    description:
      "15 real-world automation use cases with estimated time savings, common tools, and implementation details.",
    url: `${BASE_URL}/use-cases`,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image" as const,
    title: `Automation Use Cases | ${BRAND_NAME}`,
    description:
      "15 real-world automation use cases with estimated time savings, common tools, and implementation details.",
  },
  alternates: { canonical: `${BASE_URL}/use-cases` },
  keywords: [
    "automation use cases",
    "business automation examples",
    "workflow automation",
    "process automation",
    "automation ROI",
    "time savings automation",
  ],
};

export default function UseCasesPage() {
  return (
    <div className="bg-[#FBFAF8] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: BASE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Use Cases",
                item: `${BASE_URL}/use-cases`,
              },
            ],
          }),
        }}
      />

      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
            Use Cases
          </p>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Automation Use Cases
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Real-world automation workflows with specific time savings, common
            tools, and implementation details. Each use case maps to solutions
            available on LogicLot.
          </p>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map((uc) => (
            <Link
              key={uc.id}
              href={`/use-cases/${uc.id}`}
              className="group bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <span className="inline-block text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-3">
                {uc.categoryLabel}
              </span>
              <h2 className="font-bold text-lg mb-3 text-foreground group-hover:text-primary transition-colors">
                {uc.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                {uc.problem}
              </p>
              <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {uc.estimatedSavings}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {uc.setupTime}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground/50 text-center pb-12">
        Last updated: March 2026
      </p>
    </div>
  );
}
