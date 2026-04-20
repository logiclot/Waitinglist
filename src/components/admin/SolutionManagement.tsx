"use client";

import { ListingEditor } from "@/components/admin/ListingEditor";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TierBadge } from "@/components/ui/TierBadge";
import {
  useDeleteSolution,
  useSolutions,
  useUpdateSolution,
  useUpdateVideoStatus,
} from "@/hooks/use-admin";
import { getVideoEmbedUrl, normalizeVideoUrl } from "@/lib/video";
import { Solution as TypeSolution } from "@/types";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  Pencil,
  Search,
  Trash2
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Solution = NonNullable<ReturnType<typeof useSolutions>["data"]>[number];

function getVideoStatus(s: Solution) {
  return s.demoVideoStatus ?? "none";
}

function getVideoUrl(s: Solution) {
  return s.demoVideoUrl ?? null;
}

function getVideoResult(s: Solution) {
  const url = getVideoUrl(s);
  if (!url) return null;
  const result = normalizeVideoUrl(url);
  return result.ok ? result : null;
}

function getVideoId(s: Solution) {
  return getVideoResult(s)?.videoId ?? null;
}

function toEditorInitialData(solution: Solution): Partial<TypeSolution> {
  return {
    title: solution.title,
    short_summary: solution.shortSummary ?? "",
    outcome: solution.outcome ?? "",
    description: solution.description ?? "",
    category: solution.category,
    integrations: solution.integrations ?? [],
    included: solution.included ?? [],
    excluded: solution.excluded ?? [],
    prerequisites: solution.requiredInputs ?? [],
    support_days: solution.supportDays ?? 30,
    delivery_days: solution.deliveryDays ?? 3,
    implementation_price: (solution.implementationPriceCents ?? 0) / 100,
    monthly_cost_min: (solution.monthlyCostMinCents ?? 0) / 100,
    monthly_cost_max: (solution.monthlyCostMaxCents ?? 0) / 100,
    demo_video_url: solution.demoVideoUrl ?? "",
  };
}

function toUpdatePayload(data: Partial<TypeSolution>) {
  return {
    title: data.title,
    shortSummary: data.short_summary,
    outcome: data.outcome,
    category: data.category,
    integrations: data.integrations,
    included: data.included,
    excluded: data.excluded,
    requiredInputs: data.prerequisites,
    supportDays: data.support_days,
    implementationPriceCents:
      data.implementation_price_cents ??
      (data.implementation_price !== undefined
        ? Math.round(data.implementation_price * 100)
        : undefined),
    monthlyCostMinCents:
      data.monthly_cost_min_cents ??
      (data.monthly_cost_min !== undefined
        ? Math.round(data.monthly_cost_min * 100)
        : undefined),
    monthlyCostMaxCents:
      data.monthly_cost_max_cents ??
      (data.monthly_cost_max !== undefined
        ? Math.round(data.monthly_cost_max * 100)
        : undefined),
    demoVideoUrl: data.demo_video_url || null,
  };
}

