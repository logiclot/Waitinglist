"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { awardBid, updateBid } from "@/actions/jobs";
import { TierBadge } from "@/components/ui/TierBadge";
import { toast } from "sonner";
import {
  CheckCircle, Loader2, ChevronDown, ChevronUp,
  Target, Zap, LayoutList, EuroIcon,
  UserCheck, Clock, CheckCircle2, XCircle,
  Pencil, Lock, AlertTriangle, Wrench,
  Eye, Trophy, User
} from "lucide-react";

const EDIT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const WARN_THRESHOLD_MS = 5 * 60 * 1000; // warn at 5 minutes remaining

// ── Proposal data shape (stored as JSON in proposedApproach) ─────────────────

interface Outcome { what: string; value: string; timeframe: string; }
interface Phase   { name: string; scope: string; duration: string; }

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
}

function parseProposal(raw: string | null | undefined): ProposalData | null {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ── Bid type used by ProposalCard and EditProposalForm ───────────────────────

interface ProposalBid {
  id: string;
  specialistId?: string;
  proposedApproach: string | null;
  message?: string | null;
  priceEstimate?: string | null;
  estimatedTime?: string | null;
  createdAt: Date | string;
  status: string;
  specialist: { displayName?: string | null; tier?: string | null; isFoundingExpert?: boolean | null; completedSalesCount?: number | null };
}

// ── Edit form (inline, collapsible) ──────────────────────────────────────────

function EditProposalForm({ bid, onClose, onSaved }: { bid: ProposalBid; onClose: () => void; onSaved: () => void }) {
  const proposal = parseProposal(bid.proposedApproach);
  const [message, setMessage] = useState(bid.message || "");
  const [price, setPrice] = useState(bid.priceEstimate?.replace(/[^0-9.]/g, "") || "");
  const [timeline, setTimeline] = useState(bid.estimatedTime || "");
  const [approach, setApproach] = useState(bid.proposedApproach || "");
  const [saving, setSaving] = useState(false);
  const input = "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition";

  const handleSave = async () => {
    if (!message.trim() || !price || !timeline) {
      toast.error("Summary, price and timeline are required.");
      return;
    }
    setSaving(true);
    const res = await updateBid(bid.id, {
      message,
      estimatedTime: timeline,
      priceEstimate: price ? `€${price}` : "",
      proposedApproach: approach,
    });
    if (res.error) {
      toast.error(res.error);
      setSaving(false);
    } else {
      toast.success("Proposal updated.");
      onSaved();
    }
  };

  return (
    <div className="border-t border-border bg-secondary/5 p-5 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Edit your proposal</p>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Executive summary *</label>
        <textarea className={`${input} resize-none`} rows={3} value={message} onChange={e => setMessage(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Total price (€) *</label>
          <input className={input} type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 1800" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Delivery timeline *</label>
          <input className={input} value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="e.g. 2–3 weeks" />
        </div>
      </div>
      {proposal && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Full proposal JSON (advanced — edit with care)</label>
          <textarea className={`${input} resize-none font-mono text-xs`} rows={6} value={approach} onChange={e => setApproach(e.target.value)} />
        </div>
      )}
      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onClose} type="button" className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} type="button"
          className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5">
          {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</> : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ── Single Proposal Card ──────────────────────────────────────────────────────

export function ProposalCard({ bid, jobId, isOwner, isExpertView = false, isPostTenderView = false, isOwnBid = false, anonymizedLabel }: {
  bid: ProposalBid; jobId: string; isOwner: boolean; isExpertView?: boolean;
  isPostTenderView?: boolean; isOwnBid?: boolean; anonymizedLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [msRemaining, setMsRemaining] = useState(0);
  const [warnFired, setWarnFired] = useState(false);
  const proposal = parseProposal(bid.proposedApproach);

  const editableUntil = useMemo(
    () => new Date(new Date(bid.createdAt).getTime() + EDIT_WINDOW_MS),
    [bid.createdAt]
  );
  const canEdit = isExpertView && bid.status !== "accepted" && new Date() < editableUntil;

  // Countdown timer for the edit window
  const tick = useCallback(() => {
    const remaining = editableUntil.getTime() - Date.now();
    setMsRemaining(Math.max(0, remaining));
    if (remaining > 0 && remaining <= WARN_THRESHOLD_MS && !warnFired) {
      setWarnFired(true);
      toast.warning("5 minutes left to edit your proposal — it locks soon.", { duration: 8000 });
    }
  }, [editableUntil, warnFired]);

  useEffect(() => {
    if (!isExpertView || bid.status === "accepted") return;
    tick();
    const interval = setInterval(tick, 10_000);
    return () => clearInterval(interval);
  }, [isExpertView, bid.status, tick]);

  const formatCountdown = (ms: number) => {
    const mins = Math.floor(ms / 60_000);
    const secs = Math.floor((ms % 60_000) / 1_000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAward = async () => {
    if (!confirm("Award this project to this expert? This will open a conversation thread.")) return;
    setAwarding(true);
    const res = await awardBid(jobId, bid.id);
    if (!res.success) {
      alert("Failed to award — please try again.");
      setAwarding(false);
    }
  };

  const isAwarded = bid.status === "accepted";
  const displayName = isPostTenderView ? (anonymizedLabel ?? "Expert") : (bid.specialist?.displayName ?? "Specialist");

  return (
    <div className={`bg-card border rounded-xl overflow-hidden transition-all ${
      isAwarded && isPostTenderView ? "border-primary/40 shadow-sm shadow-primary/10"
      : isAwarded ? "border-green-500/40 shadow-sm shadow-green-500/10"
      : isOwnBid && isPostTenderView ? "border-blue-500/30"
      : "border-border"
    }`}>
      {/* Post-tender badges */}
      {isPostTenderView && (isOwnBid || isAwarded) && (
        <div className="flex items-center gap-2 px-5 py-2 bg-secondary/30 border-b border-border">
          {isOwnBid && (
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              <User className="h-3 w-3" /> Your proposal
            </span>
          )}
          {isAwarded && (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              <Trophy className="h-3 w-3" /> Chosen by client
            </span>
          )}
        </div>
      )}

      {/* Header row */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Expert identity */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {isPostTenderView ? (anonymizedLabel?.[0] ?? "E") : (bid.specialist?.displayName?.[0] ?? "E")}
              </div>
              <div>
                <div className="font-bold leading-tight">{displayName}</div>
                {!isPostTenderView && (
                <div className="flex items-center gap-2 mt-0.5">
                  <TierBadge
                    tier={(bid.specialist?.tier ?? "STANDARD") as "STANDARD" | "PROVEN" | "ELITE"}
                    isFoundingExpert={bid.specialist?.isFoundingExpert ?? false}
                  />
                  <span className="text-xs text-muted-foreground">
                    {bid.specialist?.completedSalesCount ?? 0} completed
                  </span>
                </div>
                )}
              </div>
            </div>

            {/* Automation title */}
            {proposal?.automationTitle && (
              <h4 className="font-semibold text-base mt-3 mb-1">{proposal.automationTitle}</h4>
            )}

            {/* Executive summary */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {bid.message}
            </p>

            {/* Key stats row */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <EuroIcon className="h-3.5 w-3.5 text-primary" />
                {bid.priceEstimate}
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
          </div>

          {/* Actions */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            {!isPostTenderView && (
              <>
                {isAwarded ? (
                  <span className="flex items-center gap-1.5 bg-green-500/10 text-green-600 border border-green-500/20 px-3 py-1.5 rounded-full text-sm font-bold">
                    <CheckCircle className="h-4 w-4" /> Awarded
                  </span>
                ) : isOwner ? (
                  <button
                    onClick={handleAward}
                    disabled={awarding}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {awarding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept & Chat"}
                  </button>
                ) : null}

                {/* Expert edit controls */}
                {isExpertView && !isAwarded && (
                  <div className="flex items-center gap-2">
                    {canEdit ? (
                      <>
                        <span className={`text-xs flex items-center gap-1 ${msRemaining < WARN_THRESHOLD_MS ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
                          {msRemaining < WARN_THRESHOLD_MS && <AlertTriangle className="h-3 w-3" />}
                          {formatCountdown(msRemaining)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditing(!editing)}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Pencil className="h-3 w-3" /> {editing ? "Cancel edit" : "Edit"}
                        </button>
                      </>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            {proposal && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {expanded ? "Less" : "Full proposal"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline edit form */}
      {editing && canEdit && (
        <EditProposalForm
          bid={bid}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); setRefreshKey(k => k + 1); }}
        />
      )}

      {/* Expanded full proposal */}
      {!editing && expanded && proposal && (
        <div key={refreshKey} className="border-t border-border bg-secondary/5 p-5 space-y-5">

          {/* Problem addressed */}
          {proposal.problemAddressed && (
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <Target className="h-4 w-4 text-primary" /> Problem being addressed
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {proposal.problemAddressed}
              </p>
            </div>
          )}

          {/* What you'll build */}
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

          {/* Outcomes */}
          {proposal.outcomes && proposal.outcomes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Measurable outcomes
              </div>
              <div className="grid sm:grid-cols-2 gap-2 pl-6">
                {proposal.outcomes.map((o, i) => (
                  <div key={i} className="bg-secondary/40 border border-border rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-0.5">{o.what}</div>
                    <div className="font-bold text-foreground">{o.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{o.timeframe}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phases */}
          {proposal.phases && proposal.phases.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <LayoutList className="h-4 w-4 text-primary" /> Implementation plan
              </div>
              <div className="space-y-2 pl-6">
                {proposal.phases.map((p, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{p.name}</span>
                        {p.duration && (
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                            {p.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.scope}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Included / Excluded */}
          {((proposal.included?.length ?? 0) > 0 || (proposal.excluded?.length ?? 0) > 0) && (
            <div className="grid sm:grid-cols-2 gap-4 pl-6">
              {proposal.included && proposal.included.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Included
                  </div>
                  <ul className="space-y-1">
                    {proposal.included.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {item}
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
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <XCircle className="h-3 w-3 shrink-0 mt-0.5 opacity-40" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Credibility */}
          {proposal.credibility && (
            <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 ml-6">
              <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                <UserCheck className="h-4 w-4 text-primary" /> Why {displayName}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{proposal.credibility}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── List wrapper ──────────────────────────────────────────────────────────────

export function ProposalList({ bids, jobId, isOwner, isExpertView = false, isPostTenderView = false, expertSpecialistId }: {
  bids: ProposalBid[]; jobId: string; isOwner: boolean; isExpertView?: boolean;
  isPostTenderView?: boolean; expertSpecialistId?: string;
}) {
  if (bids.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl">
        <h3 className="text-lg font-medium mb-1">No proposals yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Qualified experts will submit structured proposals here. Typically within 24 hours.
        </p>
      </div>
    );
  }

  // Generate anonymized labels: Expert A, Expert B, Expert C, ...
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return (
    <div className="space-y-4">
      {isPostTenderView && (
        <div className="flex items-center gap-2 bg-secondary/30 border border-border rounded-xl px-4 py-3">
          <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Post-tender review</span> — See how other experts approached this brief. Names are anonymized. Use this to sharpen your future proposals.
          </p>
        </div>
      )}
      <h3 className="font-bold text-lg">
        {bids.length === 1 ? "1 Proposal" : `${bids.length} Proposals`}
      </h3>
      {bids.map((bid, index) => (
        <ProposalCard
          key={bid.id}
          bid={bid}
          jobId={jobId}
          isOwner={isOwner}
          isExpertView={isExpertView}
          isPostTenderView={isPostTenderView}
          isOwnBid={isPostTenderView && !!(expertSpecialistId && bid.specialistId === expertSpecialistId)}
          anonymizedLabel={isPostTenderView ? `Expert ${labels[index] ?? index + 1}` : undefined}
        />
      ))}
    </div>
  );
}
