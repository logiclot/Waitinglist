import { notFound } from "next/navigation";
import { getEcosystemBySlug } from "@/actions/ecosystems";
import { StackCTA } from "@/components/ecosystems/StackCTA";
import { SuiteDetailSolutionCard } from "@/components/ecosystems/SuiteDetailSolutionCard";
import { HelpCircle, Layers, Shield, Tag, Wrench } from "lucide-react";
import { formatCentsToCurrency } from "@/lib/commission";
import Link from "next/link";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const ecosystem = await getEcosystemBySlug(params.slug);
  if (!ecosystem) return { title: "Stack Not Found" };
  return {
    title: `${ecosystem.title} | LogicLot Suites`,
    description: ecosystem.shortPitch,
  };
}

export default async function StackDetailPage({ params }: PageProps) {
  const ecosystem = await getEcosystemBySlug(params.slug);

  if (!ecosystem || !ecosystem.isPublished) {
    notFound();
  }

  // Compute partner experts for attribution
  const uniquePartners = new Map<string, { id: string; displayName: string; slug: string }>();
  for (const item of ecosystem.items) {
    const expert = item.solution.expert;
    if (expert && expert.id !== ecosystem.expertId) {
      uniquePartners.set(expert.id, expert);
    }
  }
  const partnerExperts = Array.from(uniquePartners.values());
  const hasPartners = partnerExperts.length > 0;

  // Bundle discount & extended support computations
  const totalPriceCents = ecosystem.items.reduce(
    (sum: number, item: { solution: { implementationPriceCents: number } }) =>
      sum + item.solution.implementationPriceCents,
    0
  );
  const hasBundleDiscount =
    ecosystem.bundlePriceCents != null &&
    ecosystem.bundlePriceCents < totalPriceCents;
  const savingsCents = hasBundleDiscount
    ? totalPriceCents - ecosystem.bundlePriceCents!
    : 0;
  const savingsPercent = hasBundleDiscount
    ? Math.round((savingsCents / totalPriceCents) * 100)
    : 0;
  const hasExtendedSupport =
    ecosystem.extSupport6mCents != null ||
    ecosystem.extSupport12mCents != null;

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-b from-secondary/40 to-secondary/10 border-b border-border py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Solution Suite
              </span>
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Layers className="w-4 h-4" /> {ecosystem.items.length} Solutions
              </span>
              {hasPartners && (
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  {partnerExperts.length + 1} Experts
                </span>
              )}
              {!hasPartners && ecosystem.items.length > 1 && (
                <span className="relative group/badge" title="Single Provider">
                  <Shield className="w-5 h-5 text-amber-500 fill-amber-100" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] font-semibold text-white bg-neutral-800 rounded whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none">
                    Single Provider
                  </span>
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{ecosystem.title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {ecosystem.shortPitch}
            </p>

            {/* Info pills */}
            <div className="mt-6 flex flex-wrap gap-3 max-w-2xl">
              {!hasPartners && ecosystem.items.length > 1 && (
                <div className="inline-flex items-center gap-2 bg-neutral-900 text-white/90 rounded-lg px-4 py-2.5">
                  <Shield className="w-4 h-4 text-white/70 shrink-0" />
                  <span className="text-sm font-medium">
                    Single provider &mdash; delivered by {ecosystem.expert.displayName}
                  </span>
                </div>
              )}
              {hasBundleDiscount && (
                <div className="inline-flex items-center gap-2 bg-neutral-900 text-white/90 rounded-lg px-4 py-2.5">
                  <Tag className="w-4 h-4 text-white/70 shrink-0" />
                  <span className="text-sm font-medium">
                    Save {formatCentsToCurrency(savingsCents)} ({savingsPercent}% off) as a bundle
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">

            {/* Included Solutions */}
            <section>
              <h2 className="text-2xl font-bold mb-2">Included Solutions</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Click any solution to expand details, demo video, and scope.
              </p>
              <div className="space-y-8">
                {ecosystem.items.map((item, index) => (
                  <SuiteDetailSolutionCard
                    key={item.id}
                    item={item}
                    index={index}
                    ecosystemExpertId={ecosystem.expertId}
                    isLast={index === ecosystem.items.length - 1}
                  />
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl font-bold mb-6">FAQ before you buy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border p-4 rounded-lg">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" /> Can I buy just one?
                  </h4>
                  <p className="text-sm text-muted-foreground">Yes. You can buy any solution individually or the full suite. We recommend starting with Step 1.</p>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" /> How does the demo work?
                  </h4>
                  <p className="text-sm text-muted-foreground">The expert will show you the full suite running in their environment before you grant any access.</p>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" /> Is there a discount?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {hasBundleDiscount
                      ? `Yes! This suite includes a ${savingsPercent}% bundle discount — you save ${formatCentsToCurrency(savingsCents)} compared to buying each solution individually.`
                      : "Experts often provide better support and integration when you use their recommended suite."}
                  </p>
                </div>
                {hasPartners && (
                  <div className="bg-card border border-border p-4 rounded-lg">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary" /> Multiple experts?
                    </h4>
                    <p className="text-sm text-muted-foreground">This suite includes solutions from multiple experts. Each solution is purchased from and delivered by its listed expert.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Extended Support Section */}
            {hasExtendedSupport && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Wrench className="w-6 h-6 text-primary" /> Extended Support
                </h2>
                <p className="text-muted-foreground mb-6">
                  Keep your automation running smoothly with ongoing expert support beyond the standard delivery period.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ecosystem.extSupport6mCents != null && (
                    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        6-Month Support
                      </div>
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {formatCentsToCurrency(ecosystem.extSupport6mCents)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCentsToCurrency(Math.round(ecosystem.extSupport6mCents / 6))}/month
                      </div>
                    </div>
                  )}
                  {ecosystem.extSupport12mCents != null && (
                    <div className="bg-card border-2 border-primary/30 rounded-xl p-6 relative">
                      <span className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Best Value
                      </span>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        12-Month Support
                      </div>
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {formatCentsToCurrency(ecosystem.extSupport12mCents)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCentsToCurrency(Math.round(ecosystem.extSupport12mCents / 12))}/month
                      </div>
                    </div>
                  )}
                </div>

                {ecosystem.extSupportDescription && (
                  <div className="mt-4 bg-secondary/30 border border-border rounded-lg p-4">
                    <h4 className="font-bold text-sm mb-2">What&apos;s Included</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {ecosystem.extSupportDescription}
                    </p>
                  </div>
                )}
              </section>
            )}

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <StackCTA
                ecosystem={ecosystem}
                bundlePriceCents={ecosystem.bundlePriceCents}
                extSupport6mCents={ecosystem.extSupport6mCents}
                extSupport12mCents={ecosystem.extSupport12mCents}
              />

              <div>
                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                  {hasPartners ? "Contributing Experts" : !hasPartners && ecosystem.items.length > 1 ? "Your Delivery Team" : "Created by"}
                </h4>
                <div className="space-y-3">
                  {/* Single provider narrative card */}
                  {!hasPartners && ecosystem.items.length > 1 && (
                    <div className="bg-neutral-900 text-white rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Shield className="w-4 h-4 text-white/70" />
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Single Provider</span>
                      </div>
                      <p className="text-xs text-white/60">
                        All {ecosystem.items.length} solutions delivered by one team. Single point of contact throughout the project.
                      </p>
                    </div>
                  )}
                  {/* Suite owner */}
                  <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">
                      {ecosystem.expert.displayName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{ecosystem.expert.displayName}</div>
                      <Link href={`/experts/${ecosystem.expert.slug}`} className="text-xs text-primary hover:underline">
                        {hasPartners ? "Suite Owner" : "View Profile"}
                      </Link>
                    </div>
                  </div>
                  {/* Partner experts */}
                  {partnerExperts.map((pe) => (
                    <div key={pe.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">
                        {pe.displayName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{pe.displayName}</div>
                        <Link href={`/experts/${pe.slug}`} className="text-xs text-primary hover:underline">
                          Contributing Expert
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
