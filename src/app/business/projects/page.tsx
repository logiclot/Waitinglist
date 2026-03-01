import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import {
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Zap,
  Clock,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPersonalizedRecommendations } from "@/lib/recommendation-engine";
import { MilestoneTable } from "@/components/projects/MilestoneTable";
import { CancelOrderButton } from "@/components/projects/CancelOrderButton";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import Link from "next/link";
import { SuccessToast } from "@/components/SuccessToast";
// Milestone type from @/types used as reference for status normalization

type NormalizedMilestoneStatus =
  | "pending_payment"
  | "waiting_for_funds"
  | "in_escrow"
  | "released";

type NormalizedMilestone = {
  title: string;
  description: string;
  price: number;
  status: NormalizedMilestoneStatus;
};

function normalizeMilestones(
  raw: Record<string, unknown>[]
): NormalizedMilestone[] {
  return raw.map((m) => {
    const price =
      typeof (m as { priceCents?: number }).priceCents === "number"
        ? (m as { priceCents: number }).priceCents / 100
        : typeof (m as { price?: number }).price === "number"
          ? (m as { price: number }).price
          : 0;
    const statusMap: Record<string, string> = {
      pending: "pending_payment",
      waiting: "waiting_for_funds",
      releasing: "in_escrow",
    };
    const rawStatus = (m as { status?: string }).status ?? "";
    const status = (statusMap[rawStatus] ?? (rawStatus || "pending_payment")) as NormalizedMilestoneStatus;
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
    draft: {
      label: "Draft",
      className: "bg-muted text-muted-foreground",
    },
    paid_pending_implementation: {
      label: "Paid — Pending Start",
      className: "bg-purple-100 text-purple-700",
    },
    in_progress: {
      label: "In Progress",
      className: "bg-blue-100 text-blue-700",
    },
    delivered: {
      label: "Delivered",
      className: "bg-green-100 text-green-700",
    },
    approved: {
      label: "Approved",
      className: "bg-emerald-100 text-emerald-700",
    },
    disputed: {
      label: "Under Review",
      className: "bg-amber-100 text-amber-700",
    },
    refunded: {
      label: "Refunded",
      className: "bg-slate-100 text-slate-600",
    },
  };
  const { label, className } = map[status] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}

function formatPrice(cents: number): string {
  return `\u20AC${(cents / 100).toLocaleString("en-IE", {
    maximumFractionDigits: 0,
  })}`;
}

export default async function BusinessProjectsPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/business/projects");
  }

  const showSuccess = searchParams?.success === "true";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { specialistProfile: true },
  });

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        ...(user?.specialistProfile?.id
          ? [{ sellerId: user.specialistProfile.id }]
          : []),
      ],
    },
    include: {
      seller: {
        include: { user: { select: { profileImageUrl: true } } },
      },
      buyer: { include: { businessProfile: true } },
      solution: { select: { title: true, slug: true, category: true } },
      conversations: { take: 1, orderBy: { createdAt: "desc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Fetch recommendations for the "What's Next?" section
  let recommendations: Awaited<
    ReturnType<typeof getPersonalizedRecommendations>
  > = [];
  try {
    recommendations = await getPersonalizedRecommendations(
      session.user.id,
      3
    );
  } catch {
    recommendations = [];
  }

  if (orders.length === 0) {
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

  const completedOrders = orders.filter((o) =>
    ["approved", "refunded"].includes(o.status)
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {showSuccess && (
        <SuccessToast message="Funds Secured. Your project is officially active." />
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Active Projects</h1>
        <button className="text-sm font-medium text-primary hover:underline">
          View Archived
        </button>
      </div>

      {orders.map((order) => {
        // Identify the "counterparty" (the other person in the deal)
        const isBuyer = order.buyerId === session.user.id;
        const counterpartyName = isBuyer
          ? order.seller.displayName
          : order.buyer.businessProfile?.firstName || "Client";
        const counterpartyImage = isBuyer
          ? order.seller.user?.profileImageUrl
          : order.buyer.profileImageUrl;

        const counterpartyRole = isBuyer ? "Expert" : "Client";
        const thread = order.conversations?.[0];
        const messageLink = thread
          ? `/messages/${thread.id}`
          : `/messages/new?${isBuyer ? `expert=${order.sellerId}` : `user=${order.buyerId}`}&order=${order.id}`;

        return (
          <div
            key={order.id}
            className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
          >
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
                      {order.solution?.title ?? "Project"}
                    </h2>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {counterpartyRole}:{" "}
                      <span className="font-medium text-foreground">
                        {counterpartyName}
                      </span>
                    </span>
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">
                    Total Value
                  </p>
                  <p className="text-lg font-bold">
                    {formatPrice(order.priceCents)}
                  </p>
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
                    <MessageSquare className="w-4 h-4" /> Message{" "}
                    {counterpartyRole}
                  </Link>
                  {isBuyer &&
                    !["delivered", "approved", "refunded"].includes(
                      order.status
                    ) && (
                      <CancelOrderButton
                        orderId={order.id}
                        orderStatus={order.status}
                      />
                    )}
                </div>
              </div>
            </div>

            {/* Dispute / special status banners */}
            {order.status === "disputed" && (
              <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">
                    This project is under review
                  </p>
                  <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                    Our support team has been notified and will contact you
                    within 1-2 business days. If any milestones were funded, a
                    refund will be processed once the review is complete.
                  </p>
                  <a
                    href="mailto:support@logiclot.com?subject=Dispute%20Review"
                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 underline underline-offset-2 mt-2"
                  >
                    Email support directly &rarr;
                  </a>
                </div>
              </div>
            )}

            {order.status === "refunded" && (
              <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">
                    Refund processed
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Any funded milestones have been refunded to your original
                    payment method. Refunds typically appear within 5-10
                    business days.
                  </p>
                </div>
              </div>
            )}

            {/* Milestone Table */}
            <MilestoneTable
              orderId={order.id}
              milestones={normalizeMilestones(
                (order.milestones as Record<string, unknown>[]) || []
              )}
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
                <span>
                  Payments held in escrow until you approve the work.
                </span>
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

      {/* What's Next? — recommendation section for completed users */}
      {completedOrders.length > 0 && recommendations.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">What&apos;s Next?</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Based on your profile, here are automations other businesses like
            you are using.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((r) => (
              <Link
                key={r.id}
                href={`/solutions/${r.slug}`}
                className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded">
                    {r.category}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {r.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {r.shortSummary ||
                    r.outcome ||
                    "Ready-to-deploy automation solution."}
                </p>
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm">
                  <span className="font-bold">
                    {formatPrice(r.implementationPriceCents)}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {r.deliveryDays} days
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
