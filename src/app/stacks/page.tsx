import { getPublishedEcosystems } from "@/actions/ecosystems";
import { EcosystemCard } from "@/components/ecosystems/EcosystemCard";

export const metadata = {
  title: "Solution Suites | LogicLot",
  description: "Curated suites of automation solutions that work better together.",
};

export default async function StacksPage() {
  const ecosystems = await getPublishedEcosystems();

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-secondary/30 border-b border-border py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Solution Suites</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Proven sequences of automations that work together. Start with one, expand when ready.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {ecosystems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No suites published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ecosystems.map((eco) => (
              <EcosystemCard key={eco.id} ecosystem={eco} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
