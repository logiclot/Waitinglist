import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { MessageSquare, ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MilestoneTable } from "@/components/projects/MilestoneTable";
import { MilestoneTimeline } from "@/components/projects/MilestoneTimeline";
import { ExpertAcceptButton } from "@/components/projects/ExpertAcceptButton";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import Link from "next/link";

type MilestoneStatus = "pending_payment" | "in_escrow" | "releasing" | "released" | "waiting_for_funds";
function normalizeMilestones(raw: Record<string, unknown>[]): { title: string; description: string; price: number; priceCents: number; status: MilestoneStatus }[] {
  return raw.map((m) => {
    const rawCents = (m as { priceCents?: number }).priceCents;
    const rawPrice = (m as { price?: number }).price;
    const priceCents = typeof rawCents === "number" ? rawCents : Math.round((typeof rawPrice === "number" ? rawPrice : 0) * 100);
    const price = priceCents / 100;
    const statusMap: Record<string, string> = {
      pending: "pending_payment",
      waiting: "waiting_for_funds",
    };
    const status = (statusMap[(m as { status?: string }).status ?? ""] ?? (m as { status?: string }).status ?? "pending_payment") as MilestoneStatus;
    return {
      title: String((m as { title?: string }).title ?? "Milestone"),
      description: String((m as { description?: string }).description ?? ""),
      price,
      priceCents,
      status,
    };
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft:       { label: "Draft",       className: "bg-muted text-muted-foreground" },
    paid_pending_implementation: { label: "Action Required", className: "bg-amber-100 text-amber-700" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
    delivered:   { label: "Delivered",   className: "bg-green-100 text-green-700" },
    revision_requested: { label: "Revision Requested", className: "bg-amber-100 text-amber-700" },
    approved:    { label: "Approved",    className: "bg-emerald-100 text-emerald-700" },
    disputed:    { label: "Under Review", className: "bg-amber-100 text-amber-700" },
    refunded:    { label: "Refunded",    className: "bg-slate-100 text-slate-600" },
  };
  const { label, className } = map[status] ?? { label: status.replace(/_/g, " "), className: "bg-muted text-muted-foreground" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}

export default async function ExpertProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Get expert's specialist profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { specialistProfile: true },
  });

  const specialistId = user?.specialistProfile?.id;

  if (!specialistId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Active Projects</h1>
        <EmptyState
          title="No active projects"
          description="Complete your expert profile to start receiving orders."
          primaryCtaLabel="Complete Profile"
          primaryCtaHref="/expert/settings"
        />
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      sellerId: specialistId,
      status: { notIn: ["draft"] },
    },
    include: {
      buyer: {
        select: {
          id: true,
          profileImageUrl: true,
          businessProfile: { select: { firstName: true, lastName: true, companyName: true } },
        },
      },
      solution: { select: { title: true } },
      bid: { include: { jobPost: { select: { title: true } } } },
      conversations: { take: 1, orderBy: { createdAt: "desc" } },
      seller: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Active Projects</h1>
        <EmptyState
          title="No active projects"
          description="You don't have any projects in progress right now. Browse open requests to find work."
          primaryCtaLabel="Find Work"
          primaryCtaHref="/jobs"
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Active Projects</h1>
      </div>

      {orders.map((order) => {
        const bp = order.buyer?.businessProfile;
        const clientName = bp?.companyName || (bp ? `${bp.firstName || ""} ${bp.lastName || ""}`.trim() : null) || "Client";
        const clientImage = order.buyer?.profileImageUrl;
        const thread = order.conversations?.[0];
        const messageLink = thread
          ? `/messages/${thread.id}`
          : `/messages/new?user=${order.buyerId}&order=${order.id}`;
        const milestones = normalizeMilestones((order.milestones as Record<string, unknown>[]) || []);

        return (
          <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-secondary/10">
              <div className="flex items-start gap-4">
                <Avatar
                  src={clientImage}
                  name={clientName}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">
                      {order.solution?.title ?? order.bid?.jobPost?.title ?? "Project"}
                    </h2>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Client: <span className="font-medium text-foreground">{clientName}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto">
                <div className="text-right mr-4 hidden md:block">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Total Value</p>
                  <p className="text-lg font-bold">{"\u20AC"}{(order.priceCents / 100).toLocaleString()}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Accept button for pending orders */}
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

            {/* Dispute / special status banners */}
            {order.status === "disputed" && (
              <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">This project is under review</p>
                  <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                    Our support team has been notified and will contact you within 1-2 business days.
                  </p>
                </div>
              </div>
            )}

            {order.status === "refunded" && (
              <div className="mx-6 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700 text-sm">Order refunded</p>
                  <p className="text-slate-600 text-sm mt-1">
                    This order has been refunded to the client.
                  </p>
                </div>
              </div>
            )}

            {/* Milestone Timeline */}
            {!["draft", "refunded"].includes(order.status) && (
              <div className="px-6 pt-4">
                <MilestoneTimeline
                  milestones={milestones.map(m => ({
                    title: m.title,
                    priceCents: m.priceCents,
                    status: m.status,
                  }))}
                  orderStatus={order.status}
                  projectTitle={order.solution?.title ?? order.bid?.jobPost?.title ?? "Project"}
                  isBuyer={false}
                />
              </div>
            )}

            {/* Milestone Table — actions */}
            <MilestoneTable
              orderId={order.id}
              milestones={milestones}
              isBuyer={false}
              isSeller={true}
              orderStatus={order.status}
              revisionCount={order.revisionCount ?? 0}
            />

            {/* Review section (only for delivered/approved orders) */}
            {["delivered", "approved"].includes(order.status) && (
              <div className="px-6 pb-4">
                <ReviewSection
                  orderId={order.id}
                  role="seller"
                  sellerName={order.seller?.displayName ?? "Expert"}
                  buyerName={clientName}
                />
              </div>
            )}

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
          </div>
        );
      })}
    </div>
  );
}
