import Link from "next/link";
import { Plus, Package, Edit, Eye } from "lucide-react";
import { getExpertEcosystems } from "@/actions/ecosystems";
import { DeleteEcosystemButton } from "@/components/ecosystems/DeleteEcosystemButton";

export const metadata = {
  title: "Suites | LogicLot",
};

export default async function ExpertEcosystemsPage() {
  const ecosystems = await getExpertEcosystems();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Suites</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Group solutions that work best together. Buyers will see a recommended suite and can purchase step-by-step.
          </p>
        </div>
        <Link
          href="/expert/ecosystems/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Suite
        </Link>
      </div>

      {ecosystems.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-lg mb-2">No Suites Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Create your first suite to help buyers understand how your solutions fit together.
          </p>
          <Link
            href="/expert/ecosystems/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Create Suite
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecosystems.map((eco) => (
            <div key={eco.id} className="bg-card border border-border rounded-xl p-5 flex flex-col h-full hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg line-clamp-1">{eco.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      eco.published
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {eco.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-muted-foreground">{eco.items.length} Solutions</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                {eco.description}
              </p>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Link
                  href={`/expert/ecosystems/${eco.id}`}
                  className="flex-1 text-center bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Link>
                {eco.published && (
                  <Link
                    href={`/stacks/${eco.slug}`}
                    target="_blank"
                    className="flex-1 text-center border border-border hover:bg-secondary/50 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                )}
                <DeleteEcosystemButton ecosystemId={eco.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
