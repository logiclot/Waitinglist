"use client";

import {
  adminDeleteOrder,
  adminDeleteSolution,
  denyEliteApplication,
  getBusinessWaitlistInviteStats,
  getWaitlistInviteStats,
  sendBusinessInvites,
  sendExpertInvites,
  updateSolutionVideoStatus
} from "@/actions/admin";
import {
  DisputeManagementTab,
  type AdminDispute,
} from "@/components/admin/old-admin/DisputeManagementTab";
import { ListingEditor } from "@/components/admin/ListingEditor";
import { SolutionManagementTab } from "@/components/admin/old-admin/SolutionManagementTab";
import { Solution } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Trash2
} from "lucide-react";
import { useState } from "react";

import { BRAND_NAME } from "@/lib/branding";
import { SpecialistTier } from "@prisma/client";

// ── Admin-specific types (shaped by getAdminData in actions/admin.ts) ─────────

export interface AdminExpert {
  id: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | string;
  verified: boolean;
  isFoundingExpert: boolean;
  foundingRank: number | null;
  platformFeePercentage: number | null;
  tier: SpecialistTier;
  completedSalesCount: number;
  displayName: string | null;
  bidBannedUntil?: Date | string | null;
  bidQuality?: { up: number; down: number };
  // Extended fields from SpecialistProfile
  legalFullName?: string;
  country?: string | null;
  yearsExperience?: string;
  tools?: string[];
  stripeAccountId?: string | null;
  calendarUrl?: string | null;
  bio?: string | null;
  portfolioLinks?: unknown;
  user: {
    id: string;
    email: string;
    createdAt: Date | string;
  };
  solutions?: { id: string }[];
}

export interface AdminOrder {
  id: string;
  status: string;
  priceCents: number | null;
  solution?: { title: string } | null;
  buyer?: {
    email?: string | null;
    businessProfile?: {
      companyName?: string | null;
      firstName?: string | null;
    } | null;
  } | null;
  seller?: { displayName?: string | null } | null;
}

export interface AdminBusiness {
  id: string;
  user: {
    id: string;
    email: string;
    createdAt: Date | string;
  };
  companyName: string | null;
  firstName: string | null;
  country: string | null;
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

interface AdminDashboardProps {
  initialOrders: AdminOrder[];
  initialDisputes: AdminDispute[];
  initialEliteApplications?: EliteApplication[];
}

// ── Invite Panel ──────────────────────────────────────────────────────────────

function InvitePanel({
  showMessage,
}: {
  showMessage: (msg: string, error?: boolean) => void;
}) {
  const [sending, setSending] = useState(false);

  const {
    data: stats,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["waitlist-invite-stats"],
    queryFn: () => getWaitlistInviteStats(),
  });

  const handleSend = async () => {
    if (
      !confirm(
        "This will send invite emails to all expert waitlist signups who haven't been invited yet. Continue?",
      )
    )
      return;
    setSending(true);
    const result = await sendExpertInvites();
    setSending(false);
    if ("error" in result && result.error) {
      showMessage(result.error, true);
    } else if ("sent" in result) {
      showMessage(
        `Sent ${result.sent} invite${result.sent === 1 ? "" : "s"} successfully.`,
      );
      refetch();
    }
  };

  return (
    <div className="border border-border rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Expert Invites</h2>
        <p className="text-sm text-muted-foreground">
          Send invite emails to experts who signed up on the waitlist. Each
          invite contains a unique link that pre-fills their email and skips
          verification.
        </p>
      </div>

      {isPending ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-secondary/30 rounded-lg p-4 text-center animate-pulse"
            >
              <div className="h-7 w-12 bg-secondary/60 rounded-md mx-auto" />
              <div className="h-3 w-16 bg-secondary/40 rounded mx-auto mt-2.5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats?.pendingCount ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Not yet invited
            </div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats?.sentCount ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Invited</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats?.usedCount ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Signed up</div>
          </div>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending || isPending || !stats?.pendingCount}
        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {sending
          ? "Sending..."
          : isPending
            ? "Loading stats..."
            : `Send Invites (${stats?.pendingCount ?? 0})`}
      </button>
    </div>
  );
}

// ── Business Invite Panel ────────────────────────────────────────────────────

