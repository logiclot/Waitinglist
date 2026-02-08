import { ShieldCheck, RefreshCw, MessageSquare, DollarSign, HelpCircle, Award, TrendingUp, Star } from "lucide-react";
import { TIER_THRESHOLDS, SALES_THRESHOLDS } from "@/lib/commission";
import { BRAND_NAME } from "@/lib/branding";

export const metadata = {
  title: `Pricing & Fees | ${BRAND_NAME}`,
  description: "Transparent pricing and fee structure.",
};

export default function PricingPage() {
  const exampleImplementationPrice = 250000; // $2,500
  const standardCommission = TIER_THRESHOLDS.STANDARD;
  const platformFeeCents = Math.round(exampleImplementationPrice * (standardCommission / 100));
  const expertPayoutCents = exampleImplementationPrice - platformFeeCents;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          We believe in clear, upfront costs. No hidden fees or surprise subscriptions.
        </p>
      </div>

      {/* Fees Explained Table */}
      <div className="max-w-4xl mx-auto mb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Fee Structure Explained</h2>
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-8">
              <h3 className="font-bold text-lg mb-2">Implementation Fee</h3>
              <p className="text-3xl font-bold mb-4">Fixed Price</p>
              <p className="text-sm text-muted-foreground mb-4">
                Paid once to the expert for setting up the automation.
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Paid by Buyer
              </span>
            </div>
            <div className="p-8 bg-secondary/5">
              <h3 className="font-bold text-lg mb-2">Platform Fee</h3>
              <p className="text-3xl font-bold mb-4">0%</p>
              <p className="text-sm text-muted-foreground mb-4">
                We charge the expert a commission. You pay exactly the listed price.
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                Free for Buyers
              </span>
            </div>
            <div className="p-8">
              <h3 className="font-bold text-lg mb-2">AI/Cloud Usage</h3>
              <p className="text-3xl font-bold mb-4">At Cost</p>
              <p className="text-sm text-muted-foreground mb-4">
                Paid directly to providers (OpenAI, Make, etc.). No markup.
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                Paid to 3rd Parties
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expert Commission Tiers */}
      <div className="max-w-4xl mx-auto mb-20">
        <h2 className="text-2xl font-bold mb-4 text-center">Expert Commission Tiers</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          We reward top-performing experts with lower platform fees. The more you sell, the more you keep.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Standard Tier */}
          <div className="border border-border rounded-xl p-6 bg-card relative overflow-hidden">
            <div className="mb-4 flex items-center gap-2">
               <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                 <TrendingUp className="h-4 w-4" />
               </div>
               <h3 className="font-bold">Standard</h3>
            </div>
            <div className="text-3xl font-bold mb-2">{TIER_THRESHOLDS.STANDARD}%</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Commission</p>
            <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
              Starting rate for all verified experts.
            </div>
          </div>

          {/* Proven Tier */}
          <div className="border border-border rounded-xl p-6 bg-card relative overflow-hidden">
            <div className="mb-4 flex items-center gap-2">
               <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                 <Award className="h-4 w-4" />
               </div>
               <h3 className="font-bold text-blue-500">Proven</h3>
            </div>
            <div className="text-3xl font-bold mb-2">{TIER_THRESHOLDS.PROVEN}%</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Commission</p>
            <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
              Unlocked after <strong>{SALES_THRESHOLDS.PROVEN} sales</strong>.
            </div>
          </div>

          {/* Elite Tier */}
          <div className="border border-border rounded-xl p-6 bg-card relative overflow-hidden ring-1 ring-purple-500/20">
            <div className="mb-4 flex items-center gap-2">
               <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                 <Star className="h-4 w-4" />
               </div>
               <h3 className="font-bold text-purple-500">Elite</h3>
            </div>
            <div className="text-3xl font-bold mb-2">{TIER_THRESHOLDS.ELITE}%</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Commission</p>
            <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
              Unlocked after <strong>{SALES_THRESHOLDS.ELITE} sales</strong>.
            </div>
          </div>

          {/* Founding Expert Tier */}
          <div className="border border-yellow-500/30 rounded-xl p-6 bg-yellow-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl">LIMITED</div>
            <div className="mb-4 flex items-center gap-2">
               <div className="h-8 w-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                 <Award className="h-4 w-4" />
               </div>
               <h3 className="font-bold text-yellow-500">Founding</h3>
            </div>
            <div className="text-3xl font-bold mb-2">{TIER_THRESHOLDS.FOUNDING}%</div>
            <p className="text-xs text-yellow-500/70 uppercase tracking-wider font-semibold">Lifetime Commission</p>
            <div className="mt-4 pt-4 border-t border-yellow-500/20 text-sm text-muted-foreground">
              First 20 experts only. Permanent status.
            </div>
          </div>
        </div>

        {/* Payout Example */}
        <div className="mt-12 bg-secondary/10 rounded-xl p-8 border border-border">
          <h3 className="font-bold text-lg mb-6">Payout Example (Standard Tier)</h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="bg-card p-4 rounded-lg border border-border flex-1 w-full text-center">
              <div className="text-muted-foreground mb-1">Project Price</div>
              <div className="font-bold text-xl">{formatCurrency(exampleImplementationPrice)}</div>
            </div>
            <div className="text-muted-foreground font-bold">-</div>
            <div className="bg-card p-4 rounded-lg border border-border flex-1 w-full text-center">
              <div className="text-muted-foreground mb-1">Platform Fee ({standardCommission}%)</div>
              <div className="font-bold text-xl text-red-500">-{formatCurrency(platformFeeCents)}</div>
            </div>
            <div className="text-muted-foreground font-bold">=</div>
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 flex-1 w-full text-center">
              <div className="text-green-600 mb-1 font-medium">Expert Payout</div>
              <div className="font-bold text-xl text-green-500">{formatCurrency(expertPayoutCents)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* How Payments Work */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-2xl font-bold mb-12 text-center">How Payments Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <DollarSign className="h-6 w-6" />
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
            <h3 className="font-bold mb-2">100% Refund</h3>
            <p className="text-sm text-muted-foreground">
              If the expert fails to deliver or doesn&apos;t meet requirements, you get a full refund.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="font-bold flex items-start gap-3 mb-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              What is the refund policy?
            </h3>
            <p className="text-muted-foreground pl-8">
              We offer a 100% money-back guarantee if the expert fails to deliver the solution as described or misses the agreed-upon deadline. You can request a refund directly from your dashboard before the project is marked as complete.
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
    </div>
  );
}
