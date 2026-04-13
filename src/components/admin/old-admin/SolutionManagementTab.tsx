"use client";

import { useState, useMemo, useEffect } from "react";
import { AlertTriangle, ExternalLink, Pencil, Plus, Trash2, Search } from "lucide-react";
import { normalizeVideoUrl, getVideoEmbedUrl } from "@/lib/video";
import { Solution } from "@/types";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/PaginationControls";

interface SolutionManagementTabProps {
  solutionList: Solution[];
  onVideoStatus: (id: string, status: "approved" | "rejected", reason?: string) => void;
  onEditSolution: (solution: Solution) => void;
  onCreateNew: () => void;
  onDeleteSolution: (id: string) => void;
}

export function SolutionManagementTab({
  solutionList,
  onVideoStatus,
  onEditSolution,
  onCreateNew,
  onDeleteSolution,
}: SolutionManagementTabProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const getVideoStatus = (s: Solution) => s.demoVideoStatus ?? s.demo_video_status;
  const getVideoUrl = (s: Solution) => s.demoVideoUrl ?? s.demo_video_url;
  const getVideoResult = (s: Solution) => {
    const url = getVideoUrl(s);
    if (!url) return null;
    const result = normalizeVideoUrl(url);
    return result.ok ? result : null;
  };
  const getVideoId = (s: Solution) => getVideoResult(s)?.videoId ?? null;

  const pendingSolutions = solutionList.filter((s) => getVideoStatus(s) === "pending");
  const activeSolutions = solutionList.filter((s) => getVideoStatus(s) !== "pending");

  // --- Search + Pagination ---
  const [searchQuery, setSearchQuery] = useState("");
  const filteredActive = useMemo(() => {
    if (!searchQuery.trim()) return activeSolutions;
    const q = searchQuery.toLowerCase();
    return activeSolutions.filter((s) =>
      s.title?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      // @ts-expect-error: expert relation
      s.expert?.displayName?.toLowerCase().includes(q)
    );
  }, [activeSolutions, searchQuery]);

  const pag = usePagination(filteredActive, 20);

  useEffect(() => { pag.setPage(1); }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  function startRejection(id: string) {
    setRejectingId(id);
    setRejectReason("");
  }

  function confirmRejection(id: string) {
    onVideoStatus(id, "rejected", rejectReason.trim() || undefined);
    setRejectingId(null);
    setRejectReason("");
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
        >
          <Plus className="h-4 w-4" /> Create New Solution
        </button>
      </div>

      {pendingSolutions.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 text-yellow-500 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <h2>Pending Video Reviews ({pendingSolutions.length})</h2>
          </div>
          <div className="space-y-4">
            {pendingSolutions.map((solution) => (
              <div key={solution.id} className="bg-background border border-border rounded-lg p-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold">{solution.title}</h3>
                    {/* @ts-expect-error: expert relation */}
                    <p className="text-xs text-muted-foreground">Expert: {solution.expert?.displayName}</p>
                    {getVideoUrl(solution) && (
                      <a
                        href={getVideoUrl(solution)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> {getVideoUrl(solution)}
                      </a>
                    )}
                  </div>
                  <div className="w-64 bg-black rounded aspect-video overflow-hidden">
                    {getVideoId(solution) ? (
                      <iframe
                        src={getVideoEmbedUrl(getVideoId(solution)!, getVideoResult(solution)?.provider ?? 'youtube')}
                        className="w-full h-full"
                        title="Preview"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No Preview</div>
                    )}
                  </div>
                </div>

                {/* Rejection reason form */}
                {rejectingId === solution.id ? (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Optional: explain what needs to change so the expert can fix it..."
                      rows={2}
                      className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:border-destructive"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => confirmRejection(solution.id)}
                        className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-bold"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => onVideoStatus(solution.id, "approved")}
                      className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-xs font-bold"
                    >
                      Approve Video
                    </button>
                    <button
                      onClick={() => startRejection(solution.id)}
                      className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-bold"
                    >
                      Reject Video
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-bold text-lg">All Solutions</h2>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title or expert name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        {pag.items.map((solution) => (
          <div key={solution.id} className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{solution.title}</h3>
                <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">{solution.category}</span>
              </div>
              {/* @ts-expect-error: expert relation */}
              <p className="text-xs text-muted-foreground mb-1">Specialist: {solution.expert?.legalFullName ?? solution.expert?.displayName ?? "—"}</p>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{solution.short_summary}</p>
              <div className="flex items-center gap-3 mt-1">
                <button onClick={() => onEditSolution(solution)} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => onDeleteSolution(solution.id)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
            <div className="text-right shrink-0">
              {getVideoStatus(solution) === "approved" && (
                <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">Video Approved</span>
              )}
              {getVideoStatus(solution) === "rejected" && (
                <span className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">Video Rejected</span>
              )}
              {!getVideoUrl(solution) && <span className="text-xs text-muted-foreground">No Video</span>}
            </div>
          </div>
        ))}
        <PaginationControls
          page={pag.page}
          totalPages={pag.totalPages}
          totalItems={pag.totalItems}
          onPrev={pag.prevPage}
          onNext={pag.nextPage}
        />
      </div>
    </div>
  );
}
