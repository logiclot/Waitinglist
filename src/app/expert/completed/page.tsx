import { EmptyState } from "@/components/EmptyState";

export default function ExpertCompletedPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Project History</h1>
      
      {/* Tabs Placeholder */}
      <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto">
        {["All", "Won", "Lost", "Expired", "Withdrawn"].map((tab, i) => (
          <button 
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              i === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <EmptyState
        title="No history yet"
        description="Your bidding and project history will appear here."
        primaryCtaLabel="Find Work"
        primaryCtaHref="/expert/find-work"
      />
    </div>
  );
}
