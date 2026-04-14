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
import {
  Eye,
  Target,
  Zap,
  LayoutList,
  EuroIcon,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc/client";

interface Outcome {
  what: string;
  value: string;
  timeframe: string;
}
interface Phase {
  name: string;
  scope: string;
  duration: string;
}
interface ProposalData {
  automationTitle?: string;
  problemAddressed?: string;
  whatYoullBuild?: string;
  outcomes?: Outcome[];
  tools?: string[];
  phases?: Phase[];
  included?: string[];
  excluded?: string[];
  credibility?: string;
  supportDays?: number;
}

function parseProposal(raw: string | null | undefined): ProposalData | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

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
  const proposal = parseProposal(bid.proposedApproach);

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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Proposal from {bid.specialist.displayName}</DialogTitle>
          <DialogDescription>Job: {bid.jobPost.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {proposal?.automationTitle && (
            <h4 className="font-semibold text-base">{proposal.automationTitle}</h4>
          )}

          {bid.message && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {bid.message}
            </p>
          )}

          {/* Key stats row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
              <EuroIcon className="h-3.5 w-3.5 text-primary" />
              {bid.priceEstimate || "—"}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {bid.estimatedTime}
            </div>
            {proposal?.tools && proposal.tools.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Wrench className="h-3.5 w-3.5" />
                {proposal.tools.slice(0, 3).join(", ")}
                {proposal.tools.length > 3 && ` +${proposal.tools.length - 3}`}
              </div>
            )}
          </div>

          {proposal ? (
            <div className="border-t border-border pt-5 space-y-5">
              {proposal.problemAddressed && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Target className="h-4 w-4 text-primary" /> Problem being
                    addressed
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                    {proposal.problemAddressed}
                  </p>
                </div>
              )}

              {proposal.whatYoullBuild && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Zap className="h-4 w-4 text-primary" /> The automation
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6 whitespace-pre-wrap">
                    {proposal.whatYoullBuild}
                  </p>
                </div>
              )}

              {proposal.outcomes && proposal.outcomes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />{" "}
                    Measurable outcomes
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 pl-6">
                    {proposal.outcomes.map((o, i) => (
                      <div
                        key={i}
                        className="bg-secondary/40 border border-border rounded-lg p-3"
                      >
                        <div className="text-xs text-muted-foreground mb-0.5">
                          {o.what}
                        </div>
                        <div className="font-bold text-foreground">
                          {o.value}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {o.timeframe}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {proposal.phases && proposal.phases.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <LayoutList className="h-4 w-4 text-primary" />{" "}
                    Implementation plan
                  </div>
                  <div className="space-y-2 pl-6">
                    {proposal.phases.map((p, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {p.name}
                            </span>
                            {p.duration && (
                              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                                {p.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {p.scope}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {((proposal.included?.length ?? 0) > 0 ||
                (proposal.excluded?.length ?? 0) > 0) && (
                  <div className="grid sm:grid-cols-2 gap-4 pl-6">
                    {proposal.included && proposal.included.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />{" "}
                          Included
                        </div>
                        <ul className="space-y-1">
                          {proposal.included.map((item, i) => (
                            <li
                              key={i}
                              className="text-xs text-muted-foreground flex items-start gap-1.5"
                            >
                              <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />{" "}
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {proposal.excluded && proposal.excluded.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                          <XCircle className="h-3.5 w-3.5" /> Not included
                        </div>
                        <ul className="space-y-1">
                          {proposal.excluded.map((item, i) => (
                            <li
                              key={i}
                              className="text-xs text-muted-foreground flex items-start gap-1.5"
                            >
                              <XCircle className="h-3 w-3 shrink-0 mt-0.5 opacity-40" />{" "}
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

              {proposal.supportDays && (
                <div className="flex items-center gap-2 pl-6 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Post-delivery support:</span>
                  <span className="text-muted-foreground">
                    {proposal.supportDays} days
                  </span>
                </div>
              )}

              {proposal.credibility && (
                <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 ml-6">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                    <UserCheck className="h-4 w-4 text-primary" /> Why{" "}
                    {bid.specialist.displayName}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {proposal.credibility}
                  </p>
                </div>
              )}
            </div>
          ) : (
            bid.proposedApproach && (
              <div className="border-t border-border pt-5">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Proposed approach
                </div>
                <p className="text-sm whitespace-pre-wrap">
                  {bid.proposedApproach}
                </p>
              </div>
            )
          )}

          {bid.solution && (
            <div className="border-t border-border pt-4">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Linked solution
              </div>
              <p className="text-sm">{bid.solution.title}</p>
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
