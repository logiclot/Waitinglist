import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { GLOSSARY_TERMS } from "@/data/glossary";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

const BASE_URL = `https://${BRAND_DOMAIN}`;

interface Props {
  params: Promise<{ slug: string }>;
}

function getTerm(slug: string) {
  return GLOSSARY_TERMS.find((t) => t.id === slug);
}

export async function generateStaticParams() {
  return GLOSSARY_TERMS.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) return {};

  const title = `What is ${term.term}? | ${BRAND_NAME} Glossary`;
  const description = term.definition;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/glossary/${term.id}`,
      siteName: BRAND_NAME,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: { canonical: `${BASE_URL}/glossary/${term.id}` },
    keywords: [
      term.term,
      `${term.term} definition`,
      `what is ${term.term.toLowerCase()}`,
      "automation glossary",
      BRAND_NAME,
    ],
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) notFound();

  const relatedTerms = term.relatedTerms
    .map((id) => GLOSSARY_TERMS.find((t) => t.id === id))
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.definition,
    url: `${BASE_URL}/glossary/${term.id}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "LogicLot Automation Glossary",
      url: `${BASE_URL}/glossary`,
    },
  };

  return (
    <div className="container mx-auto px-4 py-20 bg-[#FBFAF8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="max-w-3xl mx-auto mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href="/glossary"
          className="hover:text-foreground transition-colors"
        >
          Glossary
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{term.term}</span>
      </nav>

      <div className="max-w-3xl mx-auto">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
          Definition
        </p>
        <h1 className="text-4xl font-bold mb-8 tracking-tight">
          What is {term.term}?
        </h1>

        {/* Definition */}
        <div className="bg-white border border-border rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-base text-foreground leading-relaxed">
              {term.definition}
            </p>
          </div>
        </div>

        {/* Detailed explanation */}
        <div className="prose prose-neutral max-w-none mb-12">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            How it works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {term.explanation}
          </p>
        </div>

        {/* Related terms */}
        {relatedTerms.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold mb-4 text-foreground">
              Related terms
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedTerms.map((related) =>
                related ? (
                  <Link
                    key={related.id}
                    href={`/glossary/${related.id}`}
                    className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-3 hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {related.term}
                    </span>
                  </Link>
                ) : null,
              )}
            </div>
          </div>
        )}

        {/* Category CTA */}
        {term.categorySlug && term.categoryLabel && (
          <div className="bg-white border border-border rounded-2xl p-8 text-center shadow-sm mb-12">
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Browse {term.categoryLabel} solutions on LogicLot
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Find vetted automation experts who build {term.categoryLabel.toLowerCase()} solutions.
            </p>
            <Link
              href={`/solutions?category=${term.categorySlug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity text-sm"
            >
              View Solutions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground/50 text-center mt-12">
        Last updated: March 2026
      </p>
    </div>
  );
}
