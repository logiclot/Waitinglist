import Link from "next/link";
import { ShieldCheck, RefreshCw, MessageSquare, Euro, HelpCircle, Award, TrendingUp, Star, ArrowRight, CheckCircle } from "lucide-react";
import { TIER_THRESHOLDS, SALES_THRESHOLDS } from "@/lib/commission";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";
const BASE_URL = `https://${BRAND_DOMAIN}`;

export const metadata = {
  title: `Pricing & Fees | ${BRAND_NAME}`,
  description: "Transparent pricing for LogicLot. Businesses pay zero platform fees. Experts keep more as they grow with tiered commissions from 16% down to 11%. Escrow-protected payments.",
  openGraph: {
    title: `Pricing & Fees | ${BRAND_NAME}`,
    description: "Transparent pricing. Zero platform fees for buyers. Expert commissions from 16% down to 11%.",
    url: `${BASE_URL}/pricing`,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Pricing & Fees | ${BRAND_NAME}`,
    description: "Transparent pricing. Zero platform fees for buyers. Expert commissions from 16% down to 11%.",
  },
  alternates: { canonical: `${BASE_URL}/pricing` },
  keywords: ["LogicLot pricing", "automation marketplace fees", "expert commission rates", "escrow payments", "transparent pricing"],
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-20 bg-[#FBFAF8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is the refund policy?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Discovery Scan posting fees (€50) are non-refundable but credited toward your first project. Custom Project posting fees (€100): 50% refund if no expert proposal meets your criteria. For funded projects, you can raise a dispute; our team will mediate and may award full or partial refunds based on deliverables.",
                },
              },
              {
                "@type": "Question",
                name: "How do disputes work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "If you're unhappy with the delivery, you can raise a dispute. Our platform support team will review the project requirements and the delivered work to mediate a fair resolution, which may include a full or partial refund.",
                },
              },
              {
                "@type": "Question",
                name: "What does 'Monthly AI Cost Estimate' mean?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "This is an estimated range of what you'll pay to third-party providers (like OpenAI, Anthropic, or Make.com) to run the automation. These costs depend on your usage volume and are billed directly by those providers, not by LogicLot.",
                },
              },
              {
                "@type": "Question",
                name: "When do experts get paid?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Experts receive their payout typically 3 days after you mark the project as complete. This cooling-off period ensures that everything is working correctly before funds are final.",
                },
              },
            ],
          }),
        }}
      />
      <div className="max-w-3xl mx-auto text-center mb-14">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">Fees &amp; Commissions</p>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Transparent Pricing</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          No hidden fees, no subscriptions. Businesses pay nothing extra. Experts keep more as they grow.
        </p>
      </div>

      {/* Fees Explained Table */}
      <div className="max-w-5xl mx-auto mb-20">
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            
            {/* Column 1: Implementation */}
            <div className="p-8 md:p-10 flex flex-col h-full">
              <div className="mb-auto">
                <h3 className="font-bold text-lg mb-2 text-foreground">Implementation Fee</h3>
                <div className="text-3xl font-bold mb-4 text-foreground">Milestone Based</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Paid in stages defined by the expert. Funds are held in secure escrow until you approve the work.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-border/50">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-bold border border-border">
                  Paid by Buyer
                </span>
              </div>
            </div>

            {/* Column 2: Platform Fee (Highlighted) */}
            <div className="p-8 md:p-10 bg-primary/5 flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <div className="mb-auto">
                <h3 className="font-bold text-lg mb-2 text-primary">Platform Fee</h3>
                <div className="text-4xl font-bold mb-4 text-foreground">0%</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We charge the expert a commission. You pay exactly the listed price.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-primary/10">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-foreground text-background text-xs font-bold">
                  Free for Buyers
                </span>
              </div>
            </div>

            {/* Column 3: AI Costs */}
            <div className="p-8 md:p-10 flex flex-col h-full">
              <div className="mb-auto">
                <h3 className="font-bold text-lg mb-2 text-foreground">AI/Cloud Usage</h3>
                <div className="text-3xl font-bold mb-4 text-foreground">At Cost</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Paid directly to providers (OpenAI, Make, etc.). No markup. Every solution lists estimated monthly costs upfront.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-border/50">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-bold border border-border">
                  Paid to 3rd Parties
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Visual Break / Illustration Placeholder */}
      <div className="max-w-4xl mx-auto mb-24 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-[#FBFAF8] px-4">
            <div className="h-16 w-16 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-8 w-8 text-primary/80" />
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4 font-medium uppercase tracking-widest">
          Secure · Transparent · Escrow Protected
        </p>
      </div>

      {/* Expert Commission Tiers */}
      <div className="max-w-5xl mx-auto mb-24">
        <div className="text-center mb-10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">For Experts</p>
          <h2 className="text-2xl font-bold text-foreground">Expert Commission Tiers</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
            The more you deliver, the less you pay. Commission drops automatically as your sales grow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Standard Tier */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-foreground" />
              </div>
              <h3 className="font-bold text-base text-foreground">Standard</h3>
            </div>
            <div className="text-5xl font-bold mb-1 text-foreground">{TIER_THRESHOLDS.STANDARD}%</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-4">Commission</p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-auto">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                7-day visibility boost on sign-up
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                Sell solutions on the marketplace
              </li>
            </ul>
            <div className="mt-6 pt-5 border-t border-border text-sm text-muted-foreground">
              Starting rate for all experts.
            </div>
          </div>

          {/* Proven Tier */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground">Proven</h3>
            </div>
            <div className="text-5xl font-bold mb-1 text-foreground">{TIER_THRESHOLDS.PROVEN}%</div>
            <p className="text-[10px] text-primary uppercase tracking-wider font-bold mb-4">Commission</p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-auto">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                Access to Discovery Scan projects
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                Access to Custom Projects
              </li>
            </ul>
            <div className="mt-6 pt-5 border-t border-border text-sm text-muted-foreground">
              Unlocked after <strong className="text-foreground">{SALES_THRESHOLDS.PROVEN} sales</strong>.
            </div>
          </div>

          {/* Elite Tier */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-bold text-base text-foreground">Elite</h3>
            </div>
            <div className="text-5xl font-bold mb-1 text-foreground">{TIER_THRESHOLDS.ELITE}%</div>
            <p className="text-[10px] text-primary uppercase tracking-wider font-bold mb-4">Commission</p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-auto">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                Everything in Proven
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                Lowest commission rate
              </li>
            </ul>
            <div className="mt-6 pt-5 border-t border-border text-sm text-muted-foreground">
              Application-based after <strong className="text-foreground">{SALES_THRESHOLDS.ELITE}+ sales</strong>.
            </div>
          </div>

          {/* Founding Expert Tier */}
          <div className="bg-[#111827] rounded-2xl p-6 shadow-xl flex flex-col relative overflow-hidden">
            <span className="absolute top-0 right-0 bg-white text-[#111827] text-[10px] font-bold px-3 py-1 rounded-bl-xl">LIMITED</span>
            <div className="mb-5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Award className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-base text-white">Founding Expert</h3>
            </div>
            <div className="text-5xl font-bold mb-1 text-white">{TIER_THRESHOLDS.FOUNDING}%</div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mb-auto">Lifetime Commission</p>
            <div className="mt-6 pt-5 border-t border-white/10 text-sm text-white/50">
              First 20 experts only. <span className="text-white font-semibold">Permanent status.</span>
            </div>
          </div>
        </div>
      </div>

      {/* How Payments Work */}
      <div className="max-w-5xl mx-auto mb-20">
        <div className="text-center mb-10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">Payment Flow</p>
          <h2 className="text-2xl font-bold text-foreground">How Payments Work</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Euro className="h-6 w-6" />
            </div>
            <h3 className="font-bold mb-2">Secure Deposit</h3>
            <p className="text-sm text-muted-foreground">
              Your payment is held securely in escrow. The expert doesn&apos;t get paid until work starts.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="font-bold mb-2">On-Platform Chat</h3>
            <p className="text-sm text-muted-foreground">
              Collaborate directly on the platform. No need to share personal WhatsApp or email.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold mb-2">Funds Release</h3>
            <p className="text-sm text-muted-foreground">
              Funds are released to the expert only after the implementation is delivered and approved.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="font-bold mb-2">Refund Protection</h3>
            <p className="text-sm text-muted-foreground">
              Posting fees: 50% refund if no proposal meets your criteria. For funded projects, disputes are mediated and may include full or partial refunds.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">Support</p>
          <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="font-bold flex items-start gap-3 mb-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              What is the refund policy?
            </h3>
            <p className="text-muted-foreground pl-8">
              Discovery Scan posting fees (€50) are non-refundable but credited toward your first project. Custom Project posting fees (€100): 50% refund if no expert proposal meets your criteria. For funded projects, you can raise a dispute; our team will mediate and may award full or partial refunds based on deliverables.
            </p>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="font-bold flex items-start gap-3 mb-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              How do disputes work?
            </h3>
            <p className="text-muted-foreground pl-8">
              If you&apos;re unhappy with the delivery, you can raise a dispute. Our platform support team will review the project requirements and the delivered work to mediate a fair resolution, which may include a full or partial refund.
            </p>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="font-bold flex items-start gap-3 mb-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              What does &quot;Monthly AI Cost Estimate&quot; mean?
            </h3>
            <p className="text-muted-foreground pl-8">
              This is an estimated range of what you&apos;ll pay to third-party providers (like OpenAI, Anthropic, or Make.com) to run the automation. These costs depend on your usage volume and are billed directly by those providers, not by us.
            </p>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="font-bold flex items-start gap-3 mb-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              When do experts get paid?
            </h3>
            <p className="text-muted-foreground pl-8">
              Experts receive their payout typically 3 days after you mark the project as complete. This cooling-off period ensures that everything is working correctly before funds are final.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto border-t border-border pt-16 mt-16 text-center">
        <h3 className="text-xl font-bold mb-2 text-foreground">Ready to get started?</h3>
        <p className="text-muted-foreground text-sm mb-8">Browse what&apos;s available, or join as an expert and start earning.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/solutions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity text-sm"
          >
            Browse Solutions <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-6 py-3 rounded-xl border border-border bg-white hover:bg-secondary/50 transition-colors font-medium text-sm"
          >
            Join as an Expert
          </Link>
        </div>
      </div>
      <p className="text-xs text-muted-foreground/50 text-center mt-12">Last updated: March 2026</p>
    </div>
  );
}
