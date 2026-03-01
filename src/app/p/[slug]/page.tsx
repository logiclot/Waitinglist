import { notFound } from "next/navigation";
import { CalendarDays, Zap, ArrowRight, Star } from "lucide-react";
import { getExpertPortfolio } from "@/actions/portfolio";
import { getExpertPublicReviews } from "@/actions/reviews";
import { TierBadge } from "@/components/ui/TierBadge";
import { ExpertReviewsSummary } from "@/components/reviews/ExpertReviewsSummary";
import { StarRating } from "@/components/reviews/StarRating";
import { BRAND_NAME } from "@/lib/branding";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const expert = await getExpertPortfolio(params.slug);
  if (!expert) {
    return { title: `Expert Not Found | ${BRAND_NAME}` };
  }
  return {
    title: `${expert.displayName} — Automation Expert | ${BRAND_NAME}`,
    description: expert.bio ?? `View ${expert.displayName}'s automation solutions on ${BRAND_NAME}.`,
  };
}

export default async function ExpertPortfolioPage({ params }: Props) {
  const expert = await getExpertPortfolio(params.slug);
  if (!expert) notFound();

  const reviewData = await getExpertPublicReviews(expert.id);

  const {
    displayName,
    bio,
    tools,
    calendarUrl,
    profileImageUrl,
    tier,
    isFoundingExpert,
    solutions,
  } = expert;

  // Compute initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top accent line ─────────────────────────────────────────────────── */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

      {/* ── Public header ───────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-foreground tracking-tight">Expert Portfolio</span>
          </div>
          <a
            href="/auth/sign-up?role=expert"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold transition-colors hover:bg-primary/90 shrink-0"
          >
            Join as Expert <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Hero / Profile card ─────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-primary/8 via-primary/3 to-background border border-border/60 rounded-2xl p-8 mb-10 overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/6 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start gap-6 relative">
            {/* Avatar */}
            {profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImageUrl}
                alt={displayName}
                className="w-24 h-24 rounded-2xl object-cover shrink-0 border-2 border-primary/20 shadow-lg shadow-primary/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 text-white text-3xl font-bold select-none">
                {initials}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Name + badges row */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground leading-tight">{displayName}</h1>
                {(tier !== "STANDARD" || isFoundingExpert) && (
                  <TierBadge
                    tier={tier}
                    isFoundingExpert={isFoundingExpert}
                    size="md"
                  />
                )}
              </div>

              {/* Stats row: rating + solution count */}
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                {reviewData.totalCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarRating value={Math.round(reviewData.averageRating)} readonly size="sm" />
                    <span className="text-sm font-medium text-foreground">{reviewData.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({reviewData.totalCount} review{reviewData.totalCount !== 1 ? "s" : ""})</span>
                  </div>
                )}
                {solutions.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {solutions.length} published automation{solutions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>

              {bio && (
                <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mb-4">{bio}</p>
              )}

              {/* Tool chips */}
              {tools.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {tools.map((tool: string) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background border border-border text-xs font-medium text-foreground shadow-sm"
                    >
                      <Zap className="w-3 h-3 text-yellow-500" />
                      {tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Book a Call CTA */}
              {calendarUrl && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                >
                  <CalendarDays className="w-4 h-4" />
                  Book a Free Call
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Verified Reviews ──────────────────────────────────────────────── */}
        <ExpertReviewsSummary
          reviews={reviewData.reviews}
          averageRating={reviewData.averageRating}
          totalCount={reviewData.totalCount}
        />

        {/* ── Solutions grid ──────────────────────────────────────────────────── */}
        {solutions.length > 0 ? (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Published Solutions
              </h2>
              <span className="bg-primary/10 text-primary text-sm font-bold px-2.5 py-0.5 rounded-full">
                {solutions.length}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutions.map((sol: {
                id: string;
                category: string;
                title: string;
                shortSummary?: string | null;
                integrations: string[];
                implementationPriceCents: number;
                deliveryDays: number;
              }) => (
                <a
                  key={sol.id}
                  href={`/solutions/${sol.id}`}
                  className="group bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  {/* Category chip */}
                  <span className="self-start text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded mb-3">
                    {sol.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {sol.title}
                  </h3>

                  {/* Summary */}
                  {sol.shortSummary && (
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3 mb-3">
                      {sol.shortSummary}
                    </p>
                  )}

                  {/* Tool chips */}
                  {sol.integrations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
                      {sol.integrations.slice(0, 4).map((t: string) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground border border-border"
                        >
                          {t}
                        </span>
                      ))}
                      {sol.integrations.length > 4 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground border border-border">
                          +{sol.integrations.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer row */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-lg font-bold text-foreground">
                      €{(sol.implementationPriceCents / 100).toLocaleString("de-DE")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {sol.deliveryDays}d delivery
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">No published solutions yet.</p>
          </div>
        )}

        {/* ── Footer CTA ──────────────────────────────────────────────────────── */}
        <div className="mt-16 bg-gradient-to-br from-primary/6 to-background border border-border/60 rounded-2xl p-10 text-center">
          <p className="text-lg font-bold text-foreground mb-2">
            Looking for a custom automation?
          </p>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Browse hundreds of ready-to-deploy automation solutions built by verified experts.
          </p>
          <a
            href="/solutions"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-primary/90 shadow-md shadow-primary/20"
          >
            Browse all solutions on {BRAND_NAME}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </main>
    </div>
  );
}
