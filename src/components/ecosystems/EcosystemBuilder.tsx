"use client";

import { useState } from "react";
import { Solution } from "@/types";
import { Plus, Trash2, ArrowUp, ArrowDown, Search } from "lucide-react";
import { addSolutionToEcosystem, removeSolutionFromEcosystem, reorderEcosystemItems } from "@/actions/ecosystems";
import { toast } from "sonner";

interface EcosystemItem {
  id: string;
  solutionId: string;
  ecosystemId?: string;
  position: number;
  solution: Solution;
  createdAt?: string | Date;
  note?: string | null;
}

interface EcosystemBuilderProps {
  ecosystemId: string;
  initialItems: EcosystemItem[];
  availableSolutions: Solution[]; // All solutions owned by expert
}

export function EcosystemBuilder({ ecosystemId, initialItems, availableSolutions }: EcosystemBuilderProps) {
  const [items, setItems] = useState<EcosystemItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Filter available solutions to exclude already added ones
  const filteredSolutions = availableSolutions
    .filter(s => !items.find(i => i.solutionId === s.id))
    .filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (solutionId: string) => {
    setIsAdding(true);
    const res = await addSolutionToEcosystem(ecosystemId, solutionId);
    setIsAdding(false);

    if (res.success) {
      toast.success("Added to suite");
      // Optimistic update or refresh needed. For MVP, we can just reload or fetch.
      // Ideally we'd get the new item back, but let's just refresh the page data via router.refresh() in parent or here
      // For now, let's just manually construct the item to update local state
      const solution = availableSolutions.find(s => s.id === solutionId);
      if (solution) {
        const newItem: EcosystemItem = {
          id: "temp-" + Date.now(), // Temp ID until refresh
          solutionId,
          position: items.length,
          solution,
          ecosystemId,
          createdAt: new Date().toISOString(),
          note: null
        };
        setItems([...items, newItem]);
      }
    } else {
      toast.error("Failed to add solution");
    }
  };

  const handleRemove = async (solutionId: string) => {
    const res = await removeSolutionFromEcosystem(ecosystemId, solutionId);
    if (res.success) {
      toast.success("Removed from suite");
      setItems(items.filter(i => i.solutionId !== solutionId));
    } else {
      toast.error("Failed to remove solution");
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update positions locally
    newItems.forEach((item, idx) => item.position = idx);
    setItems(newItems);

    // Save to server
    const orderedIds = newItems.map(i => i.solutionId);
    await reorderEcosystemItems(ecosystemId, orderedIds);
  };

  return (
    <div className="space-y-8">
      {/* Current Stack */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Included Solutions ({items.length})</h3>
        
        {items.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">
            No solutions in this suite yet. Add some below.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.solutionId} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-secondary rounded text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1 hover:bg-secondary rounded text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{item.solution.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{item.solution.short_summary || item.solution.outcome}</p>
                </div>

                <div className="text-right text-sm font-medium mr-4">
                  ${((item.solution.implementation_price_cents ?? 0) / 100).toLocaleString()}
                </div>

                <button 
                  onClick={() => handleRemove(item.solutionId)}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Solutions */}
      <div className="bg-secondary/20 p-6 rounded-xl border border-border">
        <h3 className="font-bold text-lg mb-4">Add Solutions</h3>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your solutions..."
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredSolutions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No matching solutions found.</p>
          ) : (
            filteredSolutions.map(solution => (
              <div key={solution.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{solution.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{solution.category}</p>
                </div>
                <button
                  onClick={() => handleAdd(solution.id)}
                  disabled={isAdding}
                  className="ml-3 p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
