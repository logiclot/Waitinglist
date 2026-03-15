"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, Users, Briefcase, ShoppingBag, TrendingUp, LayoutGrid } from "lucide-react";
import { Solution } from "@/types";
import { ListingEditor } from "@/components/admin/ListingEditor";
import { ExpertManagementTab } from "@/components/admin/ExpertManagementTab";
import { SolutionManagementTab } from "@/components/admin/SolutionManagementTab";
import {
  approveSpecialist, suspendSpecialist,
  makeFoundingSpecialist, removeFoundingExpert,
  setExpertFee, setExpertTier,
  adminDeleteUser, adminDeleteOrder, adminDeleteSolution,
  updateSolutionVideoStatus, liftBidBan,
  approveEliteApplication, denyEliteApplication, demoteFromElite,
  sendExpertInvites, getWaitlistInviteStats,
} from "@/actions/admin";
import { DisputeManagementTab, type AdminDispute } from "@/components/admin/DisputeManagementTab";
import { AuditResultsTab, type AuditCompletion } from "@/components/admin/AuditResultsTab";
import { BRAND_NAME } from "@/lib/branding";
import { TIER_THRESHOLDS } from "@/lib/commission";

// ── Admin-specific types (shaped by getAdminData in actions/admin.ts) ─────────

export interface AdminExpert {
  id: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | string;
  verified: boolean;
  isFoundingExpert: boolean;
  foundingRank: number | null;
  platformFeePercentage: number | null;
  tier: "STANDARD" | "PROVEN" | "ELITE" | string;
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
    businessProfile?: { companyName?: string | null; firstName?: string | null } | null;
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
  initialExperts: AdminExpert[];
  initialSolutions: Solution[];
  initialOrders: AdminOrder[];
  initialBusinesses: AdminBusiness[];
  initialDisputes: AdminDispute[];
  initialAuditCompletions: AuditCompletion[];
  initialEliteApplications?: EliteApplication[];
  stats: {
    totalUsers: number;
    totalExperts: number;
    totalBusinesses: number;
    totalSolutions: number;
    totalOrders: number;
    totalRevenueCents: number;
    openDisputeCount: number;
  };
}

// ── Invite Panel ──────────────────────────────────────────────────────────────

function InvitePanel({ showMessage }: { showMessage: (msg: string, error?: boolean) => void }) {
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<{ pendingCount: number; sentCount: number; usedCount: number } | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load stats on mount
  if (!loaded) {
    setLoaded(true);
    getWaitlistInviteStats().then(s => { if (s) setStats(s); });
  }

  const handleSend = async () => {
    if (!confirm("This will send invite emails to all expert waitlist signups who haven't been invited yet. Continue?")) return;
    setSending(true);
    const result = await sendExpertInvites();
    setSending(false);
    if ("error" in result && result.error) {
      showMessage(result.error, true);
    } else if ("sent" in result) {
      showMessage(`Sent ${result.sent} invite${result.sent === 1 ? "" : "s"} successfully.`);
      getWaitlistInviteStats().then(s => { if (s) setStats(s); });
    }
  };

  return (
    <div className="border border-border rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Expert Invites</h2>
        <p className="text-sm text-muted-foreground">Send invite emails to experts who signed up on the waitlist. Each invite contains a unique link that pre-fills their email and skips verification.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Not yet invited</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats.sentCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Invited (pending signup)</div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{stats.usedCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Signed up</div>
          </div>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending || (stats?.pendingCount === 0)}
        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {sending ? "Sending..." : `Send Invites${stats ? ` (${stats.pendingCount})` : ""}`}
      </button>
    </div>
  );
}

