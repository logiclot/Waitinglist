import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  User,
  Cpu,
  ChevronRight,
  ClipboardCheck,
  Search,
  Star,
  Zap,
  Clock,
  Shield,
} from "lucide-react";
import {
  HIRE_VS_AUTOMATE_ROLES,
  type HireVsAutomateRole,
} from "@/data/hire-vs-automate";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";
import { getPublishedSolutions } from "@/lib/solutions/data";
import { DISCOVERY_SCAN_PRICE_CENTS } from "@/lib/pricing-config";
import type { Solution } from "@/types";

const BASE_URL = `https://${BRAND_DOMAIN}`;

/* -- Helpers -------------------------------------------------- */

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/ & /g, "-")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

type FitLabel = "Strong Fit" | "Good Fit" | "Partial Fit";

interface RecommendedSolution {
  solution: Solution;
  fitLabel: FitLabel;
}

function getRecommendedSolutions(
  allSolutions: Solution[],
  role: HireVsAutomateRole,
): RecommendedSolution[] {
  // 1. Exact category matches are "Strong Fit"
  const exactMatches = allSolutions.filter(
    (s) => categoryToSlug(s.category) === role.categorySlug,
  );

  const results: RecommendedSolution[] = exactMatches
    .slice(0, 3)
    .map((s) => ({ solution: s, fitLabel: "Strong Fit" as FitLabel }));

  if (results.length >= 3) return results;

  // 2. Related categories based on keyword overlap
  const roleKeywords = [
    role.title.toLowerCase(),
    role.categoryLabel.toLowerCase(),
    ...role.hire.bullets.join(" ").toLowerCase().split(/\s+/),
    ...role.automate.bullets.join(" ").toLowerCase().split(/\s+/),
  ];

  const usedIds = new Set(results.map((r) => r.solution.id));

  const scored = allSolutions
    .filter((s) => !usedIds.has(s.id))
    .map((s) => {
      const text = [
        s.title,
        s.description,
        s.short_summary || "",
        s.category,
        ...(s.businessGoals || []),
      ]
        .join(" ")
        .toLowerCase();
      const hits = roleKeywords.filter((kw) => kw.length > 3 && text.includes(kw)).length;
      return { solution: s, hits };
    })
    .filter((s) => s.hits > 0)
    .sort((a, b) => b.hits - a.hits);

  for (const item of scored) {
    if (results.length >= 3) break;
    results.push({
      solution: item.solution,
      fitLabel: item.hits >= 5 ? "Good Fit" : "Partial Fit",
    });
  }

  return results;
}

function getRelatedRoles(
  role: HireVsAutomateRole,
): HireVsAutomateRole[] {
  const sameCategory = HIRE_VS_AUTOMATE_ROLES.filter(
    (r) => r.categorySlug === role.categorySlug && r.id !== role.id,
  );
  if (sameCategory.length >= 3) return sameCategory.slice(0, 3);

  const others = HIRE_VS_AUTOMATE_ROLES.filter(
    (r) => r.id !== role.id && r.categorySlug !== role.categorySlug,
  );
  const combined = [...sameCategory, ...others];
  return combined.slice(0, 3);
}

function fitLabelColor(label: FitLabel): string {
  switch (label) {
    case "Strong Fit":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Good Fit":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Partial Fit":
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

/* -- Static generation ---------------------------------------- */

export function generateStaticParams() {
  return HIRE_VS_AUTOMATE_ROLES.map((r) => ({ slug: r.id }));
}

/* -- Metadata ------------------------------------------------- */

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const role = HIRE_VS_AUTOMATE_ROLES.find((r) => r.id === slug);
  if (!role) return {};

  const title = `${role.title}: Hire or Automate? | ${BRAND_NAME}`;
  const description = role.intro;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/tools/hire-vs-automate/${role.id}`,
      siteName: BRAND_NAME,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/tools/hire-vs-automate/${role.id}`,
    },
    keywords: [
      `hire vs automate ${role.title.toLowerCase()}`,
      `${role.title.toLowerCase()} automation cost`,
      `should I hire a ${role.title.toLowerCase()}`,
      `${role.title.toLowerCase()} salary vs automation`,
      `automate ${role.title.toLowerCase()}`,
      role.categoryLabel.toLowerCase(),
    ],
  };
}

/* -- Page component ------------------------------------------- */

