import { Hero } from "@/components/ui/hero-section";
import { TrustCarousel } from "@/components/marketing/TrustCarousel";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { AuditQuiz } from "@/components/audit/AuditQuiz";
import { HireVsAutomateCarousel } from "@/components/marketing/HireVsAutomateCarousel";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { FeaturedArticles } from "@/components/marketing/FeaturedArticles";
import { FounderNote } from "@/components/marketing/FounderNote";
import { ClipboardList, ShieldCheck, Clock } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";

export const metadata = {
  title: `${BRAND_NAME} — Buy ready to implement automations for your day to day business`,
  description:
    "Browse proven AI automations, request custom workflows, and work with vetted specialists. Fixed prices, escrow protection, real accountability.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustCarousel />
      <CategoryGrid />

      {/* Audit + Hire vs Automate — side by side */}
      <section className="py-16 md:py-24 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10 lg:gap-0 items-stretch">
            {/* Left — Audit Quiz */}
            <div className="lg:pr-12">
              <div className="flex items-center gap-3 mb-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  Automation Audit
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Answer 5 questions. Get an honest automation opportunity score
                for your business.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/8 text-foreground text-xs font-bold border border-foreground/10">
                  <Clock className="h-3 w-3" /> 2 minutes
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/8 text-foreground text-xs font-bold border border-foreground/10">
                  <ShieldCheck className="h-3 w-3" /> No account needed
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/8 text-foreground text-xs font-bold border border-foreground/10">
                  Instant report
                </span>
              </div>
              <AuditQuiz newTab />
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px bg-border self-stretch mx-6" />

            {/* Right — Hire vs Automate */}
            <div className="lg:pl-12">
              <HireVsAutomateCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* How it works — with business/expert toggle */}
      <HowItWorks />

      <FeaturedArticles />
      <FounderNote />
    </>
  );
}
