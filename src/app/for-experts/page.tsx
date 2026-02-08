import Link from "next/link";
import { CheckCircle2, ShieldCheck, TrendingUp, Users, Lock, Award, Clock, XCircle, Zap, Crown } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: `For Experts | ${BRAND_NAME}`,
  description: "Productize your AI automations and sell them repeatedly.",
};

export default async function ForExpertsPage() {
  const foundingCount = await prisma.specialistProfile.count({
    where: { founding: true }
  });
  const remainingSpots = Math.max(0, 20 - foundingCount);

  return (
    <div className="flex flex-col min-h-screen">
      {/* SECTION 1: HERO */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-background -z-10" />
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Build once. Sell repeatedly.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Productize your best AI automations into repeatable implementations.
            <br />
            Clear scope, qualified buyers, and protected payouts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/auth/sign-up"
              className="px-8 py-4 rounded-md bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              Get Started Now
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-md border border-border bg-background hover:bg-secondary/50 transition-colors w-full sm:w-auto font-medium"
            >
              See Pricing / Fees
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-sm font-medium text-foreground/80">
            <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
              <Users className="h-3.5 w-3.5 text-purple-400" /> Qualified buyers
            </span>
            <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> Protected payouts
            </span>
            <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1 rounded-full border border-border/50">
              <Zap className="h-3.5 w-3.5 text-purple-400" /> Productized delivery
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
            If you&apos;re doing AI automations, you&apos;ve felt this&hellip;
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-12">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500/70 mt-1 shrink-0" />
              <p className="text-muted-foreground">Endless discovery calls before you even touch the build</p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500/70 mt-1 shrink-0" />
              <p className="text-muted-foreground">Explaining the same workflow over and over</p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500/70 mt-1 shrink-0" />
              <p className="text-muted-foreground">&ldquo;Can you just add one more thing?&rdquo; scope creep</p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500/70 mt-1 shrink-0" />
              <p className="text-muted-foreground">Unpaid proposals, audits, and pre-sales work</p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500/70 mt-1 shrink-0" />
              <p className="text-muted-foreground">Clients who vanish after &ldquo;Let&apos;s talk&rdquo;</p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500/70 mt-1 shrink-0" />
              <p className="text-muted-foreground">Getting compared on hourly rates instead of outcomes</p>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto border-t border-border pt-10">
            <p className="text-lg font-medium text-foreground">
              We turn your best automation into a product: fixed deliverables, clear prerequisites, and a repeatable delivery process that scales.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHAT WE DO DIFFERENTLY */}
      <section className="py-20 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Not freelancing. Productized implementations.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-8 rounded-xl border border-border bg-card">
              <h3 className="text-xl font-bold mb-4">Fixed scope. Clear deliverables.</h3>
              <p className="text-muted-foreground leading-relaxed">
                You define what&apos;s included, what&apos;s not, and what success looks like — before a buyer ever messages you.
              </p>
            </div>
            <div className="p-8 rounded-xl border border-border bg-card">
              <h3 className="text-xl font-bold mb-4">Buyers choose a solution first.</h3>
              <p className="text-muted-foreground leading-relaxed">
                Buyers come to purchase a specific automation, not to start an open-ended consulting project.
              </p>
            </div>
            <div className="p-8 rounded-xl border border-border bg-card">
              <h3 className="text-xl font-bold mb-4">You implement in their environment.</h3>
              <p className="text-muted-foreground leading-relaxed">
                You deliver inside the client&apos;s tools (n8n, Make, CRMs, etc.). We don&apos;t host or run your workflows.
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground italic">
            You stay in control of delivery. We provide marketplace trust and buyer protection.
          </p>
        </div>
      </section>

      {/* SECTION 4: HOW YOU WIN */}
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">What you get as an expert</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-border bg-background">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> High-intent buyers
              </h3>
              <p className="text-sm text-muted-foreground">Buyers browse solutions they already want — not random gigs.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-background">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Less selling
              </h3>
              <p className="text-sm text-muted-foreground">Clear offers reduce calls and back-and-forth.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-background">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Protected payout flow
              </h3>
              <p className="text-sm text-muted-foreground">Delivery confirmation protects both sides.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-background">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> Credibility that compounds
              </h3>
              <p className="text-sm text-muted-foreground">Badges, reviews, and repeatability build trust.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-background">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Repeatable revenue
              </h3>
              <p className="text-sm text-muted-foreground">Sell the same solution multiple times.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-background">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Better-fit projects
              </h3>
              <p className="text-sm text-muted-foreground">Prerequisites filter out bad-fit buyers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: RANKING SYSTEM */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Ranking that rewards serious delivery</h2>
            <p className="text-lg text-muted-foreground">Your visibility grows when outcomes are consistent.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Standard */}
            <div className="p-8 rounded-xl border border-border bg-card relative">
              <div className="w-3 h-3 rounded-full bg-secondary border border-border absolute top-8 right-8"></div>
              <h3 className="text-xl font-bold mb-2">Standard</h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">New or early-stage experts.</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" /> Verified profile & tools
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" /> Clear scope and prerequisites
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" /> On-time delivery history
                </li>
              </ul>
            </div>

            {/* Proven */}
            <div className="p-8 rounded-xl border border-blue-500/20 bg-blue-500/5 relative">
              <div className="w-3 h-3 rounded-full bg-blue-500 absolute top-8 right-8"></div>
              <h3 className="text-xl font-bold mb-2 text-blue-400">Proven</h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">Consistent successful deliveries.</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5" /> Strong buyer feedback
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5" /> Reliable delivery & support
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5" /> Low dispute rate
                </li>
              </ul>
            </div>

            {/* Elite */}
            <div className="p-8 rounded-xl border border-purple-500/20 bg-purple-500/5 relative">
              <div className="w-3 h-3 rounded-full bg-purple-500 absolute top-8 right-8"></div>
              <h3 className="text-xl font-bold mb-2 text-purple-400">Elite</h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">Top-performing experts.</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5" /> Exceptional outcomes & clarity
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5" /> Fast response and clean handover
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5" /> Consistently repeatable implementations
                </li>
                <li className="flex items-start gap-2">
                  <Crown className="h-4 w-4 text-purple-400 mt-0.5" /> ✅ Access to Premium Project Bidding
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Exact fee details are shown in <Link href="/pricing" className="text-primary hover:underline">Pricing / Fees</Link>.
          </p>
        </div>
      </section>

      {/* SECTION 6: FOUNDING EXPERTS */}
      <section className="py-20 bg-yellow-500/5 border-y border-yellow-500/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-bold mb-6 border border-yellow-500/20">
            <Award className="h-4 w-4" /> Limited Opportunity
          </div>
          <h2 className="text-3xl font-bold mb-4">Founding Experts (limited early access)</h2>
          <p className="text-lg text-muted-foreground mb-8">
             <span className="font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 animate-pulse">
               Only {remainingSpots} spots remaining
             </span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-yellow-500/10">
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                <Award className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">Permanent Founding Expert badge</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-yellow-500/10">
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                <Crown className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">Access to Premium Project Bidding</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-yellow-500/10">
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">Priority review and faster approvals</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Limited to the first 20 approved experts.
          </p>
        </div>
      </section>

      {/* SECTION 7: FINAL CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Turn one great automation into a product.</h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/auth/sign-up"
              className="px-8 py-4 rounded-md bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              Get Started Now
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-md border border-border bg-background hover:bg-secondary/50 transition-colors w-full sm:w-auto font-medium"
            >
              View Pricing / Fees
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            You keep ownership. You deliver in the client&apos;s systems. We provide marketplace trust.
          </p>
        </div>
      </section>
    </div>
  );
}
