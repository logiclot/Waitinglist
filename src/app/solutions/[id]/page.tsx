import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Zap, DollarSign, HelpCircle, ShieldCheck, Lock, Award, Info, List, PlayCircle, Star, ChevronDown } from "lucide-react";
import { DemoVideoSection } from "@/components/DemoVideoSection";
import { SimilarSolutions } from "@/components/SimilarSolutions";
import { BRAND_NAME } from "@/lib/branding";
import { prisma } from "@/lib/prisma";
import { Solution } from "@/types";

interface PageProps {
  params: {
    id: string;
  };
}

async function getSolution(id: string) {
  try {
    const s = await prisma.solution.findUnique({
      where: { id },
      include: { expert: true }
    });

    if (!s) return null;

    // Map Prisma result to Solution interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      ...s,
      implementation_price: s.implementationPriceCents / 100,
      monthly_cost_min: s.monthlyCostMinCents ? s.monthlyCostMinCents / 100 : 0,
      monthly_cost_max: s.monthlyCostMaxCents ? s.monthlyCostMaxCents / 100 : 0,
      delivery_days: s.deliveryDays,
      support_days: s.supportDays,
      short_summary: s.shortSummary,
      expert: {
        ...s.expert,
        id: s.expert.id,
        name: s.expert.displayName || s.expert.legalFullName,
        tools: s.expert.tools || [],
        verified: s.expert.verified,
        business_verified: s.expert.businessVerified,
        founding: s.expert.founding,
        completed_sales_count: s.expert.completedSalesCount,
      },
      // Ensure businessGoals is mapped if it exists
      businessGoals: s.businessGoals || [],
    } as unknown as Solution;
  } catch (e) {
    console.error("Error fetching solution:", e);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const solution = await getSolution(params.id);
  if (!solution) return { title: "Solution Not Found" };
  return {
    title: `${solution.title} | ${BRAND_NAME}`,
    description: solution.short_summary || solution.description,
  };
}

