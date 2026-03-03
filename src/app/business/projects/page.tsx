import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowRight, MessageSquare, ShieldCheck, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MilestoneTable } from "@/components/projects/MilestoneTable";
import { CancelOrderButton } from "@/components/projects/CancelOrderButton";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import Link from "next/link";
import { SuccessToast } from "@/components/SuccessToast";

type MilestoneStatus = "pending_payment" | "in_escrow" | "releasing" | "released" | "waiting_for_funds";
function normalizeMilestones(raw: Record<string, unknown>[]): { title: string; description: string; price: number; status: MilestoneStatus }[] {
  return raw.map((m) => {
    const price = typeof (m as { priceCents?: number }).priceCents === "number"
      ? ((m as { priceCents: number }).priceCents / 100)
      : (typeof (m as { price?: number }).price === "number" ? (m as { price: number }).price : 0);
    const statusMap: Record<string, string> = {
      pending: "pending_payment",
      waiting: "waiting_for_funds",
    };
    const status = (statusMap[(m as { status?: string }).status ?? ""] ?? (m as { status?: string }).status ?? "pending_payment") as MilestoneStatus;
    return {
      title: String((m as { title?: string }).title ?? "Milestone"),
      description: String((m as { description?: string }).description ?? ""),
      price,
      status,
    };
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft:       { label: "Draft",       className: "bg-muted text-muted-foreground" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
    delivered:   { label: "Delivered",   className: "bg-green-100 text-green-700" },
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

export default async function BusinessProjectsPage({ searchParams }: { searchParams: { success?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const showSuccess = searchParams?.success === "true";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { specialistProfile: true }
  });

  const realOrders = await prisma.order.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        { sellerId: user?.specialistProfile?.id }
      ]
    },
    include: {
      seller: { include: { user: { select: { profileImageUrl: true } } } },
      buyer: { include: { businessProfile: true } },
      solution: true,
      bid: { include: { jobPost: { select: { title: true } } } },
      conversations: { take: 1, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" }
  });

  if (realOrders.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <EmptyState
          title="No active projects"
          description="You don't have any projects in progress. Post a request or browse solutions to get started."
          primaryCtaLabel="Add Request"
          primaryCtaHref="/business/add-request"
          secondaryCtaLabel="Browse Solutions"
          secondaryCtaHref="/business/solutions"
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {showSuccess && <SuccessToast message="Funds Secured. Your project is officially active." />}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Active Projects</h1>
        <button className="text-sm font-medium text-primary hover:underline">View Archived</button>
      </div>

      {realOrders.map((order) => {
        // Identify the "counterparty" (the other person in the deal)
        const isBuyer = order.buyerId === session.user.id;
        const counterpartyName = isBuyer 
          ? order.seller.displayName 
          : (order.buyer.businessProfile?.firstName || "Client");
        const counterpartyImage = isBuyer
          ? order.seller.user?.profileImageUrl
          : order.buyer.profileImageUrl;
        
        const counterpartyRole = isBuyer ? "Expert" : "Client";
        const thread = order.conversations?.[0];
        const messageLink = thread
          ? `/messages/${thread.id}`
          : `/messages/new?${isBuyer ? `expert=${order.sellerId}` : `user=${order.buyerId}`}&order=${order.id}`;

        return (
          <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            
            {/* Header */}
            <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-secondary/10">
              <div className="flex items-start gap-4">
                 <Avatar
                   src={counterpartyImage}
                   name={counterpartyName}
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
                      <span>{counterpartyRole}: <span className="font-medium text-foreground">{counterpartyName}</span></span>
                      {isBuyer && order.seller.verified && (
                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto">
                <div className="text-right mr-4 hidden md:block">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Total Value</p>
                  <p className="text-lg font-bold">€{(order.priceCents / 100).toLocaleString()}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Link
                    href={`/invoice/${order.id}`}
                    className="bg-white border border-border hover:bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <FileText className="w-4 h-4" /> Invoice
                  </Link>
                  <Link
                    href={messageLink}
                    className="bg-white border border-border hover:bg-secondary text-foreground px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> Message {counterpartyRole}
                  </Link>
                  {isBuyer && !["delivered", "approved", "refunded"].includes(order.status) && (
                    <CancelOrderButton orderId={order.id} orderStatus={order.status} />
                  )}
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
                    Our support team has been notified and will contact you within 1–2 business days.
                    If any milestones were funded, a refund will be processed once the review is complete.
                  </p>
                  <a
                    href="mailto:support@logiclot.com?subject=Dispute%20Review"
                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 underline underline-offset-2 mt-2"
                  >
                    Email support directly →
                  </a>
                </div>
              </div>
            )}

            {order.status === "refunded" && (
              <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">Refund processed</p>
                  <p className="text-green-700 text-sm mt-1">
                    Any funded milestones have been refunded to your original payment method.
                    Refunds typically appear within 5–10 business days.
                  </p>
                </div>
              </div>
            )}

            {/* Milestone Table */}
            <MilestoneTable
              orderId={order.id}
              milestones={normalizeMilestones((order.milestones as Record<string, unknown>[]) || [])}
              isBuyer={isBuyer}
              isSeller={!isBuyer}
            />

            {/* Review section (only for delivered/approved orders) */}
            {["delivered", "approved"].includes(order.status) && (
              <div className="px-6 pb-4">
                <ReviewSection
                  orderId={order.id}
                  role={isBuyer ? "buyer" : "seller"}
                  sellerName={order.seller.displayName ?? "Expert"}
                  buyerName={
                    order.buyer.businessProfile?.companyName ??
                    order.buyer.businessProfile?.firstName ??
                    "Client"
                  }
                />
              </div>
            )}

            <div className="p-4 bg-secondary/5 border-t border-border flex justify-between items-center">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                <span>Payments held in escrow until you approve the work.</span>
              </div>
              <Link
                href="/how-it-works?view=business"
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