export default async function HireVsAutomateRolePage({
  params,
}: PageProps) {
  const { slug } = await params;
  const role = HIRE_VS_AUTOMATE_ROLES.find((r) => r.id === slug);
  if (!role) notFound();

  const related = getRelatedRoles(role);

  // Fetch real solutions from the database
  const allSolutions = await getPublishedSolutions();
  const recommended = getRecommendedSolutions(allSolutions, role);

  const annualAutomation =
    (role.automate.setupCostLow + role.automate.setupCostHigh) / 2 +
    role.automate.monthlyCost * 12;
  const annualHireAvg =
    (role.annualHireCost.low + role.annualHireCost.high) / 2;
  const annualSavings = annualHireAvg - annualAutomation;

  const discoveryScanPrice = fmt(DISCOVERY_SCAN_PRICE_CENTS / 100);

  return (
    <div className="min-h-screen bg-[#FBFAF8]">
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
                name: "Hire vs Automate",
                item: `${BASE_URL}/tools/hire-vs-automate`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: role.title,
                item: `${BASE_URL}/tools/hire-vs-automate/${role.id}`,
              },
            ],
          }),
        }}
      />

      {/* JSON-LD: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: role.faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.answer,
              },
            })),
          }),
        }}
      />

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Breadcrumb nav */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-10">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/tools/hire-vs-automate"
            className="hover:text-foreground transition-colors"
          >
            Hire vs Automate
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{role.title}</span>
        </nav>

        {/* H1 + Intro */}
        <div className="mb-12">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
            {role.categoryLabel}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-5 tracking-tight text-foreground">
            {role.title}: Hire or Automate?
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
            {role.intro}
          </p>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {/* Hire column */}
          <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
                <User className="h-4 w-4 text-foreground" />
              </div>
              <h2 className="font-bold text-lg text-foreground">
                Hire a {role.title}
              </h2>
            </div>
            <ul className="space-y-3 mb-6">
              {role.hire.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                Monthly salary
              </p>
              <p className="text-xl font-bold text-foreground">
                {fmt(role.hire.monthlyCostLow)} -{" "}
                {fmt(role.hire.monthlyCostHigh)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Before employer overhead (taxes, benefits, equipment)
              </p>
            </div>
          </div>

          {/* Automate column */}
          <div className="bg-white border border-primary/20 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Cpu className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-bold text-lg text-foreground">
                Automate the Role
              </h2>
            </div>
            <ul className="space-y-3 mb-6">
              {role.automate.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                Setup cost (one-time)
              </p>
              <p className="text-lg font-bold text-foreground mb-2">
                {fmt(role.automate.setupCostLow)} -{" "}
                {fmt(role.automate.setupCostHigh)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                Monthly cost
              </p>
              <p className="text-xl font-bold text-primary">
                {fmt(role.automate.monthlyCost)}
              </p>
            </div>
          </div>
        </div>

        {/* 12-month cost comparison table */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            12-Month Cost Comparison
          </h2>
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 font-semibold text-foreground">
                    Cost item
                  </th>
                  <th className="text-right p-4 font-semibold text-foreground">
                    Hire
                  </th>
                  <th className="text-right p-4 font-semibold text-primary">
                    Automate
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">
                    Monthly salary / cost
                  </td>
                  <td className="p-4 text-right text-foreground font-medium">
                    {fmt(role.hire.monthlyCostLow)} -{" "}
                    {fmt(role.hire.monthlyCostHigh)}
                  </td>
                  <td className="p-4 text-right text-foreground font-medium">
                    {fmt(role.automate.monthlyCost)}
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">
                    12 months base cost
                  </td>
                  <td className="p-4 text-right text-foreground font-medium">
                    {fmt(role.hire.monthlyCostLow * 12)} -{" "}
                    {fmt(role.hire.monthlyCostHigh * 12)}
                  </td>
                  <td className="p-4 text-right text-foreground font-medium">
                    {fmt(role.automate.monthlyCost * 12)}
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">
                    Employer overhead (30-35%)
                  </td>
                  <td className="p-4 text-right text-foreground font-medium">
                    {fmt(role.annualHireCost.low - role.hire.monthlyCostLow * 12)}{" "}
                    -{" "}
                    {fmt(
                      role.annualHireCost.high -
                        role.hire.monthlyCostHigh * 12,
                    )}
                  </td>
                  <td className="p-4 text-right text-muted-foreground">-</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">
                    One-time setup cost
                  </td>
                  <td className="p-4 text-right text-muted-foreground">-</td>
                  <td className="p-4 text-right text-foreground font-medium">
                    {fmt(role.automate.setupCostLow)} -{" "}
                    {fmt(role.automate.setupCostHigh)}
                  </td>
                </tr>
                <tr className="bg-secondary/20">
                  <td className="p-4 font-bold text-foreground">
                    Total 12-month cost
                  </td>
                  <td className="p-4 text-right font-bold text-foreground">
                    {fmt(role.annualHireCost.low)} -{" "}
                    {fmt(role.annualHireCost.high)}
                  </td>
                  <td className="p-4 text-right font-bold text-primary">
                    {fmt(
                      role.automate.setupCostLow +
                        role.automate.monthlyCost * 12,
                    )}{" "}
                    -{" "}
                    {fmt(
                      role.automate.setupCostHigh +
                        role.automate.monthlyCost * 12,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Savings callout */}
          <div className="mt-5 bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Estimated annual savings with automation
            </p>
            <p className="text-3xl font-bold text-primary">
              {fmt(Math.round(annualSavings))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on average costs. Setup pays for itself in roughly{" "}
              {role.roiMonths} {role.roiMonths === 1 ? "month" : "months"}.
            </p>
          </div>
        </div>

        {/* Verdict */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Verdict
          </h2>
          <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {role.verdict}
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {role.faq.map((item, i) => (
              <details
                key={i}
                className="group bg-white border border-border rounded-xl shadow-sm"
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
        </div>

        {/* ── Recommended Solutions ─────────────────────── */}
        {recommended.length > 0 && (
          <div className="mb-14">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Automation Solutions for This Role
              </h2>
              <p className="text-sm text-muted-foreground">
                Ready-to-implement solutions from verified experts that can
                replace or augment {role.title.toLowerCase()} tasks.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recommended.map(({ solution, fitLabel }) => (
                <Link
                  key={solution.id}
                  href={`/solutions/${solution.id}`}
                  className="group bg-white border border-border rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Fit label banner */}
                  <div className="px-5 pt-5 pb-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${fitLabelColor(fitLabel)}`}
                    >
                      <Star className="h-3 w-3" />
                      {fitLabel}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="px-5 pt-3 pb-5 flex flex-col flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">
                      {solution.category}
                    </p>
                    <h3 className="font-bold text-foreground text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {solution.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                      {solution.short_summary || solution.description}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-4">
                      {solution.delivery_days > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {solution.delivery_days}d delivery
                        </span>
                      )}
                      {solution.is_vetted && (
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3 text-emerald-600" />
                          Vetted
                        </span>
                      )}
                    </div>

                    {/* Price + expert row */}
                    <div className="border-t border-border pt-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="font-bold text-foreground text-sm">
                          {fmt(solution.implementation_price)}
                        </p>
                      </div>
                      {solution.expert && (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground overflow-hidden">
                            {solution.expert.profile_image_url ? (
                              <img
                                src={solution.expert.profile_image_url}
                                alt={solution.expert.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              solution.expert.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground max-w-[100px] truncate">
                            {solution.expert.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Browse CTA (original, kept) ──────────────── */}
        <div className="mb-8 bg-white border border-border rounded-2xl p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Ready to explore automation?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Browse {role.categoryLabel.toLowerCase()} solutions built by
            verified experts.
          </p>
          <Link
            href={`/solutions?category=${role.categorySlug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity text-sm"
          >
            See {role.categoryLabel} Solutions{" "}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Free Audit CTA ───────────────────────────── */}
        <div className="mb-8 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <ClipboardCheck className="h-7 w-7 text-emerald-700" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-lg font-bold text-foreground mb-1">
                Not sure where to start?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Take our free 2-minute Automation Audit to assess your
                readiness and find the highest-impact areas to automate in
                your business. No account needed.
              </p>
            </div>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-colors text-sm shrink-0"
            >
              Take Free Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* ── Discovery Scan CTA ───────────────────────── */}
        <div className="mb-14 bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-foreground px-8 py-4">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-background" />
              <h2 className="text-lg font-bold text-background">
                Discovery Scan
              </h2>
            </div>
          </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left: explanation */}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  A Discovery Scan is a guided deep-dive into your business
                  processes. You answer a short questionnaire about how your
                  business operates, and up to 5 verified automation experts
                  review your answers and send tailored proposals for where
                  and how to automate.
                </p>
                <h3 className="text-sm font-bold text-foreground mb-3">
                  What happens after you submit:
                </h3>
                <ul className="space-y-2.5 mb-5">
                  {[
                    "Experts analyze your workflows and identify your top 3 automation wins",
                    "You receive 2-5 tailored proposals with pricing and timelines",
                    "Each proposal includes a live demo option so you see the solution in action",
                    "The fee is credited toward your first build if you proceed",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground/70">
                  You do not need to know what to automate. Just describe your
                  business and the experts will do the rest.
                </p>
              </div>

              {/* Right: price + CTA */}
              <div className="md:w-64 shrink-0 flex flex-col items-center justify-center text-center bg-secondary/30 rounded-xl p-6">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                  One-time fee
                </p>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {discoveryScanPrice}
                </p>
                <p className="text-xs text-muted-foreground mb-5">
                  Credited toward your first build
                </p>
                <Link
                  href="/jobs/discovery"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity text-sm w-full justify-center"
                >
                  Start Discovery Scan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related roles */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Compare other roles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/tools/hire-vs-automate/${r.id}`}
                className="group bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-2"
              >
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {r.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.categoryLabel}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Last updated */}
        <p className="text-xs text-muted-foreground/60 text-center">
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}
