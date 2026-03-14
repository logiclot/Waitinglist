"use client";

import { useState } from "react";
import { awardBid, unawardBid, rateProposal } from "@/actions/jobs";
import { TierBadge } from "@/components/ui/TierBadge";
import {
  CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Euro, Clock, Wrench, Target, LayoutList,
  UserCheck, Loader2, CheckCircle, Briefcase,
  Compass, Building2, AlertCircle, ShoppingCart, Info,
  ThumbsUp, ThumbsDown, MessageCircle, Undo2
} from "lucide-react";
import Link from "next/link";
import { RejectAllProposalsButton } from "@/components/jobs/RejectAllProposalsButton";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Outcome  { what: string; value: string; timeframe: string; }
interface Phase    { name: string; scope: string; duration: string; price?: number; }
interface Proposal {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Bid = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Job = any;

function parseProposal(raw?: string | null): Proposal | null {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ── Brief toggle ──────────────────────────────────────────────────────────────

function BriefToggle({ goal, isDiscovery }: { goal: string; isDiscovery: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {isDiscovery
            ? <Compass className="h-4 w-4 text-muted-foreground" />
            : <Briefcase className="h-4 w-4 text-muted-foreground" />}
          <span>View your original brief</span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-card border-t border-border">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">
            {goal}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Thumbs feedback widget ───────────────────────────────────────────────────

function ProposalFeedback({ bidId, initialFeedback }: { bidId: string; initialFeedback?: string | null }) {
  const [current, setCurrent]   = useState<string | null>(initialFeedback ?? null);
  const [loading, setLoading]   = useState<"up" | "down" | null>(null);
  const [banned,  setBanned]    = useState(false);

  const vote = async (feedback: "up" | "down") => {
    // Clicking the active vote again is a no-op (can't un-vote, only switch)
    if (current === feedback) return;
    setLoading(feedback);
    const res = await rateProposal(bidId, feedback);
    if (res.success) {
      setCurrent(feedback);
      if (res.banned) setBanned(true);
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-1.5">
      {banned && (
        <span className="text-xs text-destructive font-medium mr-1">Expert flagged</span>
      )}
      {/* Thumbs up */}
      <button
        type="button"
        onClick={() => vote("up")}
        disabled={loading !== null}
        title="Good proposal — relevant and specific"
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
          current === "up"
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
        } disabled:opacity-60`}
      >
        {loading === "up"
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <ThumbsUp className="h-3.5 w-3.5" />}
        <span>Good fit</span>
      </button>

      {/* Thumbs down */}
      <button
        type="button"
        onClick={() => vote("down")}
        disabled={loading !== null}
        title="Poor quality — didn't address the brief"
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
          current === "down"
            ? "bg-destructive text-destructive-foreground border-destructive"
            : "bg-card border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive"
        } disabled:opacity-60`}
      >
        {loading === "down"
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <ThumbsDown className="h-3.5 w-3.5" />}
        <span>Not relevant</span>
      </button>
    </div>
  );
}

// ── Milestone preview helper ─────────────────────────────────────────────────

function MilestonePlan({ proposal, totalPrice }: { proposal: Proposal; totalPrice: string }) {
  const phases = proposal.phases ?? [];
  if (phases.length === 0) return null;

  const rawTotal = parseFloat(totalPrice.replace(/[^0-9.]/g, "") || "0");
  const hasPerPhasePrice = phases.some(p => p.price != null && p.price > 0);

  return (
    <div className="px-6 py-5 border-b border-border">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-4">
        <LayoutList className="h-3.5 w-3.5" /> Payment milestones
      </div>
      <div className="space-y-2">
        {phases.map((p, i) => {
          const phaseCents = p.price
            ? p.price
            : rawTotal > 0 ? rawTotal / phases.length : null;
          return (
            <div key={i} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl">
              <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{p.name}</span>
                  {p.duration && (
                    <span className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                      {p.duration}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.scope}</p>
              </div>
              {phaseCents != null && (
                <div className="shrink-0 font-bold text-sm text-foreground whitespace-nowrap">
                  €{phaseCents.toLocaleString("de-DE")}
                  {!hasPerPhasePrice && <span className="text-xs font-normal text-muted-foreground ml-1">(equal split)</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
        <Info className="h-3 w-3 shrink-0" />
        You release each payment only after approving that phase — no risk.
      </p>
    </div>
  );
}

// ── Proposal comparison card ──────────────────────────────────────────────────

function ProposalReviewCard({
  bid, jobId, index, totalBids, onAwarded, isDiscovery, isSelected, onSelect
}: {
  bid: Bid; jobId: string; index: number; totalBids: number; onAwarded: () => void;
  isDiscovery: boolean; isSelected?: boolean; onSelect?: (id: string, selected: boolean) => void;
}) {
  // All proposals start expanded so non-technical readers don't miss anything
  const [expanded, setExpanded] = useState(true);
  const [awarding, setAwarding] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const proposal = parseProposal(bid.proposedApproach);
  const isAwarded = bid.status === "accepted";

  // Check if any milestone has been funded — if so, undo is no longer possible
  const milestones = (bid.order?.milestones as Record<string, unknown>[] | undefined) ?? [];
  const isFunded = milestones.some((m) => {
    const s = (m as { status?: string }).status;
    return s === "in_escrow" || s === "releasing" || s === "released";
  });
  const canUndo = isAwarded && !isFunded;

  const handleAward = async () => {
    setAwarding(true);
    const res = await awardBid(jobId, bid.id);
    if (!res.success) {
      alert(res.error ?? "Something went wrong — please try again.");
      setAwarding(false);
      return;
    }

    onAwarded();

    // Redirect buyer to fund milestone 1 directly
    if (res.orderId) {
      try {
        const fundRes = await fetch("/api/checkout/fund-milestone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: res.orderId, milestoneIndex: 0 }),
        });
        const fundData = await fundRes.json();
        if (fundData.url) {
          window.location.href = fundData.url;
          return;
        }
      } catch {
        // If funding redirect fails, fall back to projects page
      }
      window.location.href = "/business/projects";
    }
  };

  const handleUndo = async () => {
    if (!confirm("Reverse this acceptance? The proposal and all others will go back to pending review.")) return;
    setUndoing(true);
    const res = await unawardBid(jobId, bid.id);
    if (!res.success) {
      alert(res.error ?? "Could not reverse — please try again.");
      setUndoing(false);
      return;
    }
    window.location.reload();
  };

  return (
    <div
      id={`proposal-${index + 1}`}
      className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 ${
        isAwarded
          ? "border-primary shadow-sm"
          : isSelected
          ? "border-primary/60 shadow-sm"
          : "border-border hover:border-primary/30"
      }`}
    >
      {/* ── Numbered header strip ── */}
      <div className={`flex items-center justify-between gap-3 px-6 py-3 border-b border-border text-xs font-bold ${
        isAwarded ? "bg-primary/5" : "bg-secondary/30"
      }`}>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          <span className="text-muted-foreground">Proposal {index + 1} of {totalBids}</span>
          {isAwarded && (
            <span className="flex items-center gap-1 text-primary ml-1">
              <CheckCircle className="h-3.5 w-3.5" /> Accepted
            </span>
          )}
          {canUndo && (
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoing}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors ml-1 disabled:opacity-50"
              title="Reverse this acceptance — all proposals go back to pending"
            >
              {undoing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />}
              Undo
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Feedback buttons — always visible to business owner */}
          <ProposalFeedback bidId={bid.id} initialFeedback={bid.feedback} />

          {/* Multi-select for discovery — labelled clearly so owner understands it's for selecting multiple automations */}
          {isDiscovery && !isAwarded && onSelect && (
            <label className="flex items-center gap-2 cursor-pointer select-none border-l border-border pl-3" title="Select this automation alongside others to implement multiple at once">
              <input
                type="checkbox"
                checked={isSelected ?? false}
                onChange={e => onSelect(bid.id, e.target.checked)}
                className="h-4 w-4 accent-black rounded"
              />
              <span className="text-muted-foreground font-normal">Select multiple</span>
            </label>
          )}
        </div>
      </div>

      {/* ── Proposal header ── */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center font-bold text-foreground text-sm shrink-0 border border-border">
              {bid.specialist?.displayName?.[0] ?? "E"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base">{bid.specialist?.displayName ?? "Specialist"}</span>
                <TierBadge
                  tier={bid.specialist?.tier ?? "STANDARD"}
                  isFoundingExpert={bid.specialist?.isFoundingExpert ?? false}
                />
              </div>
              {proposal?.automationTitle && (
                <h3 className="font-semibold text-lg mt-2 text-foreground leading-snug">
                  {proposal.automationTitle}
                </h3>
              )}
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {bid.message}
              </p>
            </div>
          </div>

          {/* Price + timeline — always visible at a glance */}
          <div className="shrink-0 text-right">
            <div className="text-2xl font-bold text-foreground flex items-center gap-0.5 justify-end">
              <Euro className="h-5 w-5 text-muted-foreground" />
              {bid.priceEstimate?.replace("€", "") ?? "—"}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end mt-0.5">
              <Clock className="h-3 w-3" /> {bid.estimatedTime}
            </div>
          </div>
        </div>

        {/* Outcomes — always visible */}
        {proposal?.outcomes && proposal.outcomes.length > 0 && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {proposal.outcomes.slice(0, 3).map((o, i) => (
              <div key={i} className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5">
                <div className="text-xs text-muted-foreground mb-0.5">{o.what}</div>
                <div className="font-bold text-sm text-foreground">{o.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{o.timeframe}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tools row */}
        {proposal?.tools && proposal.tools.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {proposal.tools.map(t => (
              <span key={t} className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-md text-muted-foreground font-medium">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
        >
          {expanded
            ? <><ChevronUp className="h-3.5 w-3.5" /> Collapse</>
            : <><ChevronDown className="h-3.5 w-3.5" /> Read full proposal</>}
        </button>
      </div>

      {/* ── Full proposal body (open by default) ── */}
      {expanded && (
        <div className="border-t border-border bg-secondary/10">

          {/* Problem + What you'll build */}
          {(proposal?.problemAddressed || proposal?.whatYoullBuild) && (
            <div className="px-6 py-5 space-y-5 border-b border-border">
              {proposal?.problemAddressed && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    <Target className="h-3.5 w-3.5" /> Problem being addressed
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{proposal.problemAddressed}</p>
                </div>
              )}
              {proposal?.whatYoullBuild && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    <Building2 className="h-3.5 w-3.5" /> What gets built
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{proposal.whatYoullBuild}</p>
                </div>
              )}
            </div>
          )}

          {/* Milestone payment plan */}
          {proposal && <MilestonePlan proposal={proposal} totalPrice={bid.priceEstimate ?? "0"} />}

          {/* Included / Excluded */}
          {((proposal?.included?.length ?? 0) > 0 || (proposal?.excluded?.length ?? 0) > 0) && (
            <div className="px-6 py-5 border-b border-border">
              <div className="grid sm:grid-cols-2 gap-6">
                {proposal?.included && proposal.included.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                      <CheckCircle2 className="h-3.5 w-3.5" /> What&apos;s included
                    </div>
                    <ul className="space-y-1.5">
                      {proposal.included.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {proposal?.excluded && proposal.excluded.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                      <XCircle className="h-3.5 w-3.5" /> Not included
                    </div>
                    <ul className="space-y-1.5">
                      {proposal.excluded.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Credibility */}
          {proposal?.credibility && (
            <div className="px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                <UserCheck className="h-3.5 w-3.5" /> About the expert
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0 border border-border">
                  {bid.specialist?.displayName?.[0] ?? "E"}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{proposal.credibility}</p>
              </div>
            </div>
          )}

          {/* Accept & Fund / Ask a Question CTAs */}
          {!isAwarded && (
            <div className="px-6 py-4 bg-secondary/30 border-t border-border flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Ready to move forward with this proposal?</p>
                {isDiscovery && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Or use &ldquo;Select multiple&rdquo; above to bundle this with another automation.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/messages/new?expert=${bid.specialistId}&job=${jobId}`}
                  className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <MessageCircle className="h-4 w-4" /> Ask a Question
                </Link>
                <button
                  onClick={handleAward}
                  disabled={awarding}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  {awarding ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {awarding ? "Processing…" : "Accept & Fund Milestone 1"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Multi-select confirmation panel (discovery scans) ─────────────────────────

function DiscoveryConfirmPanel({
  selectedBids, allBids, jobId, onConfirmed
}: {
  selectedBids: Set<string>; allBids: Bid[]; jobId: string; onConfirmed: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (selectedBids.size === 0) return null;

  const selected = allBids.filter(b => selectedBids.has(b.id));
  const total = selected.reduce((sum, b) => {
    const raw = parseFloat((b.priceEstimate ?? "0").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(raw) ? 0 : raw);
  }, 0);

  const handleConfirm = async () => {
    setConfirming(true);
    setError(null);
    // Award each selected bid sequentially
    for (const bid of selected) {
      const res = await awardBid(jobId, bid.id);
      if (!res.success) {
        setError(res.error ?? "Something went wrong. Please try again.");
        setConfirming(false);
        return;
      }
    }
    setConfirmed(true);
    onConfirmed();
  };

  if (confirmed) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
        <CheckCircle className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-1">Automations confirmed</h3>
        <p className="text-sm text-muted-foreground">
          {selected.length} conversation{selected.length > 1 ? "s" : ""} opened. Head to Messages to kick off each project.
        </p>
      </div>
    );
  }

  return (
    <div className="sticky bottom-6 bg-card border border-primary/30 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm">Your Automation Plan</span>
          <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {selected.length}
          </span>
        </div>
        <div className="font-bold text-foreground">
          €{total.toLocaleString("de-DE")} total
        </div>
      </div>

      {/* Selected automations list */}
      <div className="px-6 py-3 space-y-2">
        {selected.map(bid => {
          const p = parseProposal(bid.proposedApproach);
          return (
            <div key={bid.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold shrink-0">
                  {bid.specialist?.displayName?.[0] ?? "E"}
                </div>
                <div>
                  <span className="font-medium">{p?.automationTitle ?? bid.specialist?.displayName ?? "Proposal"}</span>
                  <span className="text-muted-foreground ml-2 text-xs">— {bid.estimatedTime}</span>
                </div>
              </div>
              <span className="font-semibold">{bid.priceEstimate}</span>
            </div>
          );
        })}
      </div>

      {/* Warning for multiple + confirm button */}
      <div className="px-6 pb-5 pt-1 space-y-3">
        {selected.length > 1 && (
          <div className="bg-secondary/50 border border-border rounded-xl px-4 py-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">You&apos;re about to start {selected.length} separate projects.</strong>{" "}
              Total investment: <strong className="text-foreground">€{total.toLocaleString("de-DE")}</strong>.
              Each will have its own conversation and milestone payment plan.
              Make sure you want to proceed with all {selected.length} automations before confirming.
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center border border-destructive/20 rounded-lg p-2 bg-destructive/5">
            {error}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {confirming
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting projects…</>
            : <><CheckCircle2 className="h-4 w-4" />
                {selected.length === 1
                  ? "Confirm & Start Project"
                  : `Confirm & Start All ${selected.length} Projects`}
              </>}
        </button>
      </div>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

export function ProposalReviewClient({ job }: { job: Job }) {
  const [awarded, setAwarded] = useState(false);
  // Multi-select state for discovery scans
  const [selectedBids, setSelectedBids] = useState<Set<string>>(new Set());
  const isDiscovery = job.category === "Discovery" || job.category === "Discovery Scan";
  const acceptedBid = job.bids.find((b: Bid) => b.status === "accepted");

  const handleSelect = (bidId: string, selected: boolean) => {
    setSelectedBids(prev => {
      const next = new Set(prev);
      if (selected) next.add(bidId);
      else next.delete(bidId);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-secondary border border-border text-muted-foreground px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
            {job.category}
          </span>
          {isDiscovery && job.bids.length > 0 && (
            <span className="text-xs text-muted-foreground border border-dashed border-border px-2 py-0.5 rounded-full">
              You can select multiple automations to implement
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground mt-2">{job.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {job.bids.length === 0
            ? "No proposals yet — experts will respond within 24 hours."
            : job.bids.length === 1
            ? "1 proposal received"
            : `${job.bids.length} proposals received`}
        </p>
      </div>

      {/* Accepted / awarded banner */}
      {(acceptedBid || awarded) && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              {isDiscovery ? "Automations confirmed" : "Proposal accepted"} — redirecting to payment
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fund the first milestone to get the project started. You can message the expert from your project page.
            </p>
          </div>
        </div>
      )}

      {/* No proposals yet */}
      {job.bids.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-1">Waiting for proposals</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Qualified experts are reviewing your brief. First proposals typically
            arrive within 24 hours.
          </p>
        </div>
      )}

      {/* Proposals — generous spacing so each feels distinct */}
      {job.bids.length > 0 && (
        <div className="space-y-8">
          {job.bids.map((bid: Bid, i: number) => (
            <ProposalReviewCard
              key={bid.id}
              bid={bid}
              jobId={job.id}
              index={i}
              totalBids={job.bids.length}
              onAwarded={() => setAwarded(true)}
              isDiscovery={isDiscovery}
              isSelected={selectedBids.has(bid.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Multi-select confirmation panel (discovery) */}
      {isDiscovery && (
        <DiscoveryConfirmPanel
          selectedBids={selectedBids}
          allBids={job.bids}
          jobId={job.id}
          onConfirmed={() => setAwarded(true)}
        />
      )}

      {/* Reject all — Custom Projects only, when proposals exist and none accepted */}
      {!isDiscovery &&
        job.bids.length > 0 &&
        !acceptedBid &&
        !awarded &&
        job.status !== "awarded" &&
        job.status !== "cancelled" &&
        job.status !== "closed" && (
        <RejectAllProposalsButton jobId={job.id} />
      )}

      {/* Brief reference */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Your original brief</h2>
        <BriefToggle goal={job.goal} isDiscovery={isDiscovery} />
      </div>
    </div>
  );
}
