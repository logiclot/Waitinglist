"use client";

import { useState } from "react";
import { updateDisputeNotes, resolveDispute } from "@/actions/admin";
import { StarRating } from "@/components/reviews/StarRating";
import {
  AlertTriangle, ChevronDown, ChevronUp, Clock, DollarSign, User, Briefcase,
  MessageSquare, CheckCircle2, XCircle, ArrowRight, Shield, FileText, Loader2,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AdminDispute {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  adminNotes: string | null;
  resolution: string | null;
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    priceCents: number;
    status: string;
    milestones: { title: string; priceCents?: number; price?: number; status: string; fundedAt?: string; releasedAt?: string }[] | null;
    createdAt: string;
    buyer: {
      id: string;
      email: string;
      createdAt: string;
      businessProfile: { companyName: string | null; firstName: string | null } | null;
    };
    seller: {
      id: string;
      displayName: string | null;
      tier: string;
      completedSalesCount: number;
      userId: string;
      user: { email: string; createdAt: string };
    };
    solution: { title: string } | null;
    bid: { jobPost: { title: string } } | null;
    review: {
      sellerRating: number | null;
      sellerComment: string | null;
      buyerRating: number | null;
      buyerComment: string | null;
    } | null;
    conversations: { id: string; _count: { messages: number } }[];
  };
}