export default async function SolutionPage({ params }: PageProps) {
  const solution = await getSolution(params.id);

  if (!solution) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Hero Section (Compact) */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                  {solution.category}
                </span>
                {solution.support_days && solution.support_days > 0 && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> {solution.support_days}d Support
                  </span>
                )}
                {solution.is_vetted && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                    <Award className="h-3 w-3" /> Vetted Expert
                  </span>
                )}
                {solution.requires_nda && (
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                    <Lock className="h-3 w-3" /> NDA Included
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {solution.title}
              </h1>

              <div className="flex items-center gap-4 pt-2">
                {solution.integrations.map((tool) => (
                  <div key={tool} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium text-muted-foreground">
                    <Zap className="h-3 w-3 text-yellow-500" /> {tool}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Long Description (Moved Up) */}
            <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
              {solution.longDescription || solution.description}
            </div>

            {/* 3. Horizontal Row (Business Goal, ROI, Delivery, Support) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-secondary/10 rounded-lg border border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Business Goal</p>
                <p className="font-medium text-sm text-foreground">
                  {solution.businessGoals?.[0] || "Operational efficiency"}
                </p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Est. Impact</p>
                <p className="font-medium text-sm text-foreground line-clamp-2">
                  {solution.outcome || "Designed to reduce manual work and errors."}
                </p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Delivery Time</p>
                <p className="font-medium text-sm text-foreground">
                  {solution.delivery_days} days
                </p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Support</p>
                <p className="font-medium text-sm text-foreground">
                  {solution.support_days || 30} days
                </p>
              </div>
            </div>

            {/* 4. Key Outcomes (Tightened) */}
            <div className="bg-secondary/20 rounded-xl p-6 border border-border/50">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground mb-4 flex items-center gap-2">
                  <List className="h-4 w-4 text-primary" /> Key Outcomes
                </h3>
                <ul className="space-y-3">
                  {(solution.outline && solution.outline.length > 0 ? solution.outline.slice(0, 3) : ["Eliminates repetitive manual steps"]).map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-medium text-foreground/80">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      {line}
                    </li>
                  ))}
                </ul>
            </div>

            {/* Demo Video Section */}
            <DemoVideoSection solution={solution} />

            {/* 5. What You Get (2-column checklist) */}
            <section>
               <h2 className="text-xl font-bold mb-4">What&apos;s included</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {/* Left Column */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      One-time implementation
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Workflow configured
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Tested automation
                    </div>
                     <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Documentation / walkthrough
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      {solution.support_days || 30} days support
                    </div>
                    {solution.maintenancePriceCents ? (
                       <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        Optional maintenance available
                      </div>
                    ) : (
                       <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        No monthly maintenance fees
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Secure in-platform delivery
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      Approval before finalization
                    </div>
                  </div>
               </div>
            </section>

            {/* 6. What we'll need from you (Prerequisites) */}
            <section className="pt-6 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-4">What we&apos;ll need from you</h3>
              {solution.accessRequired || (solution.requiredInputs && solution.requiredInputs.length > 0) ? (
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1.5 bg-secondary/30 rounded-md text-sm text-foreground border border-border">
                    {solution.accessRequired || "Standard user access"}
                  </div>
                  {solution.requiredInputs?.map((item, i) => (
                    <div key={i} className="px-3 py-1.5 bg-secondary/30 rounded-md text-sm text-foreground border border-border">
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Details confirmed after purchase or demo.</p>
              )}
            </section>

             {/* 7. Reviews Section */}
             <section className="pt-6 border-t border-border">
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                 <div className="flex justify-center mb-2">
                   {[1, 2, 3, 4, 5].map((_, i) => (
                     <Star key={i} className="h-5 w-5 text-muted-foreground/30" />
                   ))}
                 </div>
                 <p className="font-medium text-foreground">No reviews yet</p>
                 <p className="text-sm text-muted-foreground">Be the first to review this solution after implementation.</p>
              </div>
            </section>

            {/* 8. Buying Advice */}
            <section className="pt-6 border-t border-border space-y-4">
              <details className="group bg-secondary/5 border border-border rounded-lg">
                <summary className="flex items-center justify-between p-4 font-medium cursor-pointer list-none">
                  <span>Before you buy</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground space-y-2">
                  <p>• Book a demo if you&apos;re unsure about the fit.</p>
                  <p>• Confirm you have the necessary tool accounts (e.g., OpenAI, HubSpot).</p>
                  <p>• Use the &quot;Ask a question&quot; button to clarify any details with the expert.</p>
                </div>
              </details>
              
              <details className="group bg-secondary/5 border border-border rounded-lg">
                <summary className="flex items-center justify-between p-4 font-medium cursor-pointer list-none">
                  <span>After purchase</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground space-y-2">
                  <p>• The expert will contact you to confirm requirements.</p>
                  <p>• Implementation happens directly in your tools.</p>
                  <p>• You review the work and approve it before the order is marked complete.</p>
                </div>
              </details>
            </section>

            {/* FAQ */}
            {solution.faq && solution.faq.length > 0 && (
              <section className="pt-6 border-t border-border">
                <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {solution.faq.map((item, i) => (
                    <div key={i} className="border border-border rounded-lg p-4 bg-card">
                      <h3 className="font-semibold text-base mb-2 flex items-start gap-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                        {item.question}
                      </h3>
                      <p className="text-sm text-muted-foreground pl-6 leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Action Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">One-time Implementation</p>
                <div className="text-4xl font-bold text-foreground">${solution.implementation_price.toLocaleString()}</div>
                {solution.implementation_type && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                    <Info className="h-3 w-3" /> {solution.implementation_type}
                  </p>
                )}
              </div>
              
              {(solution.monthly_cost_min > 0 || solution.monthly_cost_max > 0) && (
                <div className="mb-6 p-3 bg-secondary/30 rounded-lg border border-border/50">
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Est. Monthly Tool Costs</p>
                      <p className="text-sm font-semibold text-foreground/80">${solution.monthly_cost_min} - ${solution.monthly_cost_max} / mo</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Link
                  href={`/request/${solution.id}`}
                  className="block w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-bold text-lg transition-colors shadow-md shadow-primary/20"
                >
                  Buy this solution
                </Link>
                
                {/* Paid Demo CTA */}
                <div className="pt-2">
                  <Link
                    href={`/messages/new?expert=${solution.expert?.id}&solution=${solution.id}&type=demo`}
                    className="block w-full text-center border border-border bg-background hover:bg-secondary/50 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 text-foreground"
                  >
                    <PlayCircle className="h-4 w-4" /> See this live — $15 demo
                  </Link>
                  <p className="text-[10px] text-muted-foreground text-center mt-2 px-2 leading-tight">
                    15–20 min walkthrough in the expert’s environment. No access required.
                  </p>
                </div>

                <Link
                  href={`/messages/new?expert=${solution.expert?.id}&solution=${solution.id}`}
                  className="block w-full text-center text-xs text-muted-foreground hover:text-primary hover:underline py-2"
                >
                  Ask a question
                </Link>
              </div>

              {/* Purchase Flow Steps */}
              <div className="pt-6 mt-6 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">How it works</h4>
                <ol className="space-y-4 relative border-l border-border/50 ml-1.5 pl-4">
                  <li className="text-xs text-muted-foreground relative">
                    <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-secondary border border-border" />
                    <span className="font-medium text-foreground block mb-0.5">Optional live demo</span>
                    See the automation working before committing.
                  </li>
                  <li className="text-xs text-muted-foreground relative">
                    <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-secondary border border-border" />
                    <span className="font-medium text-foreground block mb-0.5">Confirm requirements</span>
                    You approve what will be implemented.
                  </li>
                  <li className="text-xs text-muted-foreground relative">
                    <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-secondary border border-border" />
                    <span className="font-medium text-foreground block mb-0.5">Expert implements</span>
                    Built directly inside your tools.
                  </li>
                  <li className="text-xs text-muted-foreground relative">
                    <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-secondary border border-border" />
                    <span className="font-medium text-foreground block mb-0.5">Review & approve</span>
                    Funds released only after approval.
                  </li>
                </ol>
              </div>
            </div>

            {/* Expert Card */}
            {solution.expert && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-lg relative shrink-0">
                    {solution.expert.name.substring(0, 2).toUpperCase()}
                    {solution.expert.verified && (
                       <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                         <ShieldCheck className="h-3 w-3 text-blue-400 fill-blue-400/10" />
                       </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {solution.expert.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {solution.expert.completed_sales_count} implementations
                    </div>
                  </div>
                </div>
                <Link href={`/experts/${solution.expert.slug}`} className="text-xs text-primary hover:underline block">
                  View Expert Profile
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Similar Solutions */}
      <SimilarSolutions currentSlug={solution.slug} category={solution.category} />
    </div>
  );
}
