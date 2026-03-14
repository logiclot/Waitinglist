import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowRight, MessageSquare, ShieldCheck, AlertTriangle, CheckCircle2, FileText, RotateCcw } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createNotification } from "@/lib/notifications";
import { checkBusinessReferralCondition } from "@/actions/referral";
import { MilestoneTable } from "@/components/projects/MilestoneTable";
import { MilestoneTimeline } from "@/components/projects/MilestoneTimeline";
import { CancelOrderButton } from "@/components/projects/CancelOrderButton";
import { CollapsibleProjectCard } from "@/components/projects/CollapsibleProjectCard";
import { DisputeStatementForm } from "@/components/projects/DisputeStatementForm";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import Link from "next/link";
import { SuccessToast } from "@/components/SuccessToast";
import { log } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

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
    paid_pending_implementation: { label: "Awaiting Expert", className: "bg-amber-100 text-amber-700" },
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

/**
 * Server-side Stripe session verification.
 * When the user returns from Stripe checkout, we verify the session and update
 * the milestone directly — no need to wait for the webhook. Fully idempotent:
 * if the webhook already processed, the milestone is already "in_escrow" and
 * this is a no-op.
 */
async function verifyAndProcessCheckout(sessionId: string, buyerId: string) {
  try {
    if (!stripe || !sessionId) return;

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkoutSession.payment_status !== "paid") return;

    const { orderId, milestoneIndex, type } = checkoutSession.metadata || {};
    if (type !== "milestone_funding" || !orderId || !milestoneIndex) return;

    const idx = parseInt(milestoneIndex);
    if (isNaN(idx)) return;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: true,
        solution: { select: { title: true } },
        conversations: { select: { id: true }, take: 1 },
      },
    });

    if (!order || order.buyerId !== buyerId) return;

    const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
    const milestone = milestones[idx];
    if (!milestone) return;

    // Idempotency: skip if already funded or further along
    if (["in_escrow", "releasing", "released"].includes(milestone.status)) return;

    // Update milestone status
    milestones[idx] = {
      ...milestone,
      status: "in_escrow",
      fundedAt: new Date().toISOString(),
      stripePaymentIntentId: typeof checkoutSession.payment_intent === "string"
        ? checkoutSession.payment_intent
        : undefined,
    };

    const newStatus = order.status === "draft"
      ? "paid_pending_implementation"
      : "in_progress";

    await prisma.order.update({
      where: { id: orderId },
      data: {
        milestones: milestones as unknown as Prisma.InputJsonValue,
        status: newStatus,
        ...(typeof checkoutSession.payment_intent === "string"
          ? { stripePaymentIntentId: checkoutSession.payment_intent }
          : {}),
      },
    });

    // Create order_card in conversation
    const conversationId = order.conversations[0]?.id;
    if (conversationId) {
      await prisma.message.create({
        data: {
          conversationId,
          senderId: buyerId,
          type: "order_card",
          body: JSON.stringify({
            type: "milestone_funded",
            milestoneTitle: milestone.title,
            milestoneIndex: idx,
            priceCents: milestone.priceCents ?? 0,
            projectTitle: order.solution?.title || "Project",
            orderId: order.id,
          }),
        },
      });
    }

    // Notify both parties
    await Promise.all([
      createNotification(
        buyerId,
        "💰 Milestone Funded",
        `Payment for "${milestone.title}" is secured in escrow.${newStatus === "paid_pending_implementation" ? " The expert will accept your order within 24–48 hours." : ""}`,
        "success",
        "/business/projects"
      ),
      order.seller?.userId
        ? createNotification(
            order.seller.userId,
            newStatus === "paid_pending_implementation"
              ? "🔔 New order — accept to begin"
              : "💰 Milestone Funded",
            newStatus === "paid_pending_implementation"
              ? `A client has funded "${milestone.title}". Please accept the order within 48 hours to start working.`
              : `Milestone "${milestone.title}" has been funded by the client. You can continue work.`,
            newStatus === "paid_pending_implementation" ? "alert" : "info",
            "/expert/projects"
          )
        : Promise.resolve(),
    ]);

    // Check referral condition
    await checkBusinessReferralCondition(buyerId).catch(() => {});

    log.info("checkout.verified_on_redirect", { orderId, milestoneIdx: idx });
  } catch (error) {
    log.error("checkout.verify_on_redirect_failed", { error: String(error) });
  }
}