export function SolutionManagement() {
  const { data: solutions, isPending, refetch } = useSolutions();
  const deleteMutation = useDeleteSolution();
  const videoStatusMutation = useUpdateVideoStatus();
  const updateSolutionMutation = useUpdateSolution();

  const [searchQuery, setSearchQuery] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);

  const pendingSolutions = useMemo(
    () => (solutions ?? []).filter((s) => getVideoStatus(s) === "pending"),
    [solutions],
  );

  const allSolutions = useMemo(() => {
    const list = solutions ?? [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.expert?.displayName?.toLowerCase().includes(q),
    );
  }, [solutions, searchQuery]);

  const handleDelete = (solution: Solution) => {
    if (!confirm(`Delete "${solution.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(
      { id: solution.id },
      {
        onSuccess: () => {
          toast.success("Solution deleted");
          refetch();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleVideoStatus = (
    id: string,
    status: "approved" | "rejected",
    reason?: string,
  ) => {
    videoStatusMutation.mutate(
      { id, status, rejectionReason: reason },
      {
        onSuccess: () => {
          toast.success(
            status === "approved" ? "Video approved" : "Video rejected",
          );
          refetch();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const startRejection = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
  };

  const confirmRejection = (id: string) => {
    handleVideoStatus(id, "rejected", rejectReason.trim() || undefined);
    setRejectingId(null);
    setRejectReason("");
  };

  const handleSaveEdit = (data: Partial<TypeSolution>) => {
    if (!editingSolution) return;
    const payload = toUpdatePayload(data);
    updateSolutionMutation.mutate(
      { id: editingSolution.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Solution updated");
          setEditingSolution(null);
          refetch();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (editingSolution) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit: {editingSolution.title}</h2>
          <button
            onClick={() => setEditingSolution(null)}
            disabled={updateSolutionMutation.isPending}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            ← Back
          </button>
        </div>
        <ListingEditor
          initialData={toEditorInitialData(editingSolution)}
          onSave={handleSaveEdit}
          onCancel={() => setEditingSolution(null)}
          isSaving={updateSolutionMutation.isPending}
        />
      </div>
    );
  }

  if (isPending) {
    return <SolutionManagementSkeleton />;
  }

  if (!solutions || solutions.length === 0) {
    return (
      <div className="border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
        No solutions found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Video Reviews */}
      {pendingSolutions.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 text-yellow-500 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <h2>Pending Video Reviews ({pendingSolutions.length})</h2>
          </div>
          <div className="space-y-4">
            {pendingSolutions.map((solution) => (
              <div
                key={solution.id}
                className="bg-background border border-border rounded-lg p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold">{solution.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Expert: {solution.expert?.displayName}
                    </p>
                    {getVideoUrl(solution) && (
                      <a
                        href={getVideoUrl(solution)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />{" "}
                        {getVideoUrl(solution)}
                      </a>
                    )}
                  </div>
                  <div className="w-64 bg-black rounded aspect-video overflow-hidden">
                    {getVideoId(solution) ? (
                      <iframe
                        src={getVideoEmbedUrl(
                          getVideoId(solution)!,
                          getVideoResult(solution)?.provider ?? "youtube",
                        )}
                        className="w-full h-full"
                        title="Preview"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        No Preview
                      </div>
                    )}
                  </div>
                </div>

                {(() => {
                  const pendingId = videoStatusMutation.isPending
                    ? videoStatusMutation.variables?.id
                    : null;
                  const isApproving =
                    pendingId === solution.id &&
                    videoStatusMutation.variables?.status === "approved";
                  const isRejecting =
                    pendingId === solution.id &&
                    videoStatusMutation.variables?.status === "rejected";
                  const isBusy = isApproving || isRejecting;

                  return rejectingId === solution.id ? (
                    <div className="mt-4 space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Optional: explain what needs to change so the expert can fix it..."
                        rows={2}
                        disabled={isRejecting}
                        className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:border-destructive disabled:opacity-50"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRejectingId(null)}
                          disabled={isRejecting}
                          className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => confirmRejection(solution.id)}
                          disabled={isRejecting}
                          className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRejecting && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() =>
                          handleVideoStatus(solution.id, "approved")
                        }
                        disabled={isBusy}
                        className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isApproving && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        Approve Video
                      </button>
                      <button
                        onClick={() => startRejection(solution.id)}
                        disabled={isBusy}
                        className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRejecting && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        Reject Video
                      </button>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + All Solutions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-bold text-lg">All Solutions</h2>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, category, or expert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {allSolutions.map((solution) => (
          <SolutionCard
            key={solution.id}
            solution={solution}
            onEdit={() => setEditingSolution(solution)}
            onDelete={() => handleDelete(solution)}
          />
        ))}
      </div>
    </div>
  );
}

function SolutionCard({
  solution,
  onEdit,
  onDelete,
}: {
  solution: Solution;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const videoStatus = getVideoStatus(solution);

  const expert = solution.expert;
  const expertName = expert?.legalFullName ?? expert?.displayName ?? null;
  const expertEmail = expert?.user?.email ?? null;

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="font-semibold truncate">{solution.title}</h3>
          <span className="shrink-0 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {solution.category}
          </span>
        </div>
        {(expertName || expertEmail || expert?.tier) && (
          <div className="mt-1.5 flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {expertName && <span className="font-medium text-foreground">{expertName}</span>}
            {expertEmail && (
              <>
                {expertName && <span>·</span>}
                <span>{expertEmail}</span>
              </>
            )}
            {expert?.tier && <TierBadge tier={expert.tier} />}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {videoStatus === "approved" && (
          <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
            Video Approved
          </span>
        )}
        {videoStatus === "rejected" && (
          <span className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            Video Rejected
          </span>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          title="Edit solution"
          onClick={onEdit}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon-sm"
          title="Delete solution"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function SolutionManagementSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search bar skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-72 rounded-md" />
      </div>

      {/* Solution card skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
