import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HIRE_VS_AUTOMATE_ROLES } from "@/data/hire-vs-automate";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";

const BASE_URL = `https://${BRAND_DOMAIN}`;

export const metadata = {
  title: `Hire vs Automate - Compare Costs for 19 Roles | ${BRAND_NAME}`,
  description:
    "Should you hire or automate? Compare real costs for 19 common business roles. See monthly salaries, automation setup costs, and 12-month savings side by side.",
  openGraph: {
    title: `Hire vs Automate - Compare Costs for 19 Roles | ${BRAND_NAME}`,
    description:
      "Compare hiring costs vs automation costs for 19 business roles. Real numbers, honest verdicts.",
    url: `${BASE_URL}/tools/hire-vs-automate`,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image" as const,
    title: `Hire vs Automate - Compare Costs for 19 Roles | ${BRAND_NAME}`,
    description:
      "Compare hiring costs vs automation costs for 19 business roles. Real numbers, honest verdicts.",
  },
  alternates: { canonical: `${BASE_URL}/tools/hire-vs-automate` },
  keywords: [
    "hire vs automate",
    "automation cost comparison",
    "should I hire or automate",
    "automation ROI",
    "business automation costs",
    "hire or automate calculator",
    "automation savings",
  ],
};

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function HireVsAutomateHub() {
  return (
    <div className="min-h-screen bg-[#FBFAF8]">
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
                name: "Hire vs Automate",
                item: `${BASE_URL}/tools/hire-vs-automate`,
              },
            ],
          }),
        }}
      />

      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
            Free Tool
          </p>
          <h1 className="text-4xl font-bold mb-4 tracking-tight text-foreground">
            Hire vs Automate
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Compare the real cost of hiring a full-time employee against
            automating the same role. We include employer overhead (taxes,
            benefits, equipment) for honest numbers. Pick a role below to see the
            full breakdown.
          </p>
        </div>

        {/* Role Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HIRE_VS_AUTOMATE_ROLES.map((role) => (
            <Link
              key={role.id}
              href={`/tools/hire-vs-automate/${role.id}`}
              className="group bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <h2 className="font-bold text-lg text-foreground mb-1">
                {role.title}
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                {role.categoryLabel}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-5 mt-auto">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                    Hire / month
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {fmt(role.hire.monthlyCostLow)} -{" "}
                    {fmt(role.hire.monthlyCostHigh)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                    Automate / month
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {fmt(role.automate.monthlyCost)}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:gap-2 transition-all">
                Compare <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
