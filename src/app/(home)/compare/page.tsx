import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COMPARISONS } from "@/data/comparisons";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

const BASE_URL = `https://${BRAND_DOMAIN}`;

export const metadata = {
  title: `Tool Comparisons | ${BRAND_NAME}`,
  description:
    "Compare popular automation tools side by side. Honest feature breakdowns, pricing notes, and verdicts to help you pick the right tool for your workflows.",
  openGraph: {
    title: `Tool Comparisons | ${BRAND_NAME}`,
    description:
      "Compare popular automation tools side by side. Feature breakdowns, verdicts, and guidance for every workflow.",
    url: `${BASE_URL}/compare`,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image" as const,
    title: `Tool Comparisons | ${BRAND_NAME}`,
    description:
      "Compare popular automation tools side by side. Feature breakdowns, verdicts, and guidance for every workflow.",
  },
  alternates: { canonical: `${BASE_URL}/compare` },
  keywords: [
    "automation tool comparison",
    "zapier vs make",
    "workflow automation tools",
    "compare automation platforms",
    "best automation tool",
    "integration platform comparison",
  ],
};

export default function CompareHubPage() {
  return (
    <div className="bg-[#FBFAF8] min-h-screen">
      {/* JSON-LD: BreadcrumbList */}
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
                name: "Tool Comparisons",
                item: `${BASE_URL}/compare`,
              },
            ],
          }),
        }}
      />

      {/* JSON-LD: ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Automation Tool Comparisons",
            itemListElement: COMPARISONS.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: `${c.toolA.name} vs ${c.toolB.name}`,
              url: `${BASE_URL}/compare/${c.id}`,
            })),
          }),
        }}
      />

      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
            Comparisons
          </p>
          <h1 className="text-4xl font-bold mb-4 tracking-tight text-foreground">
            Tool Comparisons
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Choosing the right automation tool matters. We break down the most
            popular platforms feature by feature so you can make a confident
            decision for your workflows.
          </p>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPARISONS.map((c) => (
            <Link
              key={c.id}
              href={`/compare/${c.id}`}
              className="group bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <span className="inline-block text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-3">
                {c.categoryLabel}
              </span>
              <h2 className="font-bold text-lg mb-3 text-foreground group-hover:text-primary transition-colors">
                {c.toolA.name} vs {c.toolB.name}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                {c.intro.length > 120
                  ? `${c.intro.slice(0, 120)}...`
                  : c.intro}
              </p>
              <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-end">
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
