"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Shield, ChevronDown, ChevronRight, Loader2, CreditCard } from "lucide-react";
import { formatCentsToCurrency } from "@/lib/commission";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";

// ── Types ────────────────────────────────────────────────────────────────────
interface TimelineMilestone {
  title: string;
  priceCents: number;
  status: string; // pending_payment | waiting_for_funds | in_escrow | releasing | released
}

export interface MilestoneTimelineProps {
  milestones: TimelineMilestone[];
  orderStatus: string; // paid_pending_implementation | in_progress | delivered | approved | refunded | disputed
  projectTitle: string;
  isBuyer: boolean;
  orderId?: string;
  onAcceptOrder?: () => void;
  acceptLoading?: boolean;
}

// ── Step definitions ─────────────────────────────────────────────────────────
interface StepDef {
  buyerLabel: string;
  expertLabel: string;
}

const STEPS: StepDef[] = [
  { buyerLabel: "Order submitted", expertLabel: "Order received" },
  { buyerLabel: "Payment secured in escrow", expertLabel: "Payment secured in escrow" },
  { buyerLabel: "Expert accepts the order", expertLabel: "You accept the order" },
  { buyerLabel: "Work in progress", expertLabel: "Work in progress" },
  { buyerLabel: "Expert delivers", expertLabel: "You deliver" },
  { buyerLabel: "You approve the delivery", expertLabel: "Client approves delivery" },
];

// ── Determine which step is active/completed ─────────────────────────────────
function getActiveStep(orderStatus: string, milestoneStatus: string): number {
  // Not started yet — milestone hasn't been funded
  if (milestoneStatus === "pending_payment" || milestoneStatus === "waiting_for_funds") {
    return -1; // collapsed state
  }

  // All done
  if (milestoneStatus === "released") return 6;

  // Payment release in progress
  if (milestoneStatus === "releasing") return 5;

  // Order-level status determines the active step
  switch (orderStatus) {
    case "paid_pending_implementation":
      return 2; // Step 3 is active (0-indexed → 2)
    case "in_progress":
      return 3; // Step 4 is active
    case "revision_requested":
      return 3; // Back to "Work in progress" step — expert needs to rework
    case "delivered":
      return 5; // Step 6 is active (approval pending)
    case "approved":
      return 6; // All complete
    default:
      return 3; // Fallback to work in progress
  }
}

// ── Status badge for collapsed milestones ────────────────────────────────────
function MilestoneStatusBadge({ status, orderStatus }: { status: string; orderStatus: string }) {
  if (status === "released") {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Completed</span>;
  }
  if (status === "in_escrow" || status === "releasing") {
    if (orderStatus === "paid_pending_implementation") {
      return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Awaiting acceptance</span>;
    }
    return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">In progress</span>;
  }
  return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Upcoming</span>;
}

