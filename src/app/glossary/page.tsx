import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { GLOSSARY_TERMS } from "@/data/glossary";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

const BASE_URL = `https://${BRAND_DOMAIN}`;

export const metadata: Metadata = {
  title: `Automation Glossary | ${BRAND_NAME}`,
  description:
    "Clear definitions of automation, AI, and integration terms. Learn what workflow automation, RPA, API integration, ETL, and other concepts mean in plain language.",
  openGraph: {
    title: `Automation Glossary | ${BRAND_NAME}`,
    description:
      "Clear definitions of automation, AI, and integration terms used in business process automation.",
    url: `${BASE_URL}/glossary`,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Automation Glossary | ${BRAND_NAME}`,
    description:
      "Clear definitions of automation, AI, and integration terms used in business process automation.",
  },
  alternates: { canonical: `${BASE_URL}/glossary` },
  keywords: [
    "automation glossary",
    "workflow automation terms",
    "business automation definitions",
    "AI automation glossary",
    "integration terminology",
  ],
};

export default function GlossaryPage() {
  const sorted = [...GLOSSARY_TERMS].sort((a, b) =>
    a.term.localeCompare(b.term),
  );

  const grouped: Record<string, typeof sorted> = {};
  for (const term of sorted) {
    const letter = term.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(term);
  }

  const letters = Object.keys(grouped).sort();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "LogicLot Automation Glossary",
    description:
      "Definitions of automation, AI, and integration terms for business professionals.",
    url: `${BASE_URL}/glossary`,
    hasDefinedTerm: sorted.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.definition,
      url: `${BASE_URL}/glossary/${t.id}`,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-20 bg-[#FBFAF8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto text-center mb-14">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
          Reference
        </p>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          Automation Glossary
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Plain-language definitions of the tools, techniques, and concepts used
          in business automation and AI integration.
        </p>
      </div>

      {/* Letter navigation */}
      <div className="max-w-5xl mx-auto mb-12 flex flex-wrap gap-2 justify-center">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="h-9 w-9 rounded-lg bg-white border border-border flex items-center justify-center text-sm font-bold text-foreground hover:bg-secondary/50 transition-colors"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Terms by letter */}
      <div className="max-w-4xl mx-auto space-y-12">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{letter}</span>
              </div>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="space-y-4">
              {grouped[letter].map((term) => (
                <Link
                  key={term.id}
                  href={`/glossary/${term.id}`}
                  className="block bg-white border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-1 shrink-0 group-hover:text-primary transition-colors" />
                    <div>
                      <h2 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {term.term}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {term.definition}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/50 text-center mt-16">
        Last updated: March 2026
      </p>
    </div>
  );
}
