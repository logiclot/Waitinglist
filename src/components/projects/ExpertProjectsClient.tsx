"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { MilestoneTable } from "@/components/projects/MilestoneTable";
import { MilestoneTimeline } from "@/components/projects/MilestoneTimeline";
import { ExpertAcceptButton } from "@/components/projects/ExpertAcceptButton";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { CompactProjectCard } from "@/components/projects/CompactProjectCard";
import { DisputeStatementForm } from "@/components/projects/DisputeStatementForm";
import { EmptyState } from "@/components/EmptyState";

/* ── Types ─────────────────────────────────────────────────────────── */

export type MilestoneStatus =
  | "pending_payment"
  | "in_escrow"
  | "releasing"
  | "released"
  | "waiting_for_funds";

export interface NormalizedMilestone {
  title: string;
  description: string;
  price: number;
  priceCents: number;
  status: MilestoneStatus;
}

export interface SerializedOrder {
  id: string;
  status: string;
  priceCents: number;
  createdAt: string;
  milestones: NormalizedMilestone[];
  revisionCount: number;
  revisionNote: string | null;
  buyerId: string;
  projectTitle: string;
  clientName: string;
  clientImage: string | null;
  conversationId: string | null;
  sellerDisplayName: string;
  disputeSellerStatement: string | null;
  disputeResolution: string | null;
  disputeResolutionNote: string | null;
  disputeStatus: string | null;
}

/* ── Constants ─────────────────────────────────────────────────────── */

const COMPLETE_STATUSES = ["approved", "refunded"];