// ── Main Component ───────────────────────────────────────────────────────────
export function MilestoneTimeline({
  milestones,
  orderStatus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  projectTitle,
  isBuyer,
  orderId,
  onAcceptOrder,
  acceptLoading,
}: MilestoneTimelineProps) {
  const router = useRouter();
  const [fundingIdx, setFundingIdx] = useState<number | null>(null);

  // Find the first "active" milestone (one that has been funded and isn't released)
  const activeMilestoneIdx = milestones.findIndex(
    (m) => !["pending_payment", "waiting_for_funds", "released"].includes(m.status)
  );

  // Find the first "waiting_for_funds" milestone (next one to fund after a release)
  const nextToFundIdx = milestones.findIndex((m) => m.status === "waiting_for_funds");

  // Priority: active milestone → next to fund → first milestone
  const defaultExpanded = activeMilestoneIdx >= 0
    ? activeMilestoneIdx
    : nextToFundIdx >= 0
    ? nextToFundIdx
    : 0;

  const [expandedIdx, setExpandedIdx] = useState<number>(defaultExpanded);

  // Fund milestone handler
  const handleFundFromTimeline = async (index: number) => {
    if (!orderId) return;
    setFundingIdx(index);
    try {
      const res = await fetch("/api/checkout/fund-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, milestoneIndex: index }),
      });
      const data = await res.json();
      if (data.useSimulate) {
        const sim = await fetch("/api/projects/simulate-milestone-fund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, milestoneIndex: index }),
        });
        const simData = await sim.json();
        if (simData.success) {
          toast.success("Milestone funded (simulated).");
          router.refresh();
        } else {
          toast.error(simData.error || "Simulate failed.");
        }
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Checkout failed.");
      }
    } catch (error) {
      Sentry.captureException(error, { tags: { context: "timeline-milestone-fund" } });
      toast.error("Something went wrong.");
    } finally {
      setFundingIdx(null);
    }
  };

  if (!milestones.length) return null;

  return (
    <div className="space-y-2">
      {milestones.map((milestone, idx) => {
        const activeStep = getActiveStep(orderStatus, milestone.status);
        const isExpanded = idx === expandedIdx;
        const isActive = activeStep >= 0 && activeStep < 6;
        const isCompleted = activeStep >= 6;
        const isUpcoming = activeStep === -1;

        return (
          <div
            key={idx}
            className={`rounded-lg border transition-all ${
              isExpanded
                ? "bg-card shadow-sm border-border"
                : "bg-muted/30 border-border/50 hover:border-border"
            }`}
          >
            {/* Header — always visible, clickable to expand/collapse */}
            <button
              onClick={() => setExpandedIdx(isExpanded ? -1 : idx)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm font-semibold text-foreground truncate">
                  Milestone {idx + 1}: {milestone.title}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {formatCentsToCurrency(milestone.priceCents)}
                </span>
                {!isExpanded && (
                  <MilestoneStatusBadge status={milestone.status} orderStatus={orderStatus} />
                )}
              </div>
            </button>

            {/* Expanded timeline */}
            {isExpanded && (isActive || isCompleted) && (
              <div className="px-4 pb-4">
                <div className="border-t border-border/50 pt-4">
                  <div className="space-y-0">
                    {STEPS.map((step, stepIdx) => {
                      const isStepCompleted = stepIdx < activeStep;
                      const isStepActive = stepIdx === activeStep;
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const isStepUpcoming = stepIdx > activeStep;
                      const label = isBuyer ? step.buyerLabel : step.expertLabel;

                      return (
                        <div key={stepIdx} className="flex items-start gap-3">
                          {/* Vertical line + dot */}
                          <div className="flex flex-col items-center">
                            {/* Dot */}
                            <div className="relative shrink-0">
                              {isStepCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              ) : isStepActive ? (
                                <div className="relative">
                                  <div className="absolute inset-0 h-5 w-5 rounded-full bg-primary/20 animate-ping" />
                                  <div className="relative h-5 w-5 rounded-full bg-primary border-2 border-primary flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                  </div>
                                </div>
                              ) : (
                                <Circle className="h-5 w-5 text-border" />
                              )}
                            </div>
                            {/* Connector line (not on last step) */}
                            {stepIdx < STEPS.length - 1 && (
                              <div
                                className={`w-0.5 h-6 ${
                                  isStepCompleted ? "bg-primary" : "bg-border"
                                }`}
                              />
                            )}
                          </div>

                          {/* Label */}
                          <div className="pt-0.5 min-w-0">
                            <p
                              className={`text-sm leading-5 ${
                                isStepCompleted
                                  ? "text-foreground"
                                  : isStepActive
                                  ? "text-foreground font-semibold"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {label}
                            </p>

                            {/* Expert "Accept & Start Working" button */}
                            {isStepActive &&
                              stepIdx === 2 &&
                              !isBuyer &&
                              onAcceptOrder && (
                                <button
                                  onClick={onAcceptOrder}
                                  disabled={acceptLoading}
                                  className="mt-2 mb-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                  {acceptLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Accepting...
                                    </>
                                  ) : (
                                    "Accept & Start Working"
                                  )}
                                </button>
                              )}

                            {/* Buyer waiting message at step 3 */}
                            {isStepActive && stepIdx === 2 && isBuyer && (
                              <p className="text-xs text-muted-foreground mt-1 mb-1">
                                The expert will review and accept your order within 24-48 hours.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Escrow reassurance — only for buyer, only when not fully complete */}
                  {isBuyer && !isCompleted && (
                    <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 px-3 py-2.5">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        Your money is safe with us until you accept the delivery. If something
                        doesn&apos;t go as planned, you&apos;ll receive a full refund.
                      </p>
                    </div>
                  )}

                  {/* Completed badge + feedback prompt */}
                  {isCompleted && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 px-3 py-2.5">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                          This milestone has been completed and funds have been released.
                        </p>
                      </div>
                      {isBuyer && (
                        <p className="text-xs text-muted-foreground italic px-1">
                          You&apos;ll be able to leave a review for this expert once all milestones are complete.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expanded but upcoming — show fund CTA or waiting message */}
            {isExpanded && isUpcoming && (
              <div className="px-4 pb-4">
                <div className="border-t border-border/50 pt-3">
                  {(milestone.status === "waiting_for_funds" || milestone.status === "pending_payment") && isBuyer && orderId ? (() => {
                    const prevFunded = idx === 0 || ["in_escrow", "releasing", "released"].includes(milestones[idx - 1].status);
                    return prevFunded ? (
                      <div className="space-y-3">
                        <p className="text-sm text-foreground">
                          {milestone.status === "pending_payment"
                            ? "Fund this milestone to kick off the project."
                            : "The previous milestone has been completed. Fund this milestone to continue the project."}
                        </p>
                        <button
                          onClick={() => handleFundFromTimeline(idx)}
                          disabled={fundingIdx === idx}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
                        >
                          {fundingIdx === idx ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4" />
                              Fund Milestone — {formatCentsToCurrency(milestone.priceCents)}
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Fund the previous milestone first before proceeding with this one.
                      </p>
                    );
                  })() : (
                    <p className="text-sm text-muted-foreground">
                      This milestone will begin once the previous milestones are completed and funded.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