function BusinessInvitePanel({
  showMessage,
}: {
  showMessage: (msg: string, error?: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: stats, isPending } = useQuery({
    queryKey: ["business-waitlist-invite-stats"],
    queryFn: () => getBusinessWaitlistInviteStats(),
  });

  const mutation = useMutation({
    mutationFn: () => sendBusinessInvites(),
    onSuccess: (result) => {
      if ("error" in result && result.error) {
        showMessage(result.error, true);
      } else if ("sent" in result) {
        showMessage(
          `Sent ${result.sent} invite${result.sent === 1 ? "" : "s"} successfully.`,
        );
        queryClient.invalidateQueries({
          queryKey: ["business-waitlist-invite-stats"],
        });
      }
    },
    onError: (err) => {
      showMessage(`Failed to send invites: ${err.message}`, true);
    },
  });

  const handleSend = () => {
    if (
      !confirm(
        "This will send invite emails to all business waitlist signups who haven't been invited yet. Continue?",
      )
    )
      return;
    mutation.mutate();
  };

  return (
    <div className="border border-border rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Business Invites</h2>
        <p className="text-sm text-muted-foreground">
          Send invite emails to businesses who signed up on the waitlist. Each
          invite contains a unique link that pre-fills their email and skips
          verification.
        </p>
      </div>

      {isPending ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-secondary/30 rounded-lg p-4 text-center animate-pulse"
            >
              <div className="h-7 w-12 bg-secondary/60 rounded-md mx-auto" />
              <div className="h-3 w-16 bg-secondary/40 rounded mx-auto mt-2.5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats?.pendingCount ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Not yet invited
            </div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats?.sentCount ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Invited</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats?.usedCount ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Signed up</div>
          </div>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={mutation.isPending || isPending || !stats?.pendingCount}
        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {mutation.isPending
          ? "Sending..."
          : isPending
            ? "Loading stats..."
            : `Send Invites (${stats?.pendingCount ?? 0})`}
      </button>
    </div>
  );
}

export function AdminDashboard({
  initialOrders,
  initialDisputes,
  initialEliteApplications = [],
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    | "orders"
    | "businesses"
    | "disputes"
    | "invites"
    | "business-invites"
  >("orders");
  const [orderList, setOrderList] = useState<AdminOrder[]>(initialOrders);
  const [eliteApplications, setEliteApplications] = useState<
    EliteApplication[]
  >(initialEliteApplications);
  const [fullEditingSolution, setFullEditingSolution] =
    useState<Solution | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const showMessage = (msg: string, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleDenyElite = async (expertId: string, reason: string) => {
    const result = await denyEliteApplication(expertId, reason);
    if (result.error) {
      showMessage(`Error: ${result.error}`, true);
      return;
    }
    setEliteApplications(eliteApplications.filter((a) => a.id !== expertId));
    showMessage("Elite application denied.");
  };



  // ── Order actions ───────────────────────────────────────────────────────────
  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Permanently delete this order?")) return;
    const result = await adminDeleteOrder(id);
    if (result.error) {
      showMessage(`Error: ${result.error}`, true);
      return;
    }
    setOrderList(orderList.filter((o) => o.id !== id));
    showMessage("Order deleted.");
  };

  // ── Edit mode ───────────────────────────────────────────────────────────────
  if (fullEditingSolution || isCreating) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {isCreating
              ? "Create New Listing"
              : `Edit: ${fullEditingSolution?.title}`}
          </h1>
          <button
            onClick={() => {
              setFullEditingSolution(null);
              setIsCreating(false);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{BRAND_NAME} Admin</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border overflow-x-auto">
        {(
          [
            "orders",
            "disputes",
            "invites",
            "business-invites",
          ] as const
        ).map((tab) => {
          const counts: Record<string, number> = {
            orders: orderList.length,
            disputes: initialDisputes.length,
            invites: 0,
            "business-invites": 0,
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors font-medium capitalize ${activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab === "business-invites"
                ? "Biz Invites"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
              {counts[tab] > 0 ? counts[tab] : null}
            </button>
          );
        })}
      </div>

      {/* Toast */}
      {message && (
        <div
          className={`px-4 py-2 rounded-md mb-6 flex items-center gap-2 animate-in fade-in text-sm ${isError
            ? "bg-red-500/10 border border-red-500/20 text-red-500"
            : "bg-green-500/10 border border-green-500/20 text-green-500"
            }`}
        >
          <Check className="h-4 w-4 shrink-0" /> {message}
        </div>
      )}


      {activeTab === "orders" && (
        <div className="space-y-2">
          {orderList.length === 0 && (
            <p className="text-muted-foreground text-sm">No orders found.</p>
          )}
          {orderList.map((order) => (
            <div
              key={order.id}
              className="border border-border rounded-lg p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {order.solution?.title ?? "Unknown solution"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Buyer:{" "}
                  {order.buyer?.businessProfile?.companyName ||
                    order.buyer?.businessProfile?.firstName ||
                    order.buyer?.email ||
                    "—"}
                  {" · "}Expert: {order.seller?.displayName || "—"}
                  {" · "}€{((order.priceCents ?? 0) / 100).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${order.status === "in_progress"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "draft"
                      ? "bg-muted text-muted-foreground"
                      : order.status === "disputed"
                        ? "bg-red-100 text-red-700"
                        : order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                    }`}
                >
                  {order.status.replace(/_/g, " ")}
                </span>
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                  title="Force delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "disputes" && (
        <DisputeManagementTab
          disputes={initialDisputes}
          showMessage={showMessage}
        />
      )}

      {activeTab === "invites" && <InvitePanel showMessage={showMessage} />}

      {activeTab === "business-invites" && (
        <BusinessInvitePanel showMessage={showMessage} />
      )}
    </div>
  );
}