interface DisputeManagementTabProps {
  disputes: AdminDispute[];
  showMessage: (msg: string, error?: boolean) => void;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    open:          { label: "Open",          className: "bg-red-100 text-red-700" },
    investigating: { label: "Investigating", className: "bg-amber-100 text-amber-700" },
    resolved:      { label: "Resolved",      className: "bg-green-100 text-green-700" },
  };
  const { label, className } = map[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${className}`}>{label}</span>;
}

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function formatCents(cents: number) {
  return `€${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`;
}

export function DisputeManagementTab({ disputes, showMessage }: DisputeManagementTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [resolutionType, setResolutionType] = useState<Record<string, string>>({});
  const [resolutionNote, setResolutionNote] = useState<Record<string, string>>({});
  const [partialAmount, setPartialAmount] = useState<Record<string, string>>({});
  const [resolving, setResolving] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState<string | null>(null);

  const openDisputes = disputes.filter((d) => d.status !== "resolved");
  const resolvedDisputes = disputes.filter((d) => d.status === "resolved");

  const handleSaveNotes = async (orderId: string) => {
    setSavingNotes(orderId);
    const res = await updateDisputeNotes(orderId, notes[orderId] ?? "");
    setSavingNotes(null);
    if ("success" in res) showMessage("Notes saved.");
    else showMessage(res.error ?? "Failed to save notes.", true);
  };

  const handleResolve = async (orderId: string) => {
    const type = resolutionType[orderId];
    if (!type) { showMessage("Select a resolution type.", true); return; }
    const note = resolutionNote[orderId]?.trim();
    if (!note || note.length < 5) { showMessage("Please add a resolution note (min 5 chars).", true); return; }

    const confirmed = confirm(`Are you sure you want to resolve this dispute as "${type.replace(/_/g, " ")}"? This action cannot be undone.`);
    if (!confirmed) return;

    setResolving(orderId);
    const partial = type === "partial_refund" ? parseInt(partialAmount[orderId] || "0") * 100 : undefined;
    const res = await resolveDispute(
      orderId,
      type as "full_refund" | "release_to_seller" | "partial_refund" | "dismissed",
      note,
      partial
    );
    setResolving(null);
    if ("success" in res) showMessage("Dispute resolved successfully.");
    else showMessage(res.error ?? "Failed to resolve dispute.", true);
  };

  const renderDisputeCard = (dispute: AdminDispute) => {
    const isExpanded = expandedId === dispute.id;
    const d = dispute;
    const o = d.order;
    const milestones = o.milestones ?? [];
    const projectTitle = o.solution?.title ?? o.bid?.jobPost?.title ?? "Untitled Project";
    const buyerName = o.buyer.businessProfile?.companyName ?? o.buyer.businessProfile?.firstName ?? o.buyer.email;
    const sellerName = o.seller.displayName ?? o.seller.user.email;

    const escrowedCents = milestones
      .filter((m) => m.status === "in_escrow")
      .reduce((sum, m) => sum + (m.priceCents ?? (m.price ? Math.round(m.price * 100) : 0)), 0);
    const releasedCents = milestones
      .filter((m) => m.status === "released")
      .reduce((sum, m) => sum + (m.priceCents ?? (m.price ? Math.round(m.price * 100) : 0)), 0);
    const totalMsgCount = o.conversations.reduce((sum, c) => sum + c._count.messages, 0);

    return (
      <div key={d.id} className="border border-border rounded-xl overflow-hidden bg-card">
        {/* Header row */}
        <button
          type="button"
          onClick={() => setExpandedId(isExpanded ? null : d.id)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-3 text-left">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${d.status === "open" ? "text-red-500" : d.status === "resolved" ? "text-green-500" : "text-amber-500"}`} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{projectTitle}</span>
                <StatusBadge status={d.status} />
                {d.status !== "resolved" && (
                  <span className="text-xs text-muted-foreground">{daysSince(d.createdAt)}d ago</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {buyerName} vs {sellerName} · {formatCents(o.priceCents)}
              </div>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {/* Expanded detail */}
        {isExpanded && (
          <div className="border-t border-border">
            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-secondary/10">
              {/* Buyer */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="w-3 h-3" /> Buyer
                </div>
                <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                  <p className="text-sm font-semibold text-foreground">{buyerName}</p>
                  <p className="text-xs text-muted-foreground">{o.buyer.email}</p>
                  <p className="text-xs text-muted-foreground">Joined: {new Date(o.buyer.createdAt).toLocaleDateString("en-GB")}</p>
                </div>
              </div>

              {/* Seller */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Briefcase className="w-3 h-3" /> Expert
                </div>
                <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                  <p className="text-sm font-semibold text-foreground">{sellerName}</p>
                  <p className="text-xs text-muted-foreground">{o.seller.user.email}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold text-[10px]">{o.seller.tier}</span>
                    <span>{o.seller.completedSalesCount} completed sales</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Joined: {new Date(o.seller.user.createdAt).toLocaleDateString("en-GB")}</p>
                </div>
              </div>
            </div>

            {/* Dispute reason */}
            <div className="p-5 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Dispute Reason
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 leading-relaxed">{d.reason}</p>
              </div>
            </div>

            {/* Financial summary */}
            <div className="p-5 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" /> Financial Summary
              </h4>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{formatCents(o.priceCents)}</p>
                  <p className="text-xs text-muted-foreground">Total order</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-amber-700">{formatCents(escrowedCents)}</p>
                  <p className="text-xs text-amber-600">In escrow</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-700">{formatCents(releasedCents)}</p>
                  <p className="text-xs text-green-600">Released</p>
                </div>
              </div>

              {/* Milestone breakdown */}
              <div className="space-y-2">
                {milestones.map((m, i) => {
                  const cents = m.priceCents ?? (m.price ? Math.round(m.price * 100) : 0);
                  const statusColors: Record<string, string> = {
                    released: "text-green-600 bg-green-50",
                    in_escrow: "text-amber-600 bg-amber-50",
                    pending_payment: "text-muted-foreground bg-secondary",
                    waiting_for_funds: "text-muted-foreground bg-secondary",
                  };
                  return (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{m.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${statusColors[m.status] ?? "bg-muted text-muted-foreground"}`}>
                          {m.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="font-semibold">{formatCents(cents)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="p-5 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Timeline
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Order created:</span>
                  <span className="font-medium">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                {milestones.filter(m => m.fundedAt).map((m, i) => (
                  <div key={`f-${i}`} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">&quot;{m.title}&quot; funded:</span>
                    <span className="font-medium">{new Date(m.fundedAt!).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                ))}
                {milestones.filter(m => m.releasedAt).map((m, i) => (
                  <div key={`r-${i}`} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">&quot;{m.title}&quot; released:</span>
                    <span className="font-medium">{new Date(m.releasedAt!).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">Dispute raised:</span>
                  <span className="font-medium">{new Date(d.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                {d.resolvedAt && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                    <span className="text-muted-foreground">Resolved:</span>
                    <span className="font-medium">{new Date(d.resolvedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews (if any) */}
            {o.review && (o.review.sellerRating || o.review.buyerRating) && (
              <div className="p-5 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Reviews</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {o.review.sellerRating !== null && (
                    <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Expert → Client</span>
                        <StarRating value={o.review.sellerRating} readonly size="sm" />
                      </div>
                      {o.review.sellerComment && <p className="text-sm text-muted-foreground">{o.review.sellerComment}</p>}
                    </div>
                  )}
                  {o.review.buyerRating !== null && (
                    <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Client → Expert</span>
                        <StarRating value={o.review.buyerRating} readonly size="sm" />
                      </div>
                      {o.review.buyerComment && <p className="text-sm text-muted-foreground">{o.review.buyerComment}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Conversation link */}
            {totalMsgCount > 0 && (
              <div className="px-5 py-3 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>{totalMsgCount} messages exchanged</span>
                </div>
              </div>
            )}

            {/* Admin notes */}
            <div className="p-5 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Admin Notes (internal)
              </h4>
              <textarea
                value={notes[d.orderId] ?? d.adminNotes ?? ""}
                onChange={(e) => setNotes({ ...notes, [d.orderId]: e.target.value })}
                placeholder="Add internal notes about this dispute..."
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/50 focus:border-primary/50 outline-none transition resize-none mb-2"
              />
              <button
                type="button"
                onClick={() => handleSaveNotes(d.orderId)}
                disabled={savingNotes === d.orderId}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                {savingNotes === d.orderId ? "Saving..." : "Save Notes"}
              </button>
            </div>

            {/* Resolution panel (only for unresolved) */}
            {d.status !== "resolved" ? (
              <div className="p-5 border-t border-border bg-secondary/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3" /> Resolve Dispute
                </h4>
                <div className="space-y-3">
                  {/* Resolution type */}
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Resolution</label>
                    <select
                      value={resolutionType[d.orderId] ?? ""}
                      onChange={(e) => setResolutionType({ ...resolutionType, [d.orderId]: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/50 outline-none"
                    >
                      <option value="">Select resolution...</option>
                      <option value="full_refund">Full refund to buyer ({formatCents(escrowedCents)} in escrow)</option>
                      <option value="release_to_seller">Release to expert ({formatCents(escrowedCents)} in escrow)</option>
                      <option value="partial_refund">Partial refund</option>
                      <option value="dismissed">Dismiss dispute (project continues)</option>
                    </select>
                  </div>

                  {/* Partial amount */}
                  {resolutionType[d.orderId] === "partial_refund" && (
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">Refund amount (€)</label>
                      <input
                        type="number"
                        value={partialAmount[d.orderId] ?? ""}
                        onChange={(e) => setPartialAmount({ ...partialAmount, [d.orderId]: e.target.value })}
                        placeholder="e.g. 50"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/50 outline-none"
                      />
                    </div>
                  )}

                  {/* Resolution note */}
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Resolution note (visible to both parties)</label>
                    <textarea
                      value={resolutionNote[d.orderId] ?? ""}
                      onChange={(e) => setResolutionNote({ ...resolutionNote, [d.orderId]: e.target.value })}
                      placeholder="Explain the decision..."
                      rows={2}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/50 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResolve(d.orderId)}
                    disabled={resolving === d.orderId}
                    className="w-full px-4 py-2.5 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resolving === d.orderId ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Resolve Dispute</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 border-t border-border bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">
                    Resolved: {d.resolution?.replace(/_/g, " ")}
                  </span>
                </div>
                {d.resolutionNote && (
                  <p className="text-sm text-green-700">{d.resolutionNote}</p>
                )}
                <p className="text-xs text-green-600 mt-1">
                  {d.resolvedAt && `Resolved on ${new Date(d.resolvedAt).toLocaleDateString("en-GB")}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {disputes.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No disputes</p>
          <p className="text-xs text-muted-foreground">All projects are running smoothly.</p>
        </div>
      )}

      {/* Open disputes */}
      {openDisputes.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Open Disputes ({openDisputes.length})
          </h3>
          <div className="space-y-3">
            {openDisputes.map(renderDisputeCard)}
          </div>
        </div>
      )}

      {/* Resolved disputes */}
      {resolvedDisputes.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Resolved ({resolvedDisputes.length})
          </h3>
          <div className="space-y-3">
            {resolvedDisputes.map(renderDisputeCard)}
          </div>
        </div>
      )}
    </div>
  );
}
