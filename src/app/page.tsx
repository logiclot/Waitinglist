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

      {/* Inline Audit */}
      <section className="pt-20 md:pt-40">
        <div className="container mx-auto px-4 xl:px-8 max-w-7xl">
          <div className="text-center relative">
            <span className="text-[70px] font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-t from-25% from-transparent to-ash-300 flex justify-center absolute -top-[50px] inset-x-0 md:text-[100px] md:-top-[75px]">
              free audit
            </span>
            <h2 className="max-w-xl text-2xl text-ash-800 text-balance font-noto font-semibold tracking-tight mx-auto md:text-4xl">
              Where is your business losing time?
            </h2>
            <p className="max-w-2xl text-balance mx-auto mt-2 md:text-lg md:mt-4">
              5 questions. Find out what&apos;s costing you the most and whether automation is worth it for your stage of growth.
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
          <div className="mt-10">
            <AuditQuiz newTab />
          </div>
        </div>
      </section>

      {/* Hire vs. Automate Section */}
      <section className="pt-20 md:pt-40">
        <div className="container mx-auto px-4 xl:px-8 max-w-7xl">
          <div className="mx-auto lg:mx-0 w-full flex flex-col min-w-0 lg:pl-12">
            <HireVsAutomateCarousel />
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="pt-20 md:pt-40">
        <div className="container mx-auto px-4 xl:px-8 max-w-7xl">
          <div className="text-center relative">
            <span className="text-[70px] font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-t from-25% from-transparent to-ash-300 flex justify-center absolute -top-[50px] inset-x-0 md:text-[100px] md:-top-[75px]">
              pricing
            </span>
            <h1 className="max-w-xl text-2xl text-ash-800 text-balance font-noto font-semibold tracking-tight mx-auto md:text-4xl">
              Simple, transparent pricing with zero hidden costs or markups
            </h1>
            <p className="max-w-4xl text-balance mx-auto mt-2 md:text-lg md:mt-4">
              We believe in honest partnerships. Businesses pay zero platform fees and no marked-up tool costs, while experts get paid fairly as they deliver milestones.
            </p>
          </div>
          <div className="max-w-5xl grid gap-4 mx-auto mt-10 md:grid-cols-3">
            <div className="h-full bg-white flex flex-col relative p-6 border border-ash-300 shadow-2xl shadow-ash-200 rounded-3xl md:p-8">
              <div className="mb-auto">
                <h3 className="text-xs text-ash-500 font-medium uppercase tracking-widest">Implementation Fee</h3>
                <div className="text-3xl text-ash-800 font-noto font-semibold tracking-tight mt-2">Milestone Based</div>
                <p className="text-ash-500 mt-2">
                  Paid in stages defined by the expert. Funds are held in secure escrow until you approve the work.
                </p>
              </div>
              <div className="mt-6 md:mt-8">
                <span className="text-sm font-semibold bg-ash-200 py-1.5 px-3 r rounded-md">
                  Paid by Buyer
                </span>
              </div>
            </div>
            <div className="h-full bg-ash-900 flex flex-col relative p-6 shadow-2xl shadow-ash-200 rounded-3xl md:p-8">
              <div className="mb-auto">
                <h3 className="text-xs text-ash-500 font-medium uppercase tracking-widest">Platform Fee</h3>
                <div className="text-3xl text-ash-50 font-noto font-semibold tracking-tight mt-2">0%</div>
                <p className="text-ash-300 mt-2">
                  We charge the expert a commission. You pay exactly the listed price.
                </p>
              </div>
              <div className="mt-6 md:mt-8">
                <span className="text-sm text-ash-800 font-semibold bg-white py-1.5 px-3 r rounded-md">
                  Free for Buyers
                </span>
              </div>
            </div>
            <div className="h-full bg-white flex flex-col relative p-6 border border-ash-300 shadow-2xl shadow-ash-200 rounded-3xl md:p-8">
              <div className="mb-auto">
                <h3 className="text-xs text-ash-500 font-medium uppercase tracking-widest">AI/Cloud Usage</h3>
                <div className="text-3xl text-ash-800 font-noto font-semibold tracking-tight mt-2">At Cost</div>
                <p className="text-ash-500 mt-2">
                  Paid directly to providers (OpenAI, Make, etc.). No markup. Every solution lists estimated monthly costs upfront.
                </p>
              </div>
              <div className="mt-6 md:mt-8">
                <span className="text-sm font-semibold bg-ash-200 py-1.5 px-3 r rounded-md">
                  Paid to 3rd Parties
                </span>
              </div>
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
