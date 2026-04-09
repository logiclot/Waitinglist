import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CheckCircle,
  Zap,
  Euro,
  ShieldCheck,
  Award,
  Info,
  PlayCircle,
  Star,
  ChevronDown,
  MessageSquare,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { DemoVideoSection } from "@/components/DemoVideoSection";
import { SimilarSolutions } from "@/components/SimilarSolutions";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Solution } from "@/types";
import { getEcosystemsForSolution } from "@/actions/ecosystems";
import { WorksBestWith } from "@/components/ecosystems/WorksBestWith";
import { log } from "@/lib/logger";
import { TierBadge } from "@/components/ui/TierBadge";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { mapPrismaExpert } from "@/lib/solutions/data";
import { BackToBrowse } from "@/components/BackToBrowse";

// Always fetch fresh data — suites and solution details can change at any time
export const dynamic = "force-dynamic";

/** Walk up the parentId chain and collect every version's changelog in ascending order. */
async function getVersionChain(
  version: number,
  changelog: string | null,
  parentId: string | null,
): Promise<{ version: number; changelog: string }[]> {
  const chain: { version: number; changelog: string }[] = [];
  let pid = parentId;
  while (pid) {
    const parent = await prisma.solution.findUnique({
      where: { id: pid },
      select: { version: true, changelog: true, parentId: true },
    });
    if (!parent) break;
    if (parent.changelog)
      chain.unshift({ version: parent.version, changelog: parent.changelog });
    pid = parent.parentId;
  }
  if (changelog) chain.push({ version, changelog });
  return chain;
}

interface PageProps {
  params: {
    id: string;
  };
}

interface Milestone {
  title: string;
  description: string;
  price: number;
}

