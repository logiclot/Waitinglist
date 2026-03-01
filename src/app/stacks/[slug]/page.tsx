import { notFound } from "next/navigation";
import { getEcosystemBySlug } from "@/actions/ecosystems";
import { StackCTA } from "@/components/ecosystems/StackCTA";
import { Clock, HelpCircle, Layers } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const ecosystem = await getEcosystemBySlug(params.slug);
  if (!ecosystem) return { title: "Stack Not Found" };
  return {
    title: `${ecosystem.title} | LogicLot Suites`,
    description: ecosystem.shortPitch,
  };
}

export default async function StackDetailPage({ params }: PageProps) {
  const ecosystem = await getEcosystemBySlug(params.slug);

  if (!ecosystem || !ecosystem.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-secondary/30 border-b border-border py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Solution Suite
              </span>
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Layers className="w-4 h-4" /> {ecosystem.items.length} Solutions
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{ecosystem.title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {ecosystem.shortPitch}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Included Solutions */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Included Solutions</h2>
              <div className="space-y-8">
                {ecosystem.items.map((item, index) => (
                  <div key={item.id} className="relative pl-8 border-l-2 border-border pb-8 last:pb-0 last:border-l-0">
                    <div className="absolute -left-[11px] top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    
                    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                            <Link href={`/solutions/${item.solution.slug}`} className="hover:underline hover:text-primary">
                              {item.solution.title}
                            </Link>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              v{item.solution.version || 1}.0
                            </span>
                          </h3>
                          <p className="text-sm text-muted-foreground">{item.solution.shortSummary}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-lg">€{(item.solution.implementationPriceCents / 100).toLocaleString("de-DE")}</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" /> {item.solution.deliveryDays} days
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. FAQ */}
            <section>
              <h2 className="text-2xl font-bold mb-6">FAQ before you buy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border p-4 rounded-lg">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" /> Can I buy just one?
                  </h4>
                  <p className="text-sm text-muted-foreground">Yes. You can buy any solution individually or the full suite. We recommend starting with Step 1.</p>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" /> How does the demo work?
                  </h4>
                  <p className="text-sm text-muted-foreground">The expert will show you the full suite running in their environment before you grant any access.</p>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" /> Is there a discount?
                  </h4>
                  <p className="text-sm text-muted-foreground">Experts often provide better support and integration when you use their recommended suite.</p>
                </div>
              </div>
            </section>

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <StackCTA ecosystem={ecosystem} />
              
              <div>
                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Created by</h4>
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">
                    {ecosystem.expert.displayName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{ecosystem.expert.displayName}</div>
                    <Link href={`/experts/${ecosystem.expert.slug}`} className="text-xs text-primary hover:underline">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
