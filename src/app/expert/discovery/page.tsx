import { EmptyState } from "@/components/EmptyState";
import { Compass, AlertCircle } from "lucide-react";

export default function ExpertDiscoveryPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header & Rules */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Compass className="h-8 w-8 text-primary" /> Discovery Scan Feed
        </h1>
        <p className="text-muted-foreground">
          Browse business scans and submit initial assessments. Qualified submissions earn cash rewards.
        </p>

        <div className="bg-secondary/30 border border-border rounded-xl p-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" /> Rules & Payout
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold mb-1">Rewards</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li><span className="text-green-600 font-bold">€5 paid</span> per Qualified Submission</li>
                <li>Max 5 bids per post total</li>
                <li>Payments are processed monthly</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">Quality Standards</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Must reference specific tools/processes</li>
                <li>No generic or copy-pasted advice</li>
                <li>Buyer votes &quot;Helpful&quot; or &quot;Not Relevant&quot;</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Feed / Empty State */}
      <EmptyState
        title="No open discovery posts"
        description="Check back later for new business scans."
        primaryCtaLabel="Refresh Feed"
        primaryCtaHref="/expert/discovery" 
      />
    </div>
  );
}
