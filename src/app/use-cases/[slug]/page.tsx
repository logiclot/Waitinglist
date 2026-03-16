import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle, Clock, TrendingDown, ChevronRight } from "lucide-react";
import { USE_CASES } from "@/data/use-cases";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

const BASE_URL = `https://${BRAND_DOMAIN}`;

export function generateStaticParams() {
  return USE_CASES.map((uc) => ({ slug: uc.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const uc = USE_CASES.find((u) => u.id === slug);
  if (!uc) return {};

  const title = `${uc.title} | ${BRAND_NAME}`;
  const description = uc.intro;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/use-cases/${uc.id}`,
      siteName: BRAND_NAME,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: `${BASE_URL}/use-cases/${uc.id}` },
    keywords: [
      uc.title.toLowerCase(),
      `${uc.categoryLabel.toLowerCase()} automation`,
      "workflow automation",
      "business process automation",
      ...uc.tools.map((t) => t.toLowerCase()),
    ],
  };
}

function getRelatedUseCases(currentId: string) {
  const current = USE_CASES.find((u) => u.id === currentId);
  if (!current) return [];

  // Prefer same category, then fill with others
  const sameCategory = USE_CASES.filter(
    (u) => u.id !== currentId && u.categorySlug === current.categorySlug
  );
  const otherCategory = USE_CASES.filter(
    (u) => u.id !== currentId && u.categorySlug !== current.categorySlug
  );

  return [...sameCategory, ...otherCategory].slice(0, 3);
}

export default async function UseCaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const uc = USE_CASES.find((u) => u.id === slug);
  if (!uc) notFound();

  const related = getRelatedUseCases(uc.id);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Use Cases",
        item: `${BASE_URL}/use-cases`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: uc.title,
        item: `${BASE_URL}/use-cases/${uc.id}`,
      },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: uc.faq.map((f) => ({
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

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-10">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href="/use-cases"
              className="hover:text-foreground transition-colors"
            >
              Use Cases
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{uc.title}</span>
          </nav>

          {/* Category label */}
          <span className="inline-block text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-3">
            {uc.categoryLabel}
          </span>

          {/* H1 */}
          <h1 className="text-4xl font-bold mb-6 tracking-tight">
            {uc.title}
          </h1>

          {/* Intro */}
          <p className="text-base text-muted-foreground leading-relaxed mb-12">
            {uc.intro}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  Estimated Savings
                </span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {uc.estimatedSavings}
              </p>
            </div>
            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  Setup Time
                </span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {uc.setupTime}
              </p>
            </div>
          </div>

          {/* The Problem */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              The Problem
            </h2>
            <div className="bg-white border border-border rounded-2xl p-6">
              <p className="text-muted-foreground leading-relaxed">
                {uc.problem}
              </p>
            </div>
          </section>

          {/* The Solution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              The Solution
            </h2>
            <div className="bg-white border border-border rounded-2xl p-6">
              <p className="text-muted-foreground leading-relaxed">
                {uc.solution}
              </p>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Key Benefits
            </h2>
            <div className="bg-white border border-border rounded-2xl p-6">
              <ul className="space-y-3">
                {uc.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Common Tools */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Common Tools
            </h2>
            <div className="flex flex-wrap gap-2">
              {uc.tools.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-border text-sm text-foreground font-medium"
                >
                  {tool}
                </span>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {uc.faq.map((f, i) => (
                <details
                  key={i}
                  className="group bg-white border border-border rounded-2xl overflow-hidden"
                >
                  <summary className="cursor-pointer p-5 font-bold text-sm text-foreground flex items-center justify-between list-none">
                    {f.question}
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0 ml-4" />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mb-12">
            <div className="bg-white border border-border rounded-2xl p-8 text-center">
              <h2 className="text-xl font-bold mb-2 text-foreground">
                Ready to automate?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Browse {uc.categoryLabel} solutions from vetted automation
                experts.
              </p>
              <Link
                href={`/solutions?category=${uc.categorySlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity text-sm"
              >
                Browse {uc.categoryLabel} Solutions{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Related Use Cases */}
          {related.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Related Use Cases
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/use-cases/${r.id}`}
                    className="group bg-white border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
                  >
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      {r.categoryLabel}
                    </span>
                    <h3 className="font-bold text-sm mt-2 text-foreground group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.estimatedSavings}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="text-xs text-muted-foreground/50 text-center mt-16">
            Last updated: March 2026
          </p>
        </div>
      </div>
    </div>
  );
}
