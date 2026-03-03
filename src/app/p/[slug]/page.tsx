import { notFound } from "next/navigation";
import { MessageCircle, Zap, ArrowRight, Star, Pin, Lock } from "lucide-react";
import { getExpertPortfolio } from "@/actions/portfolio";
import { getExpertPublicReviews } from "@/actions/reviews";
import { TierBadge } from "@/components/ui/TierBadge";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ExpertReviewsSummary } from "@/components/reviews/ExpertReviewsSummary";
import { StarRating } from "@/components/reviews/StarRating";
import { GlowBorder } from "@/components/ui/glow-border";
import { PortfolioCustomizer } from "@/components/portfolio/PortfolioCustomizer";
import { PortfolioViewTracker } from "@/components/portfolio/PortfolioViewTracker";
import { PortfolioViewCount } from "@/components/portfolio/PortfolioViewCount";
import { getPageBackgroundStyles, getFontConfig, isDarkBackground } from "@/lib/portfolio-customization";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  const [expert, session] = await Promise.all([
    getExpertPortfolio(params.slug),
    getServerSession(authOptions),
  ]);
  if (!expert) notFound();

  const reviewData = await getExpertPublicReviews(expert.id);

  const isOwner = session?.user?.id === expert.userId;

  const {
    displayName,
    bio,
    tools,
    profileImageUrl,
    tier,
    isFoundingExpert,
    solutions,
    featuredSolutionIds,
    portfolioViewCount,
    portfolioBackground,
    portfolioBorderColor,
    portfolioFont,
    portfolioCoverImage,
    portfolioBackgroundColor,
    portfolioPatternColor,
  } = expert;

  // Dynamic styling
  const pageBg = getPageBackgroundStyles(portfolioBackground, portfolioPatternColor);
  const font = getFontConfig(portfolioFont);
  const hasCover = !!portfolioCoverImage;
  const darkPage = isDarkBackground(portfolioBackgroundColor);
  const canCustomize = solutions.length >= 3;

  // Compute initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={pageBg.className}
      style={{
        ...(pageBg.style || {}),
        ...(font.fontFamily ? { fontFamily: font.fontFamily } : {}),
        ...(portfolioBackgroundColor ? { backgroundColor: portfolioBackgroundColor } : {}),
      }}
    >
      {/* Google Font link when non-default font is selected */}
      {font.googleFontUrl && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={font.googleFontUrl} />
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <PortfolioViewTracker slug={expert.slug} isOwner={isOwner} />

        {/* ── Hero / Profile card ─────────────────────────────────────────────── */}
        <GlowBorder
          accentColor={portfolioBorderColor || "#8DC63F"}
          backgroundColor="hsl(var(--card))"
          borderRadius="1rem"
          className="mb-10"
        >
          <div className="relative rounded-2xl overflow-hidden">
            {/* Cover image background */}
            {hasCover && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portfolioCoverImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20 z-[1]" />
              </>
            )}

            <div className={`relative z-[2] p-8 ${hasCover ? "" : "bg-gradient-to-br from-primary/8 via-primary/3 to-background"}`}>
              {/* Owner-only personalize button */}
              {isOwner && (
                <div className="absolute top-4 right-4 z-10">
                  {canCustomize ? (
                    <PortfolioCustomizer
                      currentBio={bio}
                      currentBackground={portfolioBackground}
                      currentBorderColor={portfolioBorderColor}
                      currentFont={portfolioFont}
                      currentCoverImage={portfolioCoverImage}
                      currentBackgroundColor={portfolioBackgroundColor}
                      currentPatternColor={portfolioPatternColor}
                      currentFeaturedSolutionIds={featuredSolutionIds}
                      solutions={solutions.map((s) => ({ id: s.id, title: s.title }))}
                    />
                  ) : (
                    <div
                      className="inline-flex items-center gap-1.5 border border-border bg-background/80 backdrop-blur text-muted-foreground px-3 py-2 rounded-lg text-sm font-medium cursor-default"
                      title="Publish 3 solutions to unlock customization"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Personalize
                      <span className="text-[10px] ml-1 bg-muted px-1.5 py-0.5 rounded">
                        {solutions.length}/3
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Decorative background blob (only when no cover) */}
              {!hasCover && (
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/6 rounded-full blur-3xl pointer-events-none" />
              )}

              <div className="flex flex-col sm:flex-row items-start gap-6 relative">
                {/* Avatar */}
                {profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImageUrl}
                    alt={displayName}
                    className={`w-24 h-24 rounded-2xl object-cover shrink-0 border-2 shadow-lg ${
                      hasCover
                        ? "border-white/30 shadow-black/20"
                        : "border-primary/20 shadow-primary/10"
                    }`}
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-3xl font-bold select-none ${
                    hasCover
                      ? "bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 shadow-black/20"
                      : "bg-gradient-to-br from-primary to-primary/60 text-white shadow-primary/20"
                  }`}>
                    {initials}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Name + badges row */}
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className={`text-4xl font-bold leading-tight ${hasCover ? "text-white" : "text-foreground"}`}>
                      {displayName}
                    </h1>
                    {(tier !== "STANDARD" || isFoundingExpert) && (
                      <TierBadge
                        tier={tier}
                        isFoundingExpert={isFoundingExpert}
                        size="md"
                      />
                    )}
                  </div>

                  {/* Stats row: rating + solution count + owner view count */}
                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                    {reviewData.totalCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <StarRating value={Math.round(reviewData.averageRating)} readonly size="sm" />
                        <span className={`text-sm font-medium ${hasCover ? "text-white" : "text-foreground"}`}>
                          {reviewData.averageRating.toFixed(1)}
                        </span>
                        <span className={`text-sm ${hasCover ? "text-white/70" : "text-muted-foreground"}`}>
                          ({reviewData.totalCount} review{reviewData.totalCount !== 1 ? "s" : ""})
                        </span>
                      </div>
                    )}
                    {solutions.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className={`text-sm font-medium ${hasCover ? "text-white/80" : "text-muted-foreground"}`}>
                          {solutions.length} published automation{solutions.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {bio && (
                    <p className={`text-base leading-relaxed max-w-2xl mb-4 ${hasCover ? "text-white/80" : "text-muted-foreground"}`}>
                      {bio}
                    </p>
                  )}

                  {/* Tool chips */}
                  {tools.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {tools.map((tool: string) => (
                        <span
                          key={tool}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
                            hasCover
                              ? "bg-white/15 backdrop-blur-sm border border-white/20 text-white"
                              : "bg-background border border-border text-foreground"
                          }`}
                        >
                          <Zap className="w-3 h-3 text-yellow-500" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message CTA */}
                  {!isOwner && (
                    <a
                      href={`/messages/new?expert=${expert.id}`}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </a>
                  )}
                </div>
              </div>

              {/* Owner-only view count — bottom right */}
              {isOwner && (
                <div className="absolute bottom-3 right-4">
                  <PortfolioViewCount count={portfolioViewCount} hasCover={hasCover} />
                </div>
              )}
            </div>
          </div>
        </GlowBorder>

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
              <h2 className={`text-2xl font-bold ${darkPage ? "text-white" : "text-foreground"}`}>
                Solutions
              </h2>
              <span className="bg-primary/10 text-primary text-sm font-bold px-2.5 py-0.5 rounded-full">
                {solutions.length}
              </span>
              <div className={`flex-1 h-px ${darkPage ? "bg-white/20" : "bg-border"}`} />
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
                <GlowBorder
                  key={sol.id}
                  accentColor={portfolioBorderColor || "#8DC63F"}
                  backgroundColor="hsl(var(--card))"
                  borderRadius="1rem"
                  className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <a
                    href={`/solutions/${sol.id}`}
                    className="bg-card rounded-2xl p-6 flex flex-col h-full"
                  >
                    {/* Category + Featured badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <CategoryBadge category={sol.category} size="sm" />
                      {featuredSolutionIds.includes(sol.id) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          <Pin className="w-2.5 h-2.5" />
                          Featured
                        </span>
                      )}
                    </div>

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
                </GlowBorder>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-20">
            <p className={`text-sm ${darkPage ? "text-white/60" : "text-muted-foreground"}`}>No published solutions yet.</p>
          </div>
        )}

        {/* ── Footer CTA ──────────────────────────────────────────────────────── */}
        <div className={`mt-16 rounded-2xl p-10 text-center ${darkPage ? "bg-white/5 border border-white/10" : "bg-gradient-to-br from-primary/6 to-background border border-border/60"}`}>
          <p className={`text-lg font-bold mb-2 ${darkPage ? "text-white" : "text-foreground"}`}>
            Looking for a custom automation?
          </p>
          <p className={`text-sm mb-6 max-w-md mx-auto ${darkPage ? "text-white/60" : "text-muted-foreground"}`}>
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
