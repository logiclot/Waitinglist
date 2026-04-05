import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  FileText,
  ArrowRight,
  Clock,
  Euro,
  Wrench,
  CheckCircle2,
  XCircle,
  Star,
  Send,
  Search,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function ExpertActiveBidsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/sign-in");

  const profile = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) redirect("/dashboard");

  const bids = await prisma.bid.findMany({
    where: { specialistId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      jobPost: {
        include: {
          buyer: { include: { businessProfile: true } },
          _count: { select: { bids: true } },
        },
      },
      order: { select: { id: true, conversations: { take: 1, select: { id: true } } } },
    },
  });

  const active = bids.filter(
    (b) => b.status === "submitted" || b.status === "shortlisted"
  );
  const accepted = bids.filter((b) => b.status === "accepted");
  const closed = bids.filter(
    (b) => b.status === "rejected" || b.status === "withdrawn"
  );

  if (bids.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Active Bids
        </h1>
        <EmptyState
          title="No bids yet"
          description="You haven't placed any bids on projects yet."
          primaryCtaLabel="Find Work"
          primaryCtaHref="/jobs"
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Active Bids
        </h1>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Search className="h-3.5 w-3.5" /> Find Work
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{active.length}</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Pending
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {accepted.length}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Accepted
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">
            {closed.length}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Closed
          </p>
        </div>
      </div>

      {/* Active / Pending bids */}
      {active.length > 0 && (
        <BidSection
          title="Pending"
          subtitle={`${active.length} bid${active.length !== 1 ? "s" : ""} awaiting response`}
          bids={active}
        />
      )}

      {/* Accepted bids */}
      {accepted.length > 0 && (
        <BidSection
          title="Accepted"
          subtitle={`${accepted.length} bid${accepted.length !== 1 ? "s" : ""} accepted`}
          bids={accepted}
        />
      )}

      {/* Closed bids */}
      {closed.length > 0 && (
        <BidSection
          title="Closed"
          subtitle={`${closed.length} bid${closed.length !== 1 ? "s" : ""} closed`}
          bids={closed}
        />
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BidSection({ title, subtitle, bids }: { title: string; subtitle: string; bids: any[] }) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {bids.map((bid) => (
        <BidCard key={bid.id} bid={bid} />
      ))}
    </div>
  );
}

const statusConfig: Record<string, { label: string; className: string; icon: typeof Send }> = {
  submitted: {
    label: "Submitted",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: Send,
  },
  shortlisted: {
    label: "Shortlisted",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Star,
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Not selected",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
    icon: XCircle,
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BidCard({ bid }: { bid: any }) {
  const post = bid.jobPost;
  const company =
    post.buyer?.businessProfile?.companyName ?? "A business";
  const cfg = statusConfig[bid.status] ?? statusConfig.submitted;
  const StatusIcon = cfg.icon;
  const isAccepted = bid.status === "accepted";
  const conversationId = bid.order?.conversations?.[0]?.id;

  // Accepted bids link to the project; others link to the job post
  const primaryHref = isAccepted
    ? "/expert/projects"
    : `/jobs/${post.id}`;
  const primaryLabel = isAccepted ? "Go to Project" : "View";

  const submittedAt = new Date(bid.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`bg-card border rounded-xl p-5 transition-all ${
        bid.status === "rejected" || bid.status === "withdrawn"
          ? "opacity-60 border-border"
          : isAccepted
          ? "border-emerald-500/30"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Company + status */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {company[0]}
            </div>
            <span className="font-medium text-sm">{company}</span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.className}`}
            >
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base">
            {post.title}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Euro className="h-3 w-3" />
              {post.budgetRange}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.timeline}
            </span>
            {post.tools?.length > 0 && (
              <span className="flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                {post.tools.slice(0, 3).join(", ")}
                {post.tools.length > 3 && ` +${post.tools.length - 3}`}
              </span>
            )}
            <span>{post._count.bids} / 3 proposals</span>
            <span>Submitted {submittedAt}</span>
          </div>

          {/* Your bid summary */}
          {bid.priceEstimate && (
            <p className="text-xs text-muted-foreground">
              Your estimate:{" "}
              <span className="font-medium text-foreground">
                {bid.priceEstimate}
              </span>
              {bid.estimatedTime && (
                <span>
                  {" "}· Delivery:{" "}
                  <span className="font-medium text-foreground">
                    {bid.estimatedTime}
                  </span>
                </span>
              )}
            </p>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {primaryLabel} <ArrowRight className="h-3 w-3" />
          </Link>
          {isAccepted && conversationId && (
            <Link
              href={`/messages/${conversationId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <MessageCircle className="h-3 w-3" /> Message Client
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
