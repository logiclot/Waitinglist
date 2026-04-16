import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardList, ShieldCheck, Clock } from "lucide-react";

import { Hero } from "@/components/ui/hero-section";
import { TrustCarousel } from "@/components/marketing/TrustCarousel";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeaturedArticles } from "@/components/marketing/FeaturedArticles";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { RandomSolutions } from "@/components/marketing/RandomSolutions";
import { FounderNote } from "@/components/marketing/FounderNote";
import { AuditQuiz } from "@/components/audit/AuditQuiz";
import { HireVsAutomateCarousel } from "@/components/marketing/HireVsAutomateCarousel";
import { GlowBorder } from "@/components/ui/glow-border";
import { Footer } from "@/components/Footer";

import {
  getAllLandingPageSlugs,
  getLandingPageBySlug,
} from "@/sanity/lib/landingPage";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllLandingPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getLandingPageBySlug(params.slug);
  if (!page) return { title: "LogicLot" };

  const title = page.metaTitle || page.heroHeadline;
  const description = page.metaDescription || page.heroSubheading;
  const canonical = `https://logiclot.io/l/${page.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "LogicLot",
      type: "website",
      images: [
        {
          url: "https://logiclot.io/og-image.png",
          width: 1200,
          height: 630,
          alt: "LogicLot | Automation Marketplace",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://logiclot.io/og-image.png"],
    },
    robots: page.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical },
  };
}

export default async function LandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getLandingPageBySlug(params.slug);
  if (!page) notFound();

  return (
    <main className="min-h-screen flex flex-col">
      <Hero
        headline={page.heroHeadline}
        subheading={page.heroSubheading}
        trustStats={page.trustStats ?? undefined}
        worksWith={page.worksWith ?? undefined}
        searchPlaceholder={page.searchPlaceholder ?? undefined}
        ctaLabel={page.ctaLabel ?? undefined}
      />
      <TrustCarousel />
      <RandomSolutions />
      <CategoryGrid />

      {/* Inline Audit + Hire vs. Automate Section */}
      <section className="bg-[#FBFAF8] border-b border-border py-14 md:py-20">
        <div className="container mx-auto px-4 xl:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10 lg:gap-0 items-stretch">
            <div className="mx-auto lg:mx-0 w-full flex flex-col min-w-0 lg:pr-12">
              <div className="text-center lg:text-left mb-8">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3">
                  Free Automation Audit
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
                  Where is your business losing time?
                </h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                  5 questions. Find out what&apos;s costing you the most and
                  whether automation is worth it for your stage of growth.
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-5 flex-wrap mt-4">
                  {[
                    { icon: Clock, label: "2 minutes" },
                    { icon: ShieldCheck, label: "No account needed" },
                    { icon: ClipboardList, label: "Instant report" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <GlowBorder accentColor="#111827" backgroundColor="#FBFAF8">
                <AuditQuiz newTab />
              </GlowBorder>
            </div>

            <div className="hidden lg:block w-px bg-border" />

            <div className="mx-auto lg:mx-0 w-full flex flex-col min-w-0 lg:pl-12">
              <HireVsAutomateCarousel />
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <FeaturedArticles />
      <FounderNote />
      <Footer />
    </main>
  );
}
