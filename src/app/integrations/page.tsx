import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Plug } from "lucide-react";
import { INTEGRATIONS } from "@/data/integrations";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

const BASE_URL = `https://${BRAND_DOMAIN}`;

export const metadata: Metadata = {
  title: `Integrations | ${BRAND_NAME}`,
  description:
    "Explore the tools and platforms that LogicLot automation experts integrate. HubSpot, Salesforce, Make, n8n, Slack, Stripe, OpenAI, and more.",
  openGraph: {
    title: `Integrations | ${BRAND_NAME}`,
    description:
      "Explore the tools and platforms that LogicLot automation experts integrate.",
    url: `${BASE_URL}/integrations`,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Integrations | ${BRAND_NAME}`,
    description:
      "Explore the tools and platforms that LogicLot automation experts integrate.",
  },
  alternates: { canonical: `${BASE_URL}/integrations` },
  keywords: [
    "automation integrations",
    "workflow automation tools",
    "business tool integrations",
    "API integrations",
    BRAND_NAME,
  ],
};

export default function IntegrationsPage() {
  const sorted = [...INTEGRATIONS].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="container mx-auto px-4 py-20 bg-[#FBFAF8]">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
          Ecosystem
        </p>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          Integrations
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          LogicLot experts build automations with these tools. Find the
          platforms you already use and see what can be automated.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.map((integration) => (
          <Link
            key={integration.id}
            href={`/integrations/${integration.id}`}
            className="bg-white border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-sm transition-all group flex flex-col"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Plug className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-bold text-foreground group-hover:text-primary transition-colors">
                {integration.name}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
              {integration.description}
            </p>
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              See automations <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/50 text-center mt-16">
        Last updated: March 2026
      </p>
    </div>
  );
}