type Tab = "active" | "completed" | "all";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  paid_pending_implementation: { label: "Action Required", className: "bg-amber-100 text-amber-700" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  delivered: { label: "Awaiting Approval", className: "bg-amber-100 text-amber-700" },
  revision_requested: { label: "Revision Requested", className: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700" },
  disputed: { label: "Under Review", className: "bg-amber-100 text-amber-700" },
  refunded: { label: "Refunded", className: "bg-slate-100 text-slate-600" },
};

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGE[status] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${badge.className}`}>
      {badge.label}
    </span>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function getMessageLink(order: SerializedOrder) {
  return order.conversationId
    ? `/messages/${order.conversationId}`
    : `/messages/new?user=${order.buyerId}&order=${order.id}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── Empty States per Tab ──────────────────────────────────────────── */

const EMPTY: Record<Tab, { title: string; description: string; cta?: { label: string; href: string } }> = {
  active: {
    title: "No active projects",
    description: "You don't have any projects in progress right now. Browse open requests to find work.",
    cta: { label: "Find Work", href: "/jobs" },
  },
  completed: {
    title: "No completed projects yet",
    description: "Your finished projects will appear here once a client approves your work.",
  },
  all: {
    title: "No projects yet",
    description: "You don't have any projects yet. Browse open requests to find work.",
    cta: { label: "Find Work", href: "/jobs" },
  },
};

/* ── Sub-components ────────────────────────────────────────────────── */

function OrderFooter() {
  return (
    <div className="p-4 bg-secondary/5 border-t border-border flex justify-between items-center">
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="w-3 h-3" />
        <span>Payments held in escrow until the client approves the work.</span>
      </div>
      <Link
        href="/how-it-works?view=expert"
        className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
      >
        How payments work <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function ExpandedOrder({ order }: { order: SerializedOrder }) {
  const messageLink = getMessageLink(order);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-secondary/10">
        <div className="flex items-start gap-4">
          <Avatar src={order.clientImage} name={order.clientName} size="lg" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{order.projectTitle}</h2>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Client: <span className="font-medium text-foreground">{order.clientName}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <div className="text-right mr-4 hidden md:block">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Total Value</p>
            <p className="text-lg font-bold">{"\u20AC"}{(order.priceCents / 100).toLocaleString()}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {order.status === "paid_pending_implementation" && (
              <ExpertAcceptButton orderId={order.id} />
            )}
            <Link
              href={messageLink}
              className="bg-white border border-border hover:bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" /> Message Client
            </Link>
          </div>
        </div>
      </div>

      {/* Accept banner */}
      {order.status === "paid_pending_implementation" && (
        <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">New order — action required</p>
            <p className="text-amber-700 text-sm mt-1 leading-relaxed">
              A client has funded this project. Please accept the order to start working. Orders not accepted within 48 hours will be automatically refunded.
            </p>
          </div>
        </div>
      )}

      {/* Dispute resolution banner — visible even after order status changes back */}
      {order.disputeStatus === "resolved" && order.disputeResolution && (
        <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800 text-sm">
                Dispute resolved — {order.disputeResolution.replace(/_/g, " ")}
              </p>
              {order.disputeResolutionNote && (
                <p className="text-blue-700 text-sm mt-1 leading-relaxed">
                  {order.disputeResolutionNote}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {order.status === "disputed" && order.disputeStatus !== "resolved" && (
        <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">This project is under review</p>
              <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                A dispute has been opened. Our team will review both sides and reach out within 1–2 business days with a verdict. Use the form below to share your perspective — this helps us make a fair decision faster.
              </p>
            </div>
          </div>
          <DisputeStatementForm
            orderId={order.id}
            existingStatement={order.disputeSellerStatement}
            role="seller"
          />
        </div>
      )}

      {/* Revision banner */}
      {order.status === "revision_requested" && (
        <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <RotateCcw className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              Client requested modifications (#{order.revisionCount || 1})
            </p>
            <p className="text-amber-700 text-sm mt-1 leading-relaxed">
              Please review the request below and accept to make changes, or deny to open a dispute.
            </p>
            {order.revisionNote && (
              <p className="text-amber-800 text-sm mt-2 bg-amber-100/50 rounded-lg px-3 py-2 italic">
                &ldquo;{order.revisionNote}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* Milestone Timeline */}
      {!["draft", "refunded"].includes(order.status) && (
        <div className="px-6 pt-4">
          <MilestoneTimeline
            milestones={order.milestones.map((m) => ({
              title: m.title,
              priceCents: m.priceCents,
              status: m.status,
            }))}
            orderStatus={order.status}
            projectTitle={order.projectTitle}
            isBuyer={false}
          />
        </div>
      )}

      {/* Milestone Table */}
      <MilestoneTable
        orderId={order.id}
        milestones={order.milestones}
        isBuyer={false}
        isSeller={true}
        orderStatus={order.status}
        revisionCount={order.revisionCount}
      />

      {/* Reviews */}
      {["delivered", "approved"].includes(order.status) && (
        <div className="px-6 pb-4">
          <ReviewSection
            orderId={order.id}
            role="seller"
            sellerName={order.sellerDisplayName}
            buyerName={order.clientName}
          />
        </div>
      )}

      <OrderFooter />
    </div>
  );
}

function CompactOrder({ order }: { order: SerializedOrder }) {
  const messageLink = getMessageLink(order);
  const releasedCount = order.milestones.filter((m) => m.status === "released").length;
  const orderDate = formatDate(order.createdAt);

  return (
    <CompactProjectCard
      summary={
        <div className="flex items-center gap-4">
          <Avatar src={order.clientImage} name={order.clientName} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold truncate">{order.projectTitle}</h2>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              <span>
                Client: <span className="font-medium text-foreground">{order.clientName}</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs">
                <Calendar className="w-3 h-3" /> {orderDate}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-lg font-bold">{"\u20AC"}{(order.priceCents / 100).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {releasedCount}/{order.milestones.length} released
            </p>
          </div>
        </div>
      }
    >
      {/* Action bar */}
      <div className="px-6 py-3 flex justify-end bg-secondary/10 border-b border-border">
        <Link
          href={messageLink}
          className="bg-white border border-border hover:bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <MessageSquare className="w-4 h-4" /> Message Client
        </Link>
      </div>

      {/* Refund banner */}
      {order.status === "refunded" && (
        <div className="mx-6 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-700 text-sm">Order refunded</p>
            <p className="text-slate-600 text-sm mt-1">This order has been refunded to the client.</p>
          </div>
        </div>
      )}

      {/* Milestone Timeline */}
      {!["draft", "refunded"].includes(order.status) && (
        <div className="px-6 pt-4">
          <MilestoneTimeline
            milestones={order.milestones.map((m) => ({
              title: m.title,
              priceCents: m.priceCents,
              status: m.status,
            }))}
            orderStatus={order.status}
            projectTitle={order.projectTitle}
            isBuyer={false}
          />
        </div>
      )}

      {/* Milestone Table */}
      <MilestoneTable
        orderId={order.id}
        milestones={order.milestones}
        isBuyer={false}
        isSeller={true}
        orderStatus={order.status}
        revisionCount={order.revisionCount}
      />

      {/* Reviews */}
      {["delivered", "approved"].includes(order.status) && (
        <div className="px-6 pb-4">
          <ReviewSection
            orderId={order.id}
            role="seller"
            sellerName={order.sellerDisplayName}
            buyerName={order.clientName}
          />
        </div>
      )}

      <OrderFooter />
    </CompactProjectCard>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */

interface ExpertProjectsClientProps {
  orders: SerializedOrder[];
  initialTab?: string;
}

export function ExpertProjectsClient({ orders, initialTab }: ExpertProjectsClientProps) {
  const [tab, setTab] = useState<Tab>(
    initialTab === "completed" ? "completed" : initialTab === "all" ? "all" : "active"
  );

  const activeCount = orders.filter((o) => !COMPLETE_STATUSES.includes(o.status)).length;
  const completedCount = orders.filter((o) => COMPLETE_STATUSES.includes(o.status)).length;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "active", label: "Active", count: activeCount },
    { key: "completed", label: "Completed", count: completedCount },
    { key: "all", label: "All", count: orders.length },
  ];

  const filteredOrders = orders.filter((order) => {
    if (tab === "active") return !COMPLETE_STATUSES.includes(order.status);
    if (tab === "completed") return COMPLETE_STATUSES.includes(order.status);
    return true; // "all"
  });

  const empty = EMPTY[tab];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-1">Manage and review all your projects in one place.</p>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {t.label}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Order List ──────────────────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title={empty.title}
          description={empty.description}
          primaryCtaLabel={empty.cta?.label}
          primaryCtaHref={empty.cta?.href}
        />
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isComplete = COMPLETE_STATUSES.includes(order.status);
            // On "all" tab: show completed as compact, active as expanded
            // On "active" tab: always expanded
            // On "completed" tab: always compact
            if (tab === "completed" || (tab === "all" && isComplete)) {
              return <CompactOrder key={order.id} order={order} />;
            }
            return <ExpandedOrder key={order.id} order={order} />;
          })}
        </div>
      )}
    </div>
  );
}
