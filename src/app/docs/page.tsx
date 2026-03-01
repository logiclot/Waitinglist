import Link from "next/link";
import { DOCS_PAGES } from "@/lib/docs-content";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";
import { BookOpen, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Business Automation Guides & Documentation | ${BRAND_NAME}`,
  description: "Practical guides on business automation, workflow automation, AI agents, and no-code tools. Learn what to automate, how to calculate ROI, and when to hire an expert.",
  keywords: "business automation guides, workflow automation documentation, no-code automation, AI agents, automate business processes",
  alternates: { canonical: `https://${BRAND_DOMAIN}/docs` },
  openGraph: {
    title: `Business Automation Guides & Documentation | ${BRAND_NAME}`,
    description: "Practical guides on business automation, workflow automation, AI agents, and no-code tools.",
    url: `https://${BRAND_DOMAIN}/docs`,
    type: "website",
    siteName: BRAND_NAME,
  },
};

const CATEGORIES: { label: string; slugs: string[] }[] = [
  {
    label: "Start Here",
    slugs: [
      "what-is-automation",
      "automation-for-beginners",
      "small-business-automation-guide",
      "what-is-a-workflow",
      "no-code-automation",
      "zapier-vs-make-vs-n8n",
    ],
  },
  {
    label: "High-ROI Workflows",
    slugs: [
      "automate-client-onboarding-small-business",
      "how-to-automate-lead-follow-up",
      "automate-appointment-reminders",
      "ecommerce-automation-guide",
      "crm-automation",
      "sales-automation",
    ],
  },
  {
    label: "By Department",
    slugs: [
      "marketing-automation",
      "customer-support-automation",
      "finance-automation",
      "hr-recruiting-automation",
      "data-automation",
      "content-automation",
    ],
  },
  {
    label: "Strategy & ROI",
    slugs: [
      "automation-roi",
      "business-automation-guide",
      "when-to-hire-automation-expert",
      "automation-industry-trends",
      "automation-for-agencies-freelancers",
    ],
  },
  {
    label: "AI & Advanced",
    slugs: [
      "what-is-an-ai-agent",
      "ai-agents-vs-workflows",
      "workflow-automation-tools",
      "apis-webhooks-automation",
      "automation-security",
      "workflow-automation-data-residency-gdpr",
    ],
  },
  {
    label: "Technical Deep Dives",
    slugs: [
      "webhook-timeouts-retries-best-practices",
      "automation-idempotency-deduplication",
      "zapier-filter-vs-path-conditional-logic",
    ],
  },
  {
    label: "Platform Guide",
    slugs: [
      "discovery-scan-explained",
      "custom-project-explained",
      "how-escrow-works",
      "pricing",
      "invoicing",
    ],
  },
];

function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 220));
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `https://${BRAND_DOMAIN}` },
    { "@type": "ListItem", position: 2, name: "Documentation", item: `https://${BRAND_DOMAIN}/docs` },
  ],
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `Business Automation Guides & Documentation | ${BRAND_NAME}`,
  description: "Practical guides on business automation, workflow automation, AI agents, and no-code tools.",
  url: `https://${BRAND_DOMAIN}/docs`,
  publisher: {
    "@type": "Organization",
    name: BRAND_NAME,
    url: `https://${BRAND_DOMAIN}`,
  },
};

export default function DocsIndexPage() {
  const pageMap = Object.fromEntries(DOCS_PAGES.map((d) => [d.slug, d]));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-primary font-semibold mb-4">
            <BookOpen className="h-5 w-5" />
            Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Business Automation Guides
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Practical guides on workflow automation, AI agents, and no-code tools—from beginner basics to advanced integrations. Learn what to automate, how to calculate ROI, and when to hire an expert.
          </p>
        </div>

        <div className="space-y-16">
          {CATEGORIES.map((cat) => {
            const docs = cat.slugs.map((s) => pageMap[s]).filter(Boolean);
            if (docs.length === 0) return null;
            return (
              <section key={cat.label}>
                <h2 className="text-lg font-bold text-foreground mb-6 pb-3 border-b border-border">
                  {cat.label}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {docs.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/docs/${doc.slug}`}
                      className="group block p-6 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-200"
                    >
                      <h3 className="font-bold text-base text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {doc.description}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mb-3">
                        {estimateReadTime(doc.content)} min read
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Read more
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
