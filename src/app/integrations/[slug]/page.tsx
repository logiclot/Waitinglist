import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle, ChevronRight, Plug } from "lucide-react";
import { INTEGRATIONS } from "@/data/integrations";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

const BASE_URL = `https://${BRAND_DOMAIN}`;

interface Props {
  params: Promise<{ slug: string }>;
}

function getIntegration(slug: string) {
  return INTEGRATIONS.find((i) => i.id === slug);
}

function getRelated(current: string) {
  const cur = getIntegration(current);
  if (!cur) return [];
  return INTEGRATIONS.filter(
    (i) => i.id !== current && i.categorySlug === cur.categorySlug,
  ).slice(0, 4);
}

export async function generateStaticParams() {
  return INTEGRATIONS.map((i) => ({ slug: i.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const integration = getIntegration(slug);
  if (!integration) return {};

  const title = `${integration.name} Automations | ${BRAND_NAME}`;
  const description = integration.intro;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/integrations/${integration.id}`,
      siteName: BRAND_NAME,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: { canonical: `${BASE_URL}/integrations/${integration.id}` },
    keywords: [
      `${integration.name} automation`,
      `${integration.name} integration`,
      `automate ${integration.name}`,
      "workflow automation",
      BRAND_NAME,
    ],
  };
}

export default async function IntegrationPage({ params }: Props) {
  const { slug } = await params;
  const integration = getIntegration(slug);
  if (!integration) notFound();

  const related = getRelated(slug);

  // If few same-category, fill with others
  const relatedFinal =
    related.length >= 3
      ? related.slice(0, 4)
      : [
          ...related,
          ...INTEGRATIONS.filter(
            (i) =>
              i.id !== slug && !related.some((r) => r.id === i.id),
          ).slice(0, 4 - related.length),
        ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: integration.name,
    description: integration.description,
    applicationCategory: "BusinessApplication",
    url: `${BASE_URL}/integrations/${integration.id}`,
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
          href="/integrations"
          className="hover:text-foreground transition-colors"
        >
          Integrations
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{integration.name}</span>
      </nav>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Plug className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            Integration
          </p>
        </div>
        <h1 className="text-4xl font-bold mb-6 tracking-tight">
          {integration.name} Automations on LogicLot
        </h1>

        {/* Intro */}
        <p className="text-base text-muted-foreground leading-relaxed mb-10">
          {integration.intro}
        </p>

        {/* Use cases */}
        <div className="bg-white border border-border rounded-2xl p-8 mb-10 shadow-sm">
          <h2 className="text-lg font-bold mb-5 text-foreground">
            What you can automate with {integration.name}
          </h2>
          <ul className="space-y-3">
            {integration.automationUseCases.map((useCase, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {useCase}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Category CTA */}
        <div className="bg-white border border-border rounded-2xl p-8 text-center shadow-sm mb-10">
          <h3 className="text-lg font-bold mb-2 text-foreground">
            Browse {integration.categoryLabel} solutions
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Find experts who build {integration.name} automations on LogicLot.
          </p>
          <Link
            href={`/solutions?category=${integration.categorySlug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity text-sm"
          >
            View Solutions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Related integrations */}
        {relatedFinal.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold mb-4 text-foreground">
              Related integrations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedFinal.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/integrations/${rel.id}`}
                  className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-3 hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <Plug className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {rel.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground/50 text-center mt-12">
        Last updated: March 2026
      </p>
    </div>
  );
}
