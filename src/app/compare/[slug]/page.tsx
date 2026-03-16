import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { COMPARISONS } from "@/data/comparisons";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

const BASE_URL = `https://${BRAND_DOMAIN}`;

/* ── Helpers ─────────────────────────────────────── */

function getRelatedComparisons(currentId: string) {
  const current = COMPARISONS.find((c) => c.id === currentId);
  if (!current) return [];

  const sameCategory = COMPARISONS.filter(
    (c) => c.id !== currentId && c.categorySlug === current.categorySlug,
  );
  const involvingSameTools = COMPARISONS.filter(
    (c) =>
      c.id !== currentId &&
      c.categorySlug !== current.categorySlug &&
      (c.toolA.slug === current.toolA.slug ||
        c.toolA.slug === current.toolB.slug ||
        c.toolB.slug === current.toolA.slug ||
        c.toolB.slug === current.toolB.slug),
  );
  const others = COMPARISONS.filter(
    (c) =>
      c.id !== currentId &&
      c.categorySlug !== current.categorySlug &&
      !involvingSameTools.some((r) => r.id === c.id),
  );

  return [...sameCategory, ...involvingSameTools, ...others].slice(0, 3);
}

/* ── Static generation ───────────────────────────── */

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.id }));
}

/* ── Metadata ────────────────────────────────────── */

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = COMPARISONS.find((c) => c.id === slug);
  if (!comparison) return {};

  const title = `${comparison.toolA.name} vs ${comparison.toolB.name}: Automation Comparison | ${BRAND_NAME}`;
  const description = comparison.intro;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/compare/${comparison.id}`,
      siteName: BRAND_NAME,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/compare/${comparison.id}`,
    },
    keywords: [
      `${comparison.toolA.name.toLowerCase()} vs ${comparison.toolB.name.toLowerCase()}`,
      `${comparison.toolA.name.toLowerCase()} alternative`,
      `${comparison.toolB.name.toLowerCase()} alternative`,
      `${comparison.toolA.name.toLowerCase()} comparison`,
      `compare ${comparison.toolA.name.toLowerCase()} ${comparison.toolB.name.toLowerCase()}`,
      comparison.categoryLabel.toLowerCase(),
      "automation tool comparison",
    ],
  };
}

/* ── Page component ──────────────────────────────── */

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const comparison = COMPARISONS.find((c) => c.id === slug);
  if (!comparison) notFound();

  const related = getRelatedComparisons(comparison.id);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tool Comparisons",
        item: `${BASE_URL}/compare`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${comparison.toolA.name} vs ${comparison.toolB.name}`,
        item: `${BASE_URL}/compare/${comparison.id}`,
      },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: comparison.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <div className="bg-[#FBFAF8] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Breadcrumb nav */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-10">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/compare"
            className="hover:text-foreground transition-colors"
          >
            Tool Comparisons
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">
            {comparison.toolA.name} vs {comparison.toolB.name}
          </span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <span className="inline-block text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-3">
            {comparison.categoryLabel}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-5 tracking-tight text-foreground">
            {comparison.toolA.name} vs {comparison.toolB.name}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
            {comparison.intro}
          </p>
        </div>

        {/* Comparison table */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Feature Comparison
          </h2>
          <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    {comparison.toolA.name}
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    {comparison.toolB.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border/50 ${
                      i % 2 === 0 ? "" : "bg-secondary/20"
                    }`}
                  >
                    <td className="p-4 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="p-4 text-muted-foreground">{row.toolA}</td>
                    <td className="p-4 text-muted-foreground">{row.toolB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* When to choose Tool A */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            When to choose {comparison.toolA.name}
          </h2>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {comparison.whenChooseA}
            </p>
          </div>
        </section>

        {/* When to choose Tool B */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            When to choose {comparison.toolB.name}
          </h2>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {comparison.whenChooseB}
            </p>
          </div>
        </section>

        {/* Verdict */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6">Verdict</h2>
          <div className="bg-white border-l-4 border-primary p-6 rounded-r-xl">
            <p className="text-sm text-foreground leading-relaxed">
              {comparison.verdict}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {comparison.faq.map((item, i) => (
              <details
                key={i}
                className="group bg-white border border-border rounded-xl overflow-hidden"
              >
                <summary className="cursor-pointer p-5 font-semibold text-foreground text-sm list-none flex items-center justify-between gap-4">
                  {item.question}
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-14">
          <div className="bg-white border border-border rounded-2xl p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Need help choosing?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Browse automation solutions that work with{" "}
              {comparison.toolA.name} or {comparison.toolB.name}, built by
              verified experts.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/solutions"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity text-sm"
              >
                Browse Solutions <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/integrations/${comparison.toolA.slug}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-white text-foreground font-medium hover:bg-secondary/30 transition-colors text-sm"
              >
                {comparison.toolA.name} Integrations
              </Link>
              <Link
                href={`/integrations/${comparison.toolB.slug}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-white text-foreground font-medium hover:bg-secondary/30 transition-colors text-sm"
              >
                {comparison.toolB.name} Integrations
              </Link>
            </div>
          </div>
        </section>

        {/* Related comparisons */}
        {related.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Related comparisons
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/compare/${r.id}`}
                  className="group bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {r.toolA.name} vs {r.toolB.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.categoryLabel}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="mb-10">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All comparisons
          </Link>
        </div>

        {/* Last updated */}
        <p className="text-xs text-muted-foreground/60 text-center">
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}