async function getSolution(idOrSlug: string) {
  try {
    let s = await prisma.solution.findUnique({
      where: { id: idOrSlug },
      include: {
        expert: { include: { user: { select: { profileImageUrl: true } } } },
      },
    });

    if (!s) {
      s = await prisma.solution.findUnique({
        where: { slug: idOrSlug },
        include: {
          expert: { include: { user: { select: { profileImageUrl: true } } } },
        },
      });
    }

    if (!s) return null;

    // Map Prisma result to Solution interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      ...s,
      implementation_price: s.implementationPriceCents / 100,
      monthly_cost_min: s.monthlyCostMinCents ? s.monthlyCostMinCents / 100 : 0,
      monthly_cost_max: s.monthlyCostMaxCents ? s.monthlyCostMaxCents / 100 : 0,
      delivery_days: s.deliveryDays,
      support_days: s.supportDays,
      short_summary: s.shortSummary,
      milestones: (s.milestones as unknown as Milestone[]) || [],
      demoPrice: s.demoPriceCents ? s.demoPriceCents / 100 : 2,
      expert: mapPrismaExpert(s.expert),
      // Ensure businessGoals is mapped if it exists
      businessGoals: s.businessGoals || [],
      skills:
        (s.skills as unknown as { name: string; description: string }[]) || [],
    } as unknown as Solution & { milestones: Milestone[] };
  } catch (e) {
    log.error("Error fetching solution", { error: e });
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const solution = await getSolution(params.id);
  if (!solution) return { title: "Solution Not Found" };
  const url = `https://${BRAND_DOMAIN}/solutions/${params.id}`;
  const description =
    solution.short_summary ||
    solution.description ||
    `${solution.title} on ${BRAND_NAME}`;
  return {
    title: `${solution.title} | ${BRAND_NAME}`,
    description,
    openGraph: {
      title: `${solution.title} | ${BRAND_NAME}`,
      description,
      url,
      siteName: BRAND_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${solution.title} | ${BRAND_NAME}`,
      description,
    },
    alternates: { canonical: url },
    keywords: [
      solution.title,
      solution.category,
      "AI automation",
      "business automation",
      ...(solution.integrations || []).slice(0, 5),
    ].filter(Boolean),
  };
}

// --- Client Component Wrapper for Payment ---
import { PaymentButton } from "@/components/PaymentButton";
// ---

export default async function SolutionPage({ params }: PageProps) {
  const solution = await getSolution(params.id);

  if (!solution) {
    notFound();
  }

  // If this solution has a newer published version, redirect to it
  const newerVersion = await prisma.solution.findFirst({
    where: {
      parentId: solution.id,
      status: "published",
      OR: [
        { moderationStatus: "auto_approved" },
        { moderationStatus: "approved" },
      ],
    },
    select: { id: true },
    orderBy: { version: "desc" },
  });

  if (newerVersion) {
    redirect(`/solutions/${newerVersion.id}`);
  }

  const versionHistory = await getVersionChain(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (solution as any).version ?? 1,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (solution as any).changelog ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (solution as any).parentId ?? null,
  );

  const ecosystems = await getEcosystemsForSolution(solution.id);
  const isPartOfStack = ecosystems.length > 0;

  // Hide payment/demo buttons if the logged-in user is the expert who owns this solution
  const session = await getServerSession(authOptions);
  const isOwnSolution =
    !!session?.user?.id &&
    !!solution.expert?.user_id &&
    session.user.id === solution.expert.user_id;

  // Fetch real similar solutions from DB (same category, exclude current, published only)
  const similarRaw = await prisma.solution.findMany({
    where: {
      status: "published",
      category: solution.category,
      id: { not: solution.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { expert: true },
  });
  // If not enough in same category, fill up with any other published solutions
  const similarFromOther =
    similarRaw.length < 3
      ? await prisma.solution.findMany({
          where: {
            status: "published",
            id: { notIn: [solution.id, ...similarRaw.map((s) => s.id)] },
          },
          orderBy: { publishedAt: "desc" },
          take: 3 - similarRaw.length,
          include: { expert: true },
        })
      : [];
  const similarSolutions = [...similarRaw, ...similarFromOther].map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    category: s.category,
    implementation_price: s.implementationPriceCents / 100,
    short_summary: s.shortSummary || "",
    outcome: s.outcome || "",
    expertName: s.expert?.displayName || s.expert?.legalFullName || "Expert",
  }));

  return (
    <div className="min-h-screen pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: solution.title,
            description: solution.short_summary || solution.description,
            url: `https://logiclot.io/solutions/${solution.id}`,
            brand: {
              "@type": "Organization",
              name: "LogicLot",
            },
            category: solution.category,
            offers: {
              "@type": "Offer",
              price: solution.implementation_price,
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              seller: solution.expert
                ? {
                    "@type": "Person",
                    name: solution.expert.name,
                  }
                : undefined,
            },
            ...(solution.faq && solution.faq.length > 0
              ? {
                  subjectOf: {
                    "@type": "FAQPage",
                    mainEntity: solution.faq.map(
                      (item: { question: string; answer: string }) => ({
                        "@type": "Question",
                        name: item.question,
                        acceptedAnswer: {
                          "@type": "Answer",
                          text: item.answer,
                        },
                      }),
                    ),
                  },
                }
              : {}),
          }),
        }}
      />
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
                item: "https://logiclot.io",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Solutions",
                item: "https://logiclot.io/solutions",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: solution.title,
                item: `https://logiclot.io/solutions/${solution.id}`,
              },
            ],
          }),
        }}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Back to Browse */}
        <BackToBrowse />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. Title + Meta */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={solution.category} size="md" />
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  v{solution.version || 1}.0
                </span>
                {isPartOfStack && (
                  <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Part of a suite
                  </span>
                )}
                {solution.is_vetted && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                    <Award className="h-3 w-3" /> Vetted Expert
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {solution.title}
              </h1>

              {/* Quick-glance stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-secondary/10 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                    Business Goal
                  </p>
                  <p className="font-medium text-sm text-foreground leading-snug">
                    {solution.businessGoals?.[0] || "Operational efficiency"}
                  </p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                    Est. Impact
                  </p>
                  <p className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
                    {solution.outcome || "Reduces manual work"}
                  </p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                    Delivery
                  </p>
                  <p className="font-medium text-sm text-foreground">
                    {solution.delivery_days} days
                  </p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                    Support
                  </p>
                  <p className="font-medium text-sm text-foreground">
                    {solution.support_days || 30} days
                  </p>
                </div>
              </div>

              {/* Tools */}
              {solution.integrations.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {solution.integrations.map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground"
                    >
                      <Zap className="h-3 w-3 text-yellow-500" /> {tool}
                    </div>
                  ))}
                </div>
              )}

              {/* Version History — one chapter per version that has a changelog */}
              {versionHistory.length > 0 && (
                <div className="space-y-3">
                  {versionHistory.map(({ version: v, changelog: log }) => (
                    <div
                      key={v}
                      className="p-4 bg-primary/5 border border-primary/15 rounded-lg text-sm"
                    >
                      <p className="font-bold mb-1 flex items-center gap-2 text-foreground">
                        <Info className="w-4 h-4 text-primary" /> v{v}.0 Updates
                      </p>
                      <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                        {log}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Demo Video (if available) */}
            <DemoVideoSection solution={solution} />

            {/* 3. Description */}
            <div className="prose prose-slate max-w-none text-foreground/80 leading-relaxed whitespace-pre-line text-base break-words">
              {solution.longDescription || solution.description}
            </div>

            {/* 3.5. Skills */}
            {solution.skills && solution.skills.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Skills
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  The AI behind this solution is trained with these specific
                  skills so it performs better and more reliably for your use
                  case.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {solution.skills.map((skill, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground">
                          {skill.name}
                        </p>
                        {skill.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {skill.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Key Outcomes */}
            {solution.outline &&
              solution.outline.filter((l) => l.trim()).length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Key Outcomes</h2>
                  <ul className="space-y-3">
                    {solution.outline
                      .filter((l) => l.trim())
                      .slice(0, 3)
                      .map((line, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-foreground/80"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{line}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

            {/* 5. Part of a Suite */}
            {isPartOfStack && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" /> Part of a suite
                </h2>
                <WorksBestWith ecosystems={ecosystems} />
              </section>
            )}

            {/* 6. Project Roadmap */}
            {solution.milestones && solution.milestones.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-6">Project Roadmap</h2>
                <div className="space-y-4 relative before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-border/50">
                  {solution.milestones.map((m, i) => (
                    <div key={i} className="relative flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-background border-2 border-primary/30 text-primary text-sm font-bold flex items-center justify-center shrink-0 z-10">
                        {i + 1}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-base">{m.title}</h4>
                          <span className="font-semibold text-sm text-foreground ml-4 shrink-0">
                            €{m.price.toLocaleString("de-DE")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total project value
                  </span>
                  <span className="font-bold text-lg">
                    €{solution.implementation_price.toLocaleString("de-DE")}
                  </span>
                </div>
              </section>
            )}

            {/* 7. Scope — What's included + What we'll need from you (merged) */}
            <section className="border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                {/* What's included */}
                <div className="p-6">
                  <h3 className="font-semibold text-base mb-4">
                    What&apos;s included
                  </h3>
                  <ul className="space-y-2.5">
                    {(solution.included && solution.included.length > 0
                      ? solution.included
                      : [
                          "Fully configured automation workflow",
                          "Video walkthrough & documentation",
                        ]
                    ).map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                    {/* Platform guarantees always shown */}
                    <li className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {solution.support_days || 30} days post-delivery support
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Approval required before funds release
                    </li>
                  </ul>
                </div>

                {/* What we'll need from you */}
                <div className="p-6 bg-secondary/5">
                  <h3 className="font-semibold text-base mb-4">
                    What we&apos;ll need from you
                  </h3>
                  {solution.requiredInputs &&
                  solution.requiredInputs.length > 0 ? (
                    <ul className="space-y-2.5">
                      {solution.requiredInputs.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-foreground/80"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Details confirmed after purchase or demo call.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 8. Reviews */}
            <section>
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <div className="flex justify-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-muted-foreground/25"
                    />
                  ))}
                </div>
                <p className="font-medium text-foreground mb-1">
                  No reviews yet
                </p>
                <p className="text-sm text-muted-foreground mb-5">
                  Reviews appear after project delivery.
                </p>
                {!isOwnSolution && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href={`/messages/new?expert=${solution.expert?.id}&solution=${solution.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <MessageSquare className="h-4 w-4" /> Ask a question
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* 9. FAQ */}
            {solution.faq && solution.faq.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {solution.faq.map((item, i) => (
                    <details
                      key={i}
                      className="group border border-border rounded-lg"
                    >
                      <summary className="flex items-center justify-between p-4 font-medium cursor-pointer list-none text-sm">
                        {item.question}
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 text-muted-foreground" />
                      </summary>
                      <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24 space-y-6">
              {/* Action Card */}
              <div
                id="action-card"
                className="bg-card border border-border rounded-xl p-6 shadow-lg"
              >
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Project Price
                  </p>
                  <div className="text-4xl font-bold text-foreground">
                    €{solution.implementation_price.toLocaleString("de-DE")}
                  </div>

                  {solution.milestones && solution.milestones.length > 0 && (
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        To Start Now
                      </p>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-medium">Milestone 1</span>
                        <span className="text-xl font-bold text-foreground">
                          €
                          {solution.milestones[0].price.toLocaleString("de-DE")}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Funds held in escrow until approved.
                      </p>
                    </div>
                  )}
                </div>

                {(solution.monthly_cost_min > 0 ||
                  solution.monthly_cost_max > 0) && (
                  <div className="mb-6 p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <div className="flex items-start gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          Est. Monthly Tool Costs
                        </p>
                        <p className="text-sm font-semibold text-foreground/80">
                          €{solution.monthly_cost_min} – €
                          {solution.monthly_cost_max} / mo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {!isOwnSolution && (
                    <PaymentButton
                      solutionId={solution.id}
                      title="Fund Milestone 1"
                    />
                  )}

                  {/* Paid Demo CTA — only shown if expert has a calendar linked */}
                  {!isOwnSolution && solution.expert?.calendarUrl && (
                    <div className="pt-2">
                      <Link
                        href={`/messages/new?expert=${solution.expert?.id}&solution=${solution.id}&type=demo`}
                        className="w-full text-center border border-border bg-background hover:bg-secondary/50 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 text-foreground"
                      >
                        <PlayCircle className="h-4 w-4" /> See this live — €
                        {(solution as { demoPrice?: number }).demoPrice ?? 2}{" "}
                        demo
                      </Link>
                      <p className="text-[10px] text-muted-foreground text-center mt-2 px-2 leading-tight">
                        15&ndash;20 min walkthrough. No access required.
                      </p>
                    </div>
                  )}
                  {!isOwnSolution && (
                    <Link
                      href={`/messages/new?expert=${solution.expert?.id}&solution=${solution.id}`}
                      className="block w-full text-center text-xs text-muted-foreground hover:text-primary hover:underline py-2"
                    >
                      Ask a question
                    </Link>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
                    Escrow Protected
                  </h4>
                  <ol className="space-y-4 relative border-l border-border/50 ml-1.5 pl-4">
                    <li className="text-xs text-muted-foreground relative">
                      <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-secondary border border-border" />
                      <span className="font-medium text-foreground block mb-0.5">
                        Secure Checkout
                      </span>
                      You fund only the first milestone.
                    </li>
                    <li className="text-xs text-muted-foreground relative">
                      <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-secondary border border-border" />
                      <span className="font-medium text-foreground block mb-0.5">
                        Expert Delivers
                      </span>
                      Work is submitted for your review.
                    </li>
                    <li className="text-xs text-muted-foreground relative">
                      <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-secondary border border-border" />
                      <span className="font-medium text-foreground block mb-0.5">
                        You Approve
                      </span>
                      Funds are released. Next milestone starts.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Expert Card */}
              {solution.expert && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-lg relative shrink-0 overflow-hidden">
                      {solution.expert.profile_image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={solution.expert.profile_image_url}
                          alt={solution.expert.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        solution.expert.name.substring(0, 2).toUpperCase()
                      )}
                      {solution.expert.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                          <ShieldCheck className="h-3 w-3 text-blue-400 fill-blue-400/10" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {solution.expert.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {solution.expert.completed_sales_count} implementations
                      </div>
                      {(solution.expert.founding ||
                        (solution.expert.tier &&
                          solution.expert.tier !== "STANDARD")) && (
                        <div className="mt-1.5">
                          <TierBadge
                            tier={
                              (solution.expert.tier || "STANDARD") as
                                | "STANDARD"
                                | "PROVEN"
                                | "ELITE"
                                | "FOUNDING"
                            }
                            isFoundingExpert={solution.expert.founding}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {!isOwnSolution && (
                      <Link
                        href={`/messages/new?expert=${solution.expert.id}&solution=${solution.id}`}
                        className="w-full text-center border border-border bg-background hover:bg-secondary/50 py-2 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2 text-foreground"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Message Expert
                      </Link>
                    )}
                    <Link
                      href={`/experts/${solution.expert.slug}`}
                      className="text-xs text-primary hover:underline block text-center"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Solutions */}
      {!isOwnSolution && <SimilarSolutions solutions={similarSolutions} />}
    </div>
  );
}
