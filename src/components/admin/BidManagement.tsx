"use client";

import { useState } from "react";
import { useBids, useUpdateBidStatus } from "@/hooks/use-admin";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BidStatus } from "@prisma/client";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc/client";

type Bid = NonNullable<ReturnType<typeof useBids>["data"]>[number];

const STATUS_OPTIONS: BidStatus[] = [
  "submitted",
  "shortlisted",
  "accepted",
  "rejected",
  "withdrawn",
];

function BidManagementSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <Table className="border-border">
        <TableHeader className="bg-secondary/50">
          <TableRow>
            <TableHead className="px-6">Expert</TableHead>
            <TableHead className="px-6">Job</TableHead>
            <TableHead className="px-6">Estimate</TableHead>
            <TableHead className="px-6">Price</TableHead>
            <TableHead className="px-6">Status</TableHead>
            <TableHead className="px-6">Submitted</TableHead>
            <TableHead className="px-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 7 }).map((_, j) => (
                <TableCell key={j} className="px-6 py-4">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProposalDialog({ bid }: { bid: Bid }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          title="View proposal"
        >
          <Eye className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proposal from {bid.specialist.displayName}</DialogTitle>
          <DialogDescription>
            Job: {bid.jobPost.title}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Message</div>
            <p className="whitespace-pre-wrap">{bid.message}</p>
          </div>
          {bid.proposedApproach && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Proposed approach</div>
              <p className="whitespace-pre-wrap">{bid.proposedApproach}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Estimated time</div>
              <p>{bid.estimatedTime}</p>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Price estimate</div>
              <p>{bid.priceEstimate || "—"}</p>
            </div>
          </div>
          {bid.solution && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Linked solution</div>
              <p>{bid.solution.title}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BidManagement() {
  const { data: bids, isPending } = useBids();
  const { mutateAsync: updateStatus } = useUpdateBidStatus();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: BidStatus) => {
    setUpdatingId(id);
    try {
      await updateStatus({ id, status });
      await queryClient.invalidateQueries({
        queryKey: trpc.admin.expert.getBids.queryOptions().queryKey,
      });
      toast.success("Bid status updated");
    } catch {
      toast.error("Failed to update bid status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isPending) return <BidManagementSkeleton />;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <Table className="border-border">
        <TableHeader className="bg-secondary/50">
          <TableRow>
            <TableHead className="px-6">Expert</TableHead>
            <TableHead className="px-6">Job</TableHead>
            <TableHead className="px-6">Estimate</TableHead>
            <TableHead className="px-6">Price</TableHead>
            <TableHead className="px-6">Status</TableHead>
            <TableHead className="px-6">Submitted</TableHead>
            <TableHead className="px-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids?.map((bid) => (
            <TableRow key={bid.id} className="hover:bg-secondary/20">
              <TableCell className="px-6 py-4">
                <div className="font-medium">{bid.specialist.displayName}</div>
                <div className="text-xs text-muted-foreground">
                  {bid.specialist.user?.email}
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                {bid.jobPost.title}
              </TableCell>
              <TableCell className="px-6 py-4 text-muted-foreground">
                {bid.estimatedTime}
              </TableCell>
              <TableCell className="px-6 py-4 text-muted-foreground">
                {bid.priceEstimate || "—"}
              </TableCell>
              <TableCell className="px-6 py-4">
                <Select
                  value={bid.status}
                  onValueChange={(v) => handleStatusChange(bid.id, v as BidStatus)}
                  disabled={updatingId === bid.id}
                >
                  <SelectTrigger className="h-8 w-[130px] capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="px-6 py-4 text-muted-foreground text-xs">
                {new Date(bid.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <ProposalDialog bid={bid} />
              </TableCell>
            </TableRow>
          ))}
          {(!bids || bids.length === 0) && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="px-6 py-8 text-center text-muted-foreground text-sm"
              >
                No bids yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
