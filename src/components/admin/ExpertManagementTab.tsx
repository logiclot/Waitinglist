"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Award,
  UserX,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
  ExternalLink,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  ShieldOff,
  Search,
  Crown,
  ArrowDown,
} from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/PaginationControls";
import {
  getCommissionPercent,
  TIER_THRESHOLDS,
  type CommissionExpert,
} from "@/lib/commission";

export interface AdminExpert {
  id: string;
  displayName: string | null;
  legalFullName?: string;
  country?: string | null;
  yearsExperience?: string | number;
  tools?: string[];
  bio?: string | null;
  status: string;
  verified: boolean;
  isFoundingExpert?: boolean;
  foundingRank?: number | null;
  completedSalesCount?: number;
  platformFeePercentage?: number | null;
  commissionOverridePercent?: number | null;
  tier?: string;
  stripeAccountId?: string | null;
  calendarUrl?: string | null;
  portfolioLinks?: string[] | unknown;
  pastImplementations?: string;
  bidQuality?: { up: number; down: number };
  bidBannedUntil?: Date | string | null;
  user: { id: string; email?: string };
}

/** Convert AdminExpert to the commission calculator's Expert type */
function toCommissionExpert(expert: AdminExpert): CommissionExpert {
  return {
    id: expert.id,
    name: expert.displayName || "",
    verified: expert.verified,
    founding: false,
    isFoundingExpert: expert.isFoundingExpert ?? false,
    completed_sales_count: expert.completedSalesCount ?? 0,
    commission_override_percent:
      expert.commissionOverridePercent != null
        ? Number(expert.commissionOverridePercent)
        : undefined,
    tier:
      (expert.tier as "STANDARD" | "PROVEN" | "ELITE" | "FOUNDING") ??
      "STANDARD",
    tools: expert.tools ?? [],
  };
}

export interface EliteApplication {
  id: string;
  displayName: string | null;
  legalFullName: string | null;
  tier: string | null;
  completedSalesCount: number;
  eliteAppliedAt: Date | string | null;
  eliteApplicationStatus: string | null;
  isFoundingExpert: boolean;
  tools: string[];
  user: { id: string; email: string };
}

interface ExpertManagementTabProps {
  expertList: AdminExpert[];
  expandedExpertId: string | null;
  setExpandedExpertId: (id: string | null) => void;
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
  onMakeFounding: (id: string) => void;
  onRemoveFounding: (id: string) => void;
  onSetFee: (id: string, fee: number) => void;
  onSetTier: (
    id: string,
    tier: "STANDARD" | "PROVEN" | "ELITE" | "FOUNDING",
  ) => void;
  onDeleteUser: (userId: string) => void;
  onLiftBidBan: (id: string) => void;
  eliteApplications?: EliteApplication[];
  onApproveElite?: (expertId: string) => void;
  onDenyElite?: (expertId: string, reason: string) => void;
  onDemoteElite?: (expertId: string, reason: string) => void;
}

const TIER_COLORS: Record<string, string> = {
  STANDARD: "text-muted-foreground",
  PROVEN: "text-blue-500",
  ELITE: "text-purple-500",
};

function FeeEditor({
  current,
  onSave,
}: {
  current: number;
  onSave: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(current));

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm font-bold hover:underline tabular-nums"
      >
        {current}%
      </button>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <input
        type="number"
        value={val}
        min={0}
        max={100}
        onChange={(e) => setVal(e.target.value)}
        className="w-14 border border-border rounded px-1 py-0.5 text-xs bg-background"
        autoFocus
      />
      <button
        onClick={() => {
          onSave(parseInt(val));
          setEditing(false);
        }}
        className="text-xs text-green-500 font-bold hover:underline"
      >
        Save
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-xs text-muted-foreground hover:underline"
      >
        ✕
      </button>
    </span>
  );
}

