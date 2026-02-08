import { EmptyState } from "@/components/EmptyState";
import { Briefcase, Lock } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function ExpertCustomProjectsPage() {
  const session = await getServerSession(authOptions);
  // @ts-expect-error: role extended
  const isElite = session?.user?.role === "ADMIN"; // Mock gating: Admin only for now or check profile tier if available

  if (!isElite) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-muted-foreground">
          <Briefcase className="h-8 w-8" /> Custom Projects Feed <Lock className="h-5 w-5" />
        </h1>
        
        <EmptyState
          title="Custom Projects (Elite)"
          description="Custom Projects have fewer competing bids and higher buyer intent. Upgrade to Elite or Founding status to access."
          primaryCtaLabel="View Discovery Posts"
          primaryCtaHref="/expert/discovery"
          secondaryCtaLabel="How to Unlock"
          secondaryCtaHref="/expert/performance"
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header & Rules */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" /> Custom Projects Feed
        </h1>

        {/* Rules Block */}
        <div className="bg-secondary/30 border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-foreground">
            Custom Projects (€100) — High intent, fewer bids
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Few bids · High buyer intent · Larger deals</li>
                <li>Max 3 bids per post</li>
                <li>Buyer pays €100 to post</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>If no solution is chosen, 75% refund is issued (failure case)</li>
                <li>Remaining 25% is used as deferred marketing budget</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Customers here already know the problem and have paid to get serious offers.
          </p>
        </div>
      </div>

      {/* Feed / Empty State */}
      <EmptyState
        title="No custom projects available"
        description="There are no open custom projects matching your skills right now."
        primaryCtaLabel="View Discovery Posts"
        primaryCtaHref="/expert/discovery" 
      />
    </div>
  );
}