export default async function BusinessProjectsPage({ searchParams }: { searchParams: { success?: string; session_id?: string; orderId?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Verify Stripe checkout session on redirect — ensures milestone is updated
  // even if the webhook hasn't arrived yet (common in local dev, rare in production)
  if (searchParams?.session_id && searchParams?.success === "true") {
    await verifyAndProcessCheckout(searchParams.session_id, session.user.id);
  }

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
      dispute: { select: { buyerStatement: true, sellerStatement: true, resolution: true, resolutionNote: true, status: true } },
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
          ? (order.seller?.displayName || "Deleted Expert")
          : (order.buyer?.businessProfile?.firstName || "Client");
        const counterpartyImage = isBuyer
          ? order.seller?.user?.profileImageUrl
          : order.buyer?.profileImageUrl;
        
        const counterpartyRole = isBuyer ? "Expert" : "Client";
        const thread = order.conversations?.[0];
        const messageLink = thread
          ? `/messages/${thread.id}`
          : `/messages/new?${isBuyer ? `expert=${order.sellerId}` : `user=${order.buyerId}`}&order=${order.id}`;

        const isCompleted = ["approved", "refunded"].includes(order.status);

        return (
          <CollapsibleProjectCard
            key={order.id}
            defaultCollapsed={isCompleted}
            header={
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

                <div className="flex items-center gap-4 self-end md:self-auto pr-10">
                  <div className="text-right mr-4 hidden md:block">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Total Value</p>
                    <p className="text-lg font-bold">€{(order.priceCents / 100).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            }
          >
            {/* Action buttons row */}
            <div className="px-6 pt-4 flex flex-wrap items-center gap-2 justify-end">
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

            {/* Dispute resolution banner — visible even after order status changes back */}
            {order.dispute?.status === "resolved" && order.dispute?.resolution && (
              <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">
                      Dispute resolved — {order.dispute.resolution.replace(/_/g, " ")}
                    </p>
                    {order.dispute.resolutionNote && (
                      <p className="text-blue-700 text-sm mt-1 leading-relaxed">
                        {order.dispute.resolutionNote}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {order.status === "disputed" && order.dispute?.status !== "resolved" && (
              <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">This project is under review</p>
                    <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                      A dispute has been opened. Our team will review both sides and reach out within 1–2 business days with a verdict. Use the form below to share your perspective — this helps us make a fair decision faster.
                    </p>
                    <a
                      href="mailto:contact@logiclot.io?subject=Dispute%20Review"
                      className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 underline underline-offset-2 mt-2"
                    >
                      Email support directly →
                    </a>
                  </div>
                </div>
                <DisputeStatementForm
                  orderId={order.id}
                  existingStatement={order.dispute?.buyerStatement ?? null}
                  role="buyer"
                />
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

            {order.status === "revision_requested" && (
              <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <RotateCcw className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">
                    Revision requested (#{order.revisionCount ?? 1})
                  </p>
                  <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                    The expert is reviewing your request. They will either accept and work on the changes, or the project will go to dispute review.
                  </p>
                  {order.revisionNote && (
                    <p className="text-amber-800 text-sm mt-2 bg-amber-100/50 rounded-lg px-3 py-2 italic">
                      &ldquo;{order.revisionNote}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Milestone Timeline — visual progress tracker */}
            {!["draft", "refunded"].includes(order.status) && (
              <div className="px-6 pt-4">
                <MilestoneTimeline
                  milestones={normalizeMilestones((order.milestones as Record<string, unknown>[]) || []).map(m => ({
                    title: m.title,
                    priceCents: m.priceCents,
                    status: m.status,
                  }))}
                  orderStatus={order.status}
                  projectTitle={order.solution?.title ?? order.bid?.jobPost?.title ?? "Project"}
                  isBuyer={isBuyer}
                  orderId={order.id}
                />
              </div>
            )}

            {/* Milestone Table — fund & release actions */}
            <MilestoneTable
              orderId={order.id}
              milestones={normalizeMilestones((order.milestones as Record<string, unknown>[]) || [])}
              isBuyer={isBuyer}
              isSeller={!isBuyer}
              orderStatus={order.status}
              revisionCount={order.revisionCount ?? 0}
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
          </CollapsibleProjectCard>
        );
      })}
    </div>
  );
}