export function ExpertManagementTab({
  expertList,
  expandedExpertId,
  setExpandedExpertId,
  onApprove,
  onSuspend,
  onMakeFounding,
  onRemoveFounding,
  onSetFee,
  onSetTier,
  onDeleteUser,
  onLiftBidBan,
  eliteApplications = [],
  onApproveElite,
  onDenyElite,
  onDemoteElite,
}: ExpertManagementTabProps) {
  const pendingExperts = expertList.filter(
    (e) => e.status === "PENDING_REVIEW",
  );
  const activeExperts = expertList.filter((e) => e.status !== "PENDING_REVIEW");

  // --- Elite deny/demote reason ---
  const [denyReasonMap, setDenyReasonMap] = useState<Record<string, string>>(
    {},
  );
  const [demoteReasonMap, setDemoteReasonMap] = useState<
    Record<string, string>
  >({});

  // --- Search + Pagination ---
  const [searchQuery, setSearchQuery] = useState("");
  const filteredActive = useMemo(() => {
    if (!searchQuery.trim()) return activeExperts;
    const q = searchQuery.toLowerCase();
    return activeExperts.filter(
      (e) =>
        e.displayName?.toLowerCase().includes(q) ||
        e.user?.email?.toLowerCase().includes(q) ||
        e.tools?.some((t: string) => t.toLowerCase().includes(q)),
    );
  }, [activeExperts, searchQuery]);

  const pag = usePagination(filteredActive, 20);

  useEffect(() => {
    pag.setPage(1);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderExpertList = (experts: AdminExpert[], isPending: boolean) => (
    <div
      className={`overflow-hidden rounded-xl border ${isPending ? "border-yellow-500/20 bg-yellow-500/5" : "border-border bg-card"}`}
    >
      {isPending && (
        <div className="px-6 py-3 border-b border-yellow-500/20 bg-yellow-500/10 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <h3 className="font-bold text-yellow-500">
            Pending Approvals ({experts.length})
          </h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead
            className={`font-medium text-muted-foreground border-b ${isPending ? "border-yellow-500/20" : "border-border bg-secondary/50"}`}
          >
            <tr>
              <th className="px-6 py-4 w-[28%]">Expert</th>
              <th className="px-6 py-4 w-[20%]">Tools</th>
              <th className="px-6 py-4 w-[14%]">Status</th>
              {!isPending && <th className="px-6 py-4 w-[18%]">Tier / Fee</th>}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${isPending ? "divide-yellow-500/20" : "divide-border"}`}
          >
            {experts.map((expert) => {
              const isExpanded = expandedExpertId === expert.id;
              const fee =
                expert.platformFeePercentage != null
                  ? expert.platformFeePercentage
                  : getCommissionPercent(toCommissionExpert(expert));
              const tier = (expert.tier ?? "STANDARD") as
                | "STANDARD"
                | "PROVEN"
                | "ELITE"
                | "FOUNDING";
              const hasOverride = expert.commissionOverridePercent != null;
              const isFounding = expert.isFoundingExpert ?? false;
              const expectedFee = isFounding
                ? TIER_THRESHOLDS.FOUNDING
                : tier === "ELITE"
                  ? TIER_THRESHOLDS.ELITE
                  : tier === "PROVEN"
                    ? TIER_THRESHOLDS.PROVEN
                    : TIER_THRESHOLDS.STANDARD;

              return [
                <tr
                  key={`${expert.id}-main`}
                  className="group hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() =>
                    setExpandedExpertId(isExpanded ? null : expert.id)
                  }
                >
                  {/* Expert name */}
                  <td className="px-6 py-4 align-top">
                    <div className="font-semibold">{expert.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {expert.legalFullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {expert.user?.email}
                    </div>
                    {expert.country && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" /> {expert.country}
                      </div>
                    )}
                  </td>

                  {/* Tools */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-1.5 text-xs mb-1">
                      <Briefcase className="w-3 h-3 text-muted-foreground" />{" "}
                      {expert.yearsExperience} yrs
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {expert.tools?.slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 bg-secondary rounded border border-white/5"
                        >
                          {t}
                        </span>
                      ))}
                      {(expert.tools?.length ?? 0) > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{(expert.tools?.length ?? 0) - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status badges */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      {expert.status === "PENDING_REVIEW" && (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
                          Pending
                        </span>
                      )}
                      {expert.status === "APPROVED" && (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">
                          Approved
                        </span>
                      )}
                      {/* Bid quality score */}
                      {expert.bidQuality?.up || expert.bidQuality?.down ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <ThumbsUp className="h-3 w-3 text-primary" />
                          <span className="font-medium">
                            {expert.bidQuality.up}
                          </span>
                          <ThumbsDown className="h-3 w-3 text-destructive ml-1" />
                          <span
                            className={`font-medium ${expert.bidQuality.down >= 3 ? "text-destructive" : ""}`}
                          >
                            {expert.bidQuality.down}
                          </span>
                        </div>
                      ) : null}
                      {/* Bid ban indicator */}
                      {expert.bidBannedUntil &&
                        new Date(expert.bidBannedUntil) > new Date() && (
                          <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                            <ShieldOff className="h-3 w-3" /> Bid banned
                          </span>
                        )}
                      {expert.status === "SUSPENDED" && (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20">
                          Suspended
                        </span>
                      )}
                      {expert.isFoundingExpert && (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-500">
                          <Award className="h-3 w-3" /> Founding #
                          {expert.foundingRank}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Tier + Fee (active only) */}
                  {!isPending && (
                    <td
                      className="px-6 py-4 align-top"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-2">
                        {/* Tier selector */}
                        <select
                          value={tier}
                          onChange={(e) =>
                            onSetTier(
                              expert.id,
                              e.target.value as
                                | "STANDARD"
                                | "PROVEN"
                                | "ELITE"
                                | "FOUNDING",
                            )
                          }
                          className={`text-xs border border-border rounded px-1.5 py-1 bg-background font-medium ${TIER_COLORS[tier]}`}
                        >
                          <option value="STANDARD">Standard</option>
                          <option value="PROVEN">Proven</option>
                          <option value="ELITE">Elite</option>
                          <option value="FOUNDING">Founding</option>
                        </select>
                        {/* Fee — computed from commission system */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          Fee:{" "}
                          <FeeEditor
                            current={fee}
                            onSave={(v) => onSetFee(expert.id, v)}
                          />
                          {hasOverride && (
                            <span
                              className="text-[10px] text-amber-500 ml-1"
                              title={`Admin override (tier default: ${expectedFee}%)`}
                            >
                              ⚙️
                            </span>
                          )}
                          {isFounding && !hasOverride && (
                            <span
                              className="text-[10px] text-yellow-500 ml-1"
                              title="Founding Expert rate"
                            >
                              🔒
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {expert.completedSalesCount ?? 0} sales
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Actions */}
                  <td
                    className="px-6 py-4 text-right align-top"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() =>
                          setExpandedExpertId(isExpanded ? null : expert.id)
                        }
                        className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                        {isExpanded ? "Hide" : "View Details"}
                      </button>

                      {expert.status === "PENDING_REVIEW" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onApprove(expert.id)}
                            className="px-3 py-1 bg-green-500 text-black font-bold rounded text-xs hover:bg-green-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onSuspend(expert.id)}
                            className="px-3 py-1 border border-border rounded text-xs hover:bg-secondary"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {expert.status === "APPROVED" && (
                        <button
                          onClick={() => onSuspend(expert.id)}
                          className="text-xs text-destructive hover:underline flex items-center gap-1"
                        >
                          <UserX className="h-3 w-3" /> Suspend
                        </button>
                      )}
                      {/* Lift bid ban if active */}
                      {expert.bidBannedUntil &&
                        new Date(expert.bidBannedUntil) > new Date() && (
                          <button
                            onClick={() => onLiftBidBan(expert.id)}
                            className="text-xs px-3 py-1 rounded border border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1"
                          >
                            <ShieldOff className="h-3 w-3" /> Lift Ban
                          </button>
                        )}

                      {!expert.isFoundingExpert &&
                        expert.status === "APPROVED" && (
                          <button
                            onClick={() => onMakeFounding(expert.id)}
                            className="text-xs px-3 py-1 rounded border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                          >
                            ★ Make Founding
                          </button>
                        )}
                      {expert.isFoundingExpert && (
                        <button
                          onClick={() => onRemoveFounding(expert.id)}
                          className="text-xs text-muted-foreground hover:text-yellow-500 hover:underline"
                        >
                          Remove Founding
                        </button>
                      )}

                      {tier === "ELITE" && onDemoteElite && (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => {
                              const reason = demoteReasonMap[expert.id];
                              if (!reason || reason.trim().length < 10) {
                                setDemoteReasonMap({
                                  ...demoteReasonMap,
                                  [expert.id]: demoteReasonMap[expert.id] ?? "",
                                });
                                return;
                              }
                              if (
                                !confirm(
                                  `Demote ${expert.displayName} from Elite to Proven?`,
                                )
                              )
                                return;
                              onDemoteElite(expert.id, reason);
                              setDemoteReasonMap((m) => {
                                const n = { ...m };
                                delete n[expert.id];
                                return n;
                              });
                            }}
                            className="text-xs text-purple-500 hover:underline flex items-center gap-1"
                          >
                            <ArrowDown className="h-3 w-3" /> Demote from Elite
                          </button>
                          {demoteReasonMap[expert.id] !== undefined && (
                            <input
                              type="text"
                              placeholder="Reason (min 10 chars)..."
                              value={demoteReasonMap[expert.id] ?? ""}
                              onChange={(e) =>
                                setDemoteReasonMap({
                                  ...demoteReasonMap,
                                  [expert.id]: e.target.value,
                                })
                              }
                              className="w-48 border border-border rounded px-2 py-1 text-xs bg-background"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                      )}

                      {expert.user?.id && (
                        <button
                          onClick={() => onDeleteUser(expert.user.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors mt-1"
                          title="Delete user account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>,

                // Expanded detail row
                isExpanded && (
                  <tr
                    key={`${expert.id}-details`}
                    className="bg-secondary/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <td colSpan={isPending ? 4 : 5} className="px-6 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm animate-in slide-in-from-top-1 duration-150">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                            Professional
                          </h4>
                          <div className="space-y-1 text-muted-foreground">
                            <div>
                              <span className="text-foreground">
                                Legal Name:
                              </span>{" "}
                              {expert.legalFullName}
                            </div>
                            <div>
                              <span className="text-foreground">Location:</span>{" "}
                              {expert.country}
                            </div>
                            <div>
                              <span className="text-foreground">
                                Experience:
                              </span>{" "}
                              {expert.yearsExperience}
                            </div>
                            <div>
                              <span className="text-foreground">Tools:</span>{" "}
                              {expert.tools?.join(", ") || "—"}
                            </div>
                            <div>
                              <span className="text-foreground">Stripe:</span>{" "}
                              {expert.stripeAccountId || (
                                <span className="text-red-400">
                                  Not connected
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="text-foreground">Calendar:</span>{" "}
                              {expert.calendarUrl ? (
                                <a
                                  href={expert.calendarUrl}
                                  className="text-blue-400 underline"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View
                                </a>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                            Private Notes
                          </h4>
                          <div className="text-xs bg-background p-3 rounded border border-border font-mono whitespace-pre-wrap text-muted-foreground">
                            {expert.bio || "No notes."}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                            Portfolio
                          </h4>
                          <div className="flex flex-col gap-1">
                            {(Array.isArray(expert.portfolioLinks)
                              ? expert.portfolioLinks
                              : []
                            ).map((link: string, i: number) => (
                              <a
                                key={i}
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" /> {link}
                              </a>
                            ))}
                            {!(
                              Array.isArray(expert.portfolioLinks) &&
                              expert.portfolioLinks.length > 0
                            ) && (
                              <span className="text-xs text-muted-foreground">
                                No links.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {pendingExperts.length > 0 && renderExpertList(pendingExperts, true)}

      {/* Elite Applications */}
      {eliteApplications.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-purple-500/20 bg-purple-500/5">
          <div className="px-6 py-3 border-b border-purple-500/20 bg-purple-500/10 flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-500" />
            <h3 className="font-bold text-purple-500">
              Elite Applications ({eliteApplications.length})
            </h3>
          </div>
          <div className="divide-y divide-purple-500/10">
            {eliteApplications.map((app) => (
              <div
                key={app.id}
                className="px-6 py-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {app.displayName || app.legalFullName || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {app.user.email} · {app.completedSalesCount} sales · Tier:{" "}
                    {app.tier || "STANDARD"}
                    {app.isFoundingExpert && " · Founding"}
                  </p>
                  {app.tools?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {app.tools.slice(0, 5).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 bg-secondary rounded border border-white/5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Applied:{" "}
                    {app.eliteAppliedAt
                      ? new Date(app.eliteAppliedAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApproveElite?.(app.id)}
                      className="px-3 py-1 bg-purple-500 text-white font-bold rounded text-xs hover:bg-purple-400"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = denyReasonMap[app.id];
                        if (!reason || reason.trim().length < 10) {
                          setDenyReasonMap({
                            ...denyReasonMap,
                            [app.id]: denyReasonMap[app.id] ?? "",
                          });
                          return;
                        }
                        onDenyElite?.(app.id, reason);
                        setDenyReasonMap((m) => {
                          const n = { ...m };
                          delete n[app.id];
                          return n;
                        });
                      }}
                      className="px-3 py-1 border border-border rounded text-xs hover:bg-secondary"
                    >
                      Deny
                    </button>
                  </div>
                  {denyReasonMap[app.id] !== undefined && (
                    <input
                      type="text"
                      placeholder="Reason (min 10 chars)..."
                      value={denyReasonMap[app.id] ?? ""}
                      onChange={(e) =>
                        setDenyReasonMap({
                          ...denyReasonMap,
                          [app.id]: e.target.value,
                        })
                      }
                      className="w-56 border border-border rounded px-2 py-1 text-xs bg-background"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, or tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      {renderExpertList(pag.items, false)}
      <PaginationControls
        page={pag.page}
        totalPages={pag.totalPages}
        totalItems={pag.totalItems}
        onPrev={pag.prevPage}
        onNext={pag.nextPage}
      />
    </div>
  );
}