export function AdminDashboard({ initialExperts, initialSolutions, initialOrders, initialBusinesses, initialDisputes, initialAuditCompletions, initialEliteApplications = [], stats }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"experts" | "solutions" | "orders" | "businesses" | "disputes" | "audits" | "invites">("experts");
  const [expertList, setExpertList] = useState<AdminExpert[]>(initialExperts);
  const [expandedExpertId, setExpandedExpertId] = useState<string | null>(null);
  const [solutionList, setSolutionList] = useState<Solution[]>(initialSolutions);
  const [orderList, setOrderList] = useState<AdminOrder[]>(initialOrders);
  const [eliteApplications, setEliteApplications] = useState<EliteApplication[]>(initialEliteApplications);
  const [fullEditingSolution, setFullEditingSolution] = useState<Solution | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const showMessage = (msg: string, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(null), 4000);
  };

  // ── Expert actions ──────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    await approveSpecialist(id);
    setExpertList(expertList.map((e) => e.id === id ? { ...e, status: "APPROVED" } : e));
    showMessage("Expert approved.");
  };

  const handleSuspend = async (id: string) => {
    await suspendSpecialist(id);
    setExpertList(expertList.map((e) => e.id === id ? { ...e, status: "SUSPENDED" } : e));
    showMessage("Expert suspended.");
  };

  const handleMakeFounding = async (id: string) => {
    const currentFounders = expertList.filter((e) => e.isFoundingExpert).length;
    if (currentFounders >= 20) { showMessage("Maximum of 20 Founding Experts reached.", true); return; }
    await makeFoundingSpecialist(id, currentFounders + 1);
    setExpertList(expertList.map((e) => e.id === id ? { ...e, isFoundingExpert: true, foundingRank: currentFounders + 1, platformFeePercentage: 11 } : e));
    showMessage("Expert granted Founding status (fee locked at 11%).");
  };

  const handleRemoveFounding = async (id: string) => {
    if (!confirm("Remove Founding Expert status? Their fee lock will be removed.")) return;
    await removeFoundingExpert(id);
    setExpertList(expertList.map((e) => e.id === id ? { ...e, isFoundingExpert: false, foundingRank: null } : e));
    showMessage("Founding Expert status removed.");
  };

  const handleSetFee = async (id: string, fee: number) => {
    await setExpertFee(id, fee);
    setExpertList(expertList.map((e) => e.id === id ? { ...e, commissionOverridePercent: fee, platformFeePercentage: fee } : e));
    showMessage(`Fee updated to ${fee}%.`);
  };

  const handleSetTier = async (id: string, tier: "STANDARD" | "PROVEN" | "ELITE") => {
    const tierFeeMap: Record<string, number> = { STANDARD: TIER_THRESHOLDS.STANDARD, PROVEN: TIER_THRESHOLDS.PROVEN, ELITE: TIER_THRESHOLDS.ELITE };
    const fee = tierFeeMap[tier];
    await setExpertTier(id, tier);
    setExpertList(expertList.map((e) => e.id === id ? { ...e, tier, commissionOverridePercent: fee, platformFeePercentage: fee } : e));
    showMessage(`Tier set to ${tier} (${fee}% fee).`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Permanently delete this user and all their data? This cannot be undone.")) return;
    const result = await adminDeleteUser(userId);
    if (result.error) { showMessage(`Error: ${result.error}`, true); return; }
    setExpertList(expertList.filter((e) => e.user?.id !== userId));
    showMessage("User deleted.");
  };

  // ── Elite application actions ─────────────────────────────────────────────
  const handleApproveElite = async (expertId: string) => {
    const result = await approveEliteApplication(expertId);
    if (result.error) { showMessage(`Error: ${result.error}`, true); return; }
    setEliteApplications(eliteApplications.filter((a) => a.id !== expertId));
    setExpertList(expertList.map((e) => e.id === expertId ? { ...e, tier: "ELITE" } : e));
    showMessage("Elite application approved.");
  };

  const handleDenyElite = async (expertId: string, reason: string) => {
    const result = await denyEliteApplication(expertId, reason);
    if (result.error) { showMessage(`Error: ${result.error}`, true); return; }
    setEliteApplications(eliteApplications.filter((a) => a.id !== expertId));
    showMessage("Elite application denied.");
  };

  const handleDemoteElite = async (expertId: string, reason: string) => {
    const result = await demoteFromElite(expertId, reason);
    if (result.error) { showMessage(`Error: ${result.error}`, true); return; }
    setExpertList(expertList.map((e) => e.id === expertId ? { ...e, tier: "PROVEN" } : e));
    showMessage("Expert demoted from Elite to Proven.");
  };

  // ── Solution actions ────────────────────────────────────────────────────────
  const handleVideoStatus = async (id: string, status: "approved" | "rejected", reason?: string) => {
    await updateSolutionVideoStatus(id, status, reason);
    setSolutionList(solutionList.map((s) =>
      s.id === id ? { ...s, demoVideoStatus: status } : s
    ));
    showMessage(`Video ${status}.`);
  };

  const handleDeleteSolution = async (id: string) => {
    if (!confirm("Permanently delete this solution?")) return;
    const result = await adminDeleteSolution(id);
    if (result.error) { showMessage(`Error: ${result.error}`, true); return; }
    setSolutionList(solutionList.filter((s) => s.id !== id));
    showMessage("Solution deleted.");
  };

  const handleSaveListing = (data: Partial<Solution>) => {
    if (fullEditingSolution) {
      setSolutionList(solutionList.map((s) => s.id === fullEditingSolution.id ? { ...s, ...data } as Solution : s));
      setFullEditingSolution(null);
      showMessage("Solution updated.");
    } else {
      setIsCreating(false);
      showMessage("Solution created.");
    }
  };

  // ── Order actions ───────────────────────────────────────────────────────────
  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Permanently delete this order?")) return;
    const result = await adminDeleteOrder(id);
    if (result.error) { showMessage(`Error: ${result.error}`, true); return; }
    setOrderList(orderList.filter((o) => o.id !== id));
    showMessage("Order deleted.");
  };

  // ── Edit mode ───────────────────────────────────────────────────────────────
  if (fullEditingSolution || isCreating) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{isCreating ? "Create New Listing" : `Edit: ${fullEditingSolution?.title}`}</h1>
          <button onClick={() => { setFullEditingSolution(null); setIsCreating(false); }} className="text-muted-foreground hover:text-foreground">
            ← Back
          </button>
        </div>
        <ListingEditor
          initialData={fullEditingSolution || {}}
          onSave={handleSaveListing}
          onCancel={() => { setFullEditingSolution(null); setIsCreating(false); }}
        />
      </div>
    );
  }

  const foundingCount = expertList.filter((e) => e.isFoundingExpert).length;
  const provenCount = expertList.filter((e) => e.tier === "PROVEN").length;
  const eliteCount = expertList.filter((e) => e.tier === "ELITE").length;
  const standardCount = expertList.filter((e) => e.tier === "STANDARD" || !e.tier).length;

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{BRAND_NAME} Admin</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Founding: <span className="font-bold text-foreground">{foundingCount}</span>/20</span>
          <span className="text-border">|</span>
          <span>Elite: <span className="font-bold text-foreground">{eliteCount}</span></span>
          <span className="text-border">|</span>
          <span>Proven: <span className="font-bold text-foreground">{provenCount}</span></span>
          <span className="text-border">|</span>
          <span>Standard: <span className="font-bold text-foreground">{standardCount}</span></span>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users },
          { label: "Experts", value: stats.totalExperts, icon: Briefcase },
          { label: "Businesses", value: stats.totalBusinesses, icon: LayoutGrid },
          { label: "Solutions", value: stats.totalSolutions, icon: ShoppingBag },
          { label: "GMV", value: `€${(stats.totalRevenueCents / 100).toLocaleString()}`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border overflow-x-auto">
        {(["experts", "solutions", "orders", "businesses", "disputes", "audits", "invites"] as const).map((tab) => {
          const counts: Record<string, number> = {
            experts: expertList.length,
            solutions: solutionList.length,
            orders: orderList.length,
            businesses: initialBusinesses.length,
            disputes: initialDisputes.length,
            audits: initialAuditCompletions.length,
            invites: 0,
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors font-medium capitalize ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
            </button>
          );
        })}
      </div>

      {/* Toast */}
      {message && (
        <div className={`px-4 py-2 rounded-md mb-6 flex items-center gap-2 animate-in fade-in text-sm ${
          isError ? "bg-red-500/10 border border-red-500/20 text-red-500" : "bg-green-500/10 border border-green-500/20 text-green-500"
        }`}>
          <Check className="h-4 w-4 shrink-0" /> {message}
        </div>
      )}

      {/* Tab content */}
      {activeTab === "experts" && (
        <ExpertManagementTab
          expertList={expertList}
          expandedExpertId={expandedExpertId}
          setExpandedExpertId={setExpandedExpertId}
          onApprove={handleApprove}
          onSuspend={handleSuspend}
          onMakeFounding={handleMakeFounding}
          onRemoveFounding={handleRemoveFounding}
          onSetFee={handleSetFee}
          onSetTier={handleSetTier}
          onDeleteUser={handleDeleteUser}
          onLiftBidBan={async (id) => { await liftBidBan(id); router.refresh(); }}
          eliteApplications={eliteApplications}
          onApproveElite={handleApproveElite}
          onDenyElite={handleDenyElite}
          onDemoteElite={handleDemoteElite}
        />
      )}

      {activeTab === "solutions" && (
        <SolutionManagementTab
          solutionList={solutionList}
          onVideoStatus={handleVideoStatus}
          onEditSolution={setFullEditingSolution}
          onCreateNew={() => setIsCreating(true)}
          onDeleteSolution={handleDeleteSolution}
        />
      )}

      {activeTab === "orders" && (
        <div className="space-y-2">
          {orderList.length === 0 && <p className="text-muted-foreground text-sm">No orders found.</p>}
          {orderList.map((order) => (
            <div key={order.id} className="border border-border rounded-lg p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{order.solution?.title ?? "Unknown solution"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Buyer: {order.buyer?.businessProfile?.companyName || order.buyer?.businessProfile?.firstName || order.buyer?.email || "—"}
                  {" · "}Expert: {order.seller?.displayName || "—"}
                  {" · "}€{((order.priceCents ?? 0) / 100).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                  order.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                  order.status === "draft" ? "bg-muted text-muted-foreground" :
                  order.status === "disputed" ? "bg-red-100 text-red-700" :
                  order.status === "delivered" ? "bg-green-100 text-green-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {order.status.replace(/_/g, " ")}
                </span>
                <button onClick={() => handleDeleteOrder(order.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded" title="Force delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "disputes" && (
        <DisputeManagementTab disputes={initialDisputes} showMessage={showMessage} />
      )}

      {activeTab === "audits" && (
        <AuditResultsTab completions={initialAuditCompletions} />
      )}

      {activeTab === "invites" && (
        <InvitePanel showMessage={showMessage} />
      )}

      {activeTab === "businesses" && (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium text-muted-foreground">Business</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Email</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Company</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Country</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Joined</th>
                <th className="px-6 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialBusinesses.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{b.firstName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{b.user?.email || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{b.companyName || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{b.country || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {b.user?.createdAt ? new Date(b.user.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        if (!confirm(`Delete user ${b.user?.email}? This removes all their data permanently.`)) return;
                        adminDeleteUser(b.user.id).then((r) => {
                          if (r.error) showMessage(`Error: ${r.error}`, true);
                          else { showMessage("User deleted."); router.refresh(); }
                        });
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {initialBusinesses.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">No businesses yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
