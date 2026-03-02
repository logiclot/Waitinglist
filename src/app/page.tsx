import type { Metadata } from "next";
import { Hero } from "@/components/ui/hero-section";
import { TrustCarousel } from "@/components/marketing/TrustCarousel";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeaturedArticles } from "@/components/marketing/FeaturedArticles";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { FounderNote } from "@/components/marketing/FounderNote";
import { AuditQuiz } from "@/components/audit/AuditQuiz";
import { HireVsAutomateCarousel } from "@/components/marketing/HireVsAutomateCarousel";
import { GlowBorder } from "@/components/ui/glow-border";
import { ClipboardList, ShieldCheck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "LogicLot — Vetted Automation Solutions for Growing Businesses",
  description:
    "Browse fixed-price automation solutions built by vetted experts. From CRM to invoicing to lead generation — every project milestone-protected and escrow-secured.",
  keywords: [
    "automation solutions", "business automation", "workflow automation",
    "no-code experts", "automation marketplace", "CRM automation",
    "Zapier experts", "Make.com experts", "automation consultants",
  ],
  openGraph: {
    title: "LogicLot — Vetted Automation Solutions",
    description:
      "Fixed-price automation solutions from vetted experts. Milestone payments, escrow-protected.",
    url: "https://logiclot.com",
    siteName: "LogicLot",
    type: "website",
    images: [
      {
        url: "https://logiclot.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "LogicLot — Automation Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LogicLot — Vetted Automation Solutions",
    description: "Fixed-price automation solutions. Milestone payments, escrow-protected.",
    images: ["https://logiclot.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://logiclot.com" },
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <TrustCarousel />
      <CategoryGrid />

      {/* Inline Audit + Hire vs. Automate Section */}
      <section className="bg-[#FBFAF8] border-b border-border py-14 md:py-20">
        <div className="container mx-auto px-4 xl:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10 lg:gap-0 items-stretch">
            {/* Left: Audit Quiz */}
            <div className="mx-auto lg:mx-0 w-full flex flex-col min-w-0 lg:pr-12">
              <div className="text-center lg:text-left mb-8">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3">
                  Free Automation Audit
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
                  Where is your business losing time?
                </h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                  5 questions. Find out what&apos;s costing you the most and whether
                  automation is worth it for your stage of growth.
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-5 flex-wrap mt-4">
                  {[
                    { icon: Clock, label: "2 minutes" },
                    { icon: ShieldCheck, label: "No account needed" },
                    { icon: ClipboardList, label: "Instant report" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
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

            {/* Vertical divider (desktop only) */}
            <div className="hidden lg:block w-px bg-border" />

            {/* Right: Hire vs. Automate Carousel */}
            <div className="mx-auto lg:mx-0 w-full flex flex-col min-w-0 lg:pl-12">
              <HireVsAutomateCarousel />
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <FeaturedArticles />
      <FounderNote />
    </main>
  );
}
