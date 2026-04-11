"use client";

import { useState, useMemo } from "react";
import {
  useExperts,
  useSuspendExpert,
  useDeleteExpert,
  useSetExpertTier,
} from "@/hooks/use-admin";
import { TIER_THRESHOLDS } from "@/lib/commission";
import { SpecialistTier } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Pause, Search, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc/client";

type Expert = NonNullable<ReturnType<typeof useExperts>["data"]>[number];

function StatusBadge({ expert }: { expert: Expert }) {
  const isApproved = expert.status === "APPROVED";
  const isSuspended = expert.status === "SUSPENDED";

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isApproved
          ? "bg-green-500/10 text-green-600"
          : isSuspended
            ? "bg-red-500/10 text-red-500"
            : "bg-muted text-muted-foreground"
          }`}
      >
        {expert.status.replace(/_/g, " ")}
      </span>
      {expert.tier === "FOUNDING" && expert.foundingRank != null && (
        <span className="text-[10px] font-semibold text-yellow-600">
          Founding #{expert.foundingRank}
        </span>
      )}
    </div>
  );
}

function TierFeeCell({
  expert,
  onTierChange,
  isPending,
}: {
  expert: Expert;
  onTierChange: (tier: SpecialistTier) => void;
  isPending: boolean;
}) {
  const fee = TIER_THRESHOLDS[expert.tier as keyof typeof TIER_THRESHOLDS] ?? expert.platformFeePercentage;

  return (
    <div className="flex flex-col gap-1.5">
      <Select
        value={expert.tier}
        onValueChange={(v) => onTierChange(v as SpecialistTier)}
        disabled={isPending}
      >
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(TIER_THRESHOLDS) as SpecialistTier[]).map((tier) => (
            <SelectItem key={tier} value={tier}>
              {tier}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="text-xs text-muted-foreground">
        Fee {fee}% &middot; {expert.completedSalesCount} sale{expert.completedSalesCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

function ExpertDetailDialog({ expert }: { expert: Expert }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="View details">
          <Eye className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expert.displayName}</DialogTitle>
          <DialogDescription>{expert.legalFullName}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 text-sm">
          <Row label="Email" value={expert.user.email} />
          <Row label="Country" value={expert.country} />
          <Row label="Experience" value={expert.yearsExperience} />
          <Row label="Bio" value={expert.bio ?? "—"} />
          <Row label="Tier" value={expert.tier} />
          <Row label="Fee" value={`${expert.platformFeePercentage}%`} />
          <Row label="Sales" value={String(expert.completedSalesCount)} />
          <Row label="Status" value={expert.status.replace(/_/g, " ")} />
          {expert.tier === "FOUNDING" && (
            <Row
              label="Founding Rank"
              value={expert.foundingRank != null ? `#${expert.foundingRank}` : "Yes"}
            />
          )}
          <Row
            label="Stripe"
            value={expert.stripeAccountId ? "Connected" : "Not connected"}
          />
          <Row label="Calendar" value={expert.calendarUrl ?? "—"} />
          {expert.tools.length > 0 && (
            <div>
              <span className="font-medium text-muted-foreground">Tools</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {expert.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-md bg-muted px-1.5 py-0.5 text-xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export function ExpertManagement() {
  const { data: experts, isPending, refetch } = useExperts();
  const queryClient = useQueryClient()
  const suspendMutation = useSuspendExpert();
  const deleteMutation = useDeleteExpert();
  const tierMutation = useSetExpertTier();
  const [changingTierId, setChangingTierId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");

  const filteredExperts = useMemo(() => {
    if (!experts) return [];
    return experts.filter((expert) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        expert.displayName.toLowerCase().includes(q) ||
        expert.legalFullName.toLowerCase().includes(q) ||
        expert.user.email.toLowerCase().includes(q) ||
        expert.tools.some((tool) => tool.toLowerCase().includes(q))
      const matchesTier = tierFilter === "ALL" || expert.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [experts, search, tierFilter]);

  const handleSuspend = (expert: Expert) => {
    if (!confirm(`Suspend ${expert.displayName}?`)) return;
    suspendMutation.mutate(
      { id: expert.id },
      {
        onSuccess: () => refetch(), onError(error) {
          toast.error(error.message)
        },
      },
    );
  };

  const handleDelete = (expert: Expert) => {
    if (
      !confirm(
        `Permanently delete ${expert.user.email} and all their data? This cannot be undone.`,
      )
    )
      return;
    deleteMutation.mutate(
      { userId: expert.user.id },
      {
        onSuccess: () => refetch(), onError(error) {
          toast.error(error.message)
        },
      },
    );
  };

  const handleTierChange = (expert: Expert, tier: SpecialistTier) => {
    setChangingTierId(expert.id);
    tierMutation.mutate(
      { id: expert.id, tier },
      {
        onSettled: () => setChangingTierId(null),
        onSuccess: () => {
          refetch()
          queryClient.invalidateQueries({ queryKey: trpc.admin.analytics.getStats.queryOptions().queryKey })
        },
        onError(error) {
          toast.error(error.message)
        },
      },
    );
  };

  if (isPending) {
    return <ExpertManagementSkeleton />;
  }

  if (!experts || experts.length === 0) {
    return (
      <div className="border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
        No experts found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-36" size="sm">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Tiers</SelectItem>
            {(Object.keys(TIER_THRESHOLDS) as SpecialistTier[]).map((tier) => (
              <SelectItem key={tier} value={tier}>
                {tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="px-4">Expert</TableHead>
              <TableHead className="px-4">Tools</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="px-4">Tier &amp; Fee</TableHead>
              <TableHead className="px-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExperts.map((expert) => (
              <TableRow key={expert.id}>
                {/* Expert info */}
                <TableCell className="px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{expert.legalFullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {expert.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {expert.user.email}
                    </span>
                    {expert.country && (
                      <span className="text-xs text-muted-foreground">
                        {expert.country}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Tools & experience */}
                <TableCell className="px-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {expert.yearsExperience} yrs exp.
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {expert.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="px-4">
                  <StatusBadge expert={expert} />
                </TableCell>

                {/* Tier & Fee */}
                <TableCell className="px-4">
                  <TierFeeCell
                    expert={expert}
                    onTierChange={(tier) => handleTierChange(expert, tier)}
                    isPending={changingTierId === expert.id}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell className="px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ExpertDetailDialog expert={expert} />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Suspend"
                      disabled={expert.status === "SUSPENDED"}
                      onClick={() => handleSuspend(expert)}
                    >
                      <Pause className="size-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      title="Delete user"
                      onClick={() => handleDelete(expert)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ExpertManagementSkeleton() {
  return (<div className="border border-border rounded-xl overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="bg-secondary/50">
          <TableHead className="px-4">Expert</TableHead>
          <TableHead className="px-4">Tools</TableHead>
          <TableHead className="px-4">Status</TableHead>
          <TableHead className="px-4">Tier &amp; Fee</TableHead>
          <TableHead className="px-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell className="px-4">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-16" />
              </div>
            </TableCell>
            <TableCell className="px-4">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-16" />
                <div className="flex flex-wrap gap-1">
                  <Skeleton className="h-5 w-14 rounded-md" />
                  <Skeleton className="h-5 w-18 rounded-md" />
                  <Skeleton className="h-5 w-12 rounded-md" />
                </div>
              </div>
            </TableCell>
            <TableCell className="px-4">
              <Skeleton className="h-5 w-20 rounded-full" />
            </TableCell>
            <TableCell className="px-4">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-3 w-24" />
              </div>
            </TableCell>
            <TableCell className="px-4 text-right">
              <div className="flex items-center justify-end gap-1">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>)
}