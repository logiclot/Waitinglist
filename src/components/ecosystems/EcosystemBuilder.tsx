"use client";

import { useState, useEffect } from "react";
import { Solution } from "@/types";
import { Plus, Trash2, ArrowUp, ArrowDown, Search, Send, Users, Clock } from "lucide-react";
import {
  addSolutionToEcosystem,
  removeSolutionFromEcosystem,
  reorderEcosystemItems,
  searchPublishedSolutions,
  inviteToEcosystem,
} from "@/actions/ecosystems";
import { toast } from "sonner";

interface EcosystemItem {
  id: string;
  solutionId: string;
  ecosystemId?: string;
  position: number;
  solution: Solution & { expertId?: string; expert?: { id: string; displayName: string; slug: string } };
  createdAt?: string | Date;
  note?: string | null;
}

interface PendingInvite {
  id: string;
  solutionId: string;
  status: string;
  solution: { id: string; title: string; category?: string };
  invitee: { displayName: string };
}

interface EcosystemBuilderProps {
  ecosystemId: string;
  ecosystemExpertId: string;
  initialItems: EcosystemItem[];
  availableSolutions: Solution[];
  pendingInvites: PendingInvite[];
}

export function EcosystemBuilder({
  ecosystemId,
  ecosystemExpertId,
  initialItems,
  availableSolutions,
  pendingInvites: initialPendingInvites,
}: EcosystemBuilderProps) {
  const [items, setItems] = useState<EcosystemItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Partner invite state
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerResults, setPartnerResults] = useState<
    Array<{ id: string; title: string; category: string; expert: { id: string; displayName: string; slug: string } }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState(initialPendingInvites);

  // Debounced partner search
  useEffect(() => {
    if (partnerSearch.length < 2) {
      setPartnerResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPublishedSolutions(partnerSearch, ecosystemId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPartnerResults(results as any);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [partnerSearch, ecosystemId]);

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
      const solution = availableSolutions.find(s => s.id === solutionId);
      if (solution) {
        const newItem: EcosystemItem = {
          id: "temp-" + Date.now(),
          solutionId,
          position: items.length,
          solution: { ...solution, expertId: undefined, expert: undefined },
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
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, idx) => item.position = idx);
    setItems(newItems);

    const orderedIds = newItems.map(i => i.solutionId);
    await reorderEcosystemItems(ecosystemId, orderedIds);
  };

  const handleInvite = async (solutionId: string) => {
    setIsInviting(true);
    const res = await inviteToEcosystem(ecosystemId, solutionId);
    setIsInviting(false);

    if (res.success) {
      toast.success("Invite sent!");
      // Move from search results to pending
      const sol = partnerResults.find(s => s.id === solutionId);
      if (sol) {
        setPendingInvites([
          ...pendingInvites,
          {
            id: "temp-" + Date.now(),
            solutionId,
            status: "pending",
            solution: { id: sol.id, title: sol.title, category: sol.category },
            invitee: { displayName: sol.expert.displayName },
          },
        ]);
        setPartnerResults(partnerResults.filter(s => s.id !== solutionId));
      }
    } else {
      toast.error(res.error || "Failed to send invite");
    }
  };

  const isPartnerSolution = (item: EcosystemItem) => {
    return item.solution.expertId && item.solution.expertId !== ecosystemExpertId;
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
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm truncate">{item.solution.title}</h4>
                    {isPartnerSolution(item) && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium border border-blue-100 shrink-0">
                        Partner
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {isPartnerSolution(item) && item.solution.expert
                      ? `by ${item.solution.expert.displayName} · `
                      : ""}
                    {item.solution.short_summary || item.solution.outcome}
                  </p>
                </div>

                <div className="text-right text-sm font-medium mr-4">
                  &euro;{((item.solution.implementation_price_cents ?? 0) / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <button
                  onClick={() => handleRemove(item.solutionId)}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Total price row */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-xl mt-1">
              <span className="font-bold text-sm text-foreground">Total</span>
              <span className="font-bold text-lg text-foreground">
                &euro;{(items.reduce((sum, item) => sum + (item.solution.implementation_price_cents ?? 0), 0) / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add Your Solutions */}
      <div className="bg-secondary/20 p-6 rounded-xl border border-border">
        <h3 className="font-bold text-lg mb-4">Add Your Solutions</h3>

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

      {/* Invite Partner Solutions */}
      <div className="bg-blue-50/50 dark:bg-blue-950/10 p-6 rounded-xl border border-blue-200 dark:border-blue-900">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg">Invite Partner Solutions</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Search for solutions from other experts and invite them to join your suite. They will be notified and can accept or decline.
        </p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={partnerSearch}
            onChange={(e) => setPartnerSearch(e.target.value)}
            placeholder="Search solutions from other experts..."
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Search Results */}
        {partnerSearch.length >= 2 && (
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {isSearching ? (
              <p className="text-sm text-muted-foreground text-center py-4">Searching...</p>
            ) : partnerResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No matching solutions from other experts.</p>
            ) : (
              partnerResults.map(solution => (
                <div key={solution.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{solution.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      by {solution.expert.displayName} &middot; {solution.category}
                    </p>
                  </div>
                  <button
                    onClick={() => handleInvite(solution.id)}
                    disabled={isInviting}
                    className="ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" /> Invite
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Pending Invites ({pendingInvites.length})
            </h4>
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{invite.solution.title}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Awaiting response from {invite.invitee.displayName}
                  </p>
                </div>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full font-medium shrink-0">
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
