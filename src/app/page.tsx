import type { Metadata } from "next";
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
import { ClipboardList, ShieldCheck, Clock, Check } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ValueGrid } from "@/components/marketing/ValueGrid";

export const metadata: Metadata = {
  title: "LogicLot | Verified Automation Solutions for Growing Businesses",
  description:
    "Browse ready-to-deploy AI automations. Fixed-price, deployed by verified experts.",
  keywords: [
    "automation solutions",
    "business automation",
    "workflow automation",
    "no-code experts",
    "automation marketplace",
    "CRM automation",
    "Zapier experts",
    "Make.com experts",
    "automation consultants",
  ],
  openGraph: {
    title: "LogicLot | Verified Automation Solutions",
    description:
      "Fixed-price automation solutions from verified experts. Milestone payments, escrow-protected.",
    url: "https://logiclot.io",
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
    title: "LogicLot | Verified Automation Solutions",
    description:
      "Browse ready-to-deploy AI automations. Fixed-price, deployed by verified experts.",
    images: ["https://logiclot.io/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://logiclot.io" },
};

const worksWithList = [
  "Make.com",
  "Zapier",
  "n8n",
  "OpenAI",
  "Anthropic",
  "HubSpot",
  "Salesforce",
  "Airtable",
  "Notion",
];

const trustStatsList = [
  { label: "CRM & Sales" },
  { label: "Lead Generation" },
  { label: "Email Automation" },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />

      {/* <TrustCarousel /> */}
      <CategoryGrid />

      {/* Inline Audit + Hire vs. Automate Section */}
      <section className="bg-[#FBFAF8] py-14 md:py-20">
        <div className="container mx-auto px-4 xl:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10 lg:gap-0 items-stretch">
            {/* Left: Audit Quiz */}
            <div className="mx-auto lg:mx-0 w-full flex flex-col min-w-0 lg:pr-12">
              <div className="text-center lg:text-left mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3">
                  Free Automation Audit
                </p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                  Where is your business losing time?
                </h2>
                <p className="text-[13px] leading-relaxed max-w-md mx-auto lg:mx-0">
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
                      className="flex items-center gap-1.5 text-xs"
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

      <section className="pt-20 md:pt-40">
        <div className="text-center relative">
          <span className="text-[70px] font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-t from-25% from-transparent to-ash-300 flex justify-center absolute -top-[50px] inset-x-0 md:text-[100px] md:-top-[75px]">
            princing
          </span>
          <h1 className="max-w-xl text-2xl text-ash-800 text-balance font-noto font-semibold tracking-tight mx-auto md:text-4xl">
            Simple, transparent pricing with zero hidden costs or markups
          </h1>
          <p className="max-w-2xl text-balance mx-auto mt-2 md:text-lg md:mt-4">
            We believe in honest partnerships. Businesses pay zero platform fees and no marked-up tool costs, while experts get paid fairly as they deliver milestones. What you see is exactly what you invest.
          </p>
        </div>
        <div className="grid gap-4 mt-10 md:grid-cols-3">
          <div className="p-6 md:p-10 flex flex-col h-full">
            <div className="mb-auto">
              <h3 className="font-bold text-lg mb-2">Implementation Fee</h3>
              <div className="text-3xl font-bold mb-4">Milestone Based</div>
              <p className="text-sm leading-relaxed">
                Paid in stages defined by the expert. Funds are held in secure escrow until you approve the work.
              </p>
            </div>
            <div className="mt-6 pt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-xs font-bold">
                Paid by Buyer
              </span>
            </div>
          </div>
          <div className="p-6 md:p-10 bg-primary/5 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <div className="mb-auto">
              <h3 className="font-bold text-lg mb-2 text-primary">Platform Fee</h3>
              <div className="text-4xl font-bold mb-4">0%</div>
              <p className="text-sm leading-relaxed">
                We charge the expert a commission. You pay exactly the listed price.
              </p>
            </div>
            <div className="mt-6 pt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-foreground text-background text-xs font-bold">
                Free for Buyers
              </span>
            </div>
          </div>
          <div className="p-6 md:p-10 flex flex-col h-full">
            <div className="mb-auto">
              <h3 className="font-bold text-lg mb-2">AI/Cloud Usage</h3>
              <div className="text-3xl font-bold mb-4">At Cost</div>
              <p className="text-sm leading-relaxed">
                Paid directly to providers (OpenAI, Make, etc.). No markup. Every solution lists estimated monthly costs upfront.
              </p>
            </div>
            <div className="mt-6 pt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-xs font-bold">
                Paid to 3rd Parties
              </span>
            </div>
          </div>
        </div>
      </section>

      <RandomSolutions />
      <FeaturedArticles />
      <FounderNote />

      {/* Value Grid Section */}
      <section className="pt-20 md:pt-40">
        <div className="container mx-auto px-4 xl:px-8 max-w-7xl">
          <ValueGrid />
        </div>
      </section>

      {/* Trust stat pills */}
      <section className="pt-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {trustStatsList.map((s) => (
            <div
              key={s.label}
              className="whitespace-nowrap bg-ash-200 flex items-center gap-2 py-2 px-4 rounded-full"
            >
              <svg className="size-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              <span className="text-sm text-ash-800 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
