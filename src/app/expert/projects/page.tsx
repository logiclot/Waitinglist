import { EmptyState } from "@/components/EmptyState";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ExpertProjectsClient,
  type SerializedOrder,
  type MilestoneStatus,
  type NormalizedMilestone,
} from "@/components/projects/ExpertProjectsClient";

/* ── Milestone normaliser (server-only) ────────────────────────────── */

function normalizeMilestones(raw: Record<string, unknown>[]): NormalizedMilestone[] {
  return raw.map((m) => {
    const rawCents = (m as { priceCents?: number }).priceCents;
    const rawPrice = (m as { price?: number }).price;
    const priceCents =
      typeof rawCents === "number"
        ? rawCents
        : Math.round((typeof rawPrice === "number" ? rawPrice : 0) * 100);
    const price = priceCents / 100;
    const statusMap: Record<string, string> = {
      pending: "pending_payment",
      waiting: "waiting_for_funds",
    };
    const status = (statusMap[(m as { status?: string }).status ?? ""] ??
      (m as { status?: string }).status ??
      "pending_payment") as MilestoneStatus;
    return {
      title: String((m as { title?: string }).title ?? "Milestone"),
      description: String((m as { description?: string }).description ?? ""),
      price,
      priceCents,
      status,
    };
  });
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default async function ExpertProjectsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { specialistProfile: true },
  });

  const specialistId = user?.specialistProfile?.id;

  if (!specialistId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Projects</h1>
        <EmptyState
          title="No projects"
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
      dispute: { select: { sellerStatement: true, resolution: true, resolutionNote: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize into plain objects for the client component
  const serialized: SerializedOrder[] = orders.map((order) => {
    const bp = order.buyer?.businessProfile;
    const clientName =
      bp?.companyName ||
      (bp ? `${bp.firstName || ""} ${bp.lastName || ""}`.trim() : null) ||
      "Client";

    return {
      id: order.id,
      status: order.status,
      priceCents: order.priceCents,
      createdAt: order.createdAt.toISOString(),
      milestones: normalizeMilestones(
        (order.milestones as Record<string, unknown>[]) || []
      ),
      revisionCount: order.revisionCount ?? 0,
      revisionNote: order.revisionNote ?? null,
      buyerId: order.buyerId,
      projectTitle:
        order.solution?.title ?? order.bid?.jobPost?.title ?? "Project",
      clientName,
      clientImage: order.buyer?.profileImageUrl ?? null,
      conversationId: order.conversations?.[0]?.id ?? null,
      sellerDisplayName: order.seller?.displayName ?? "Expert",
      disputeSellerStatement: order.dispute?.sellerStatement ?? null,
      disputeResolution: order.dispute?.resolution ?? null,
      disputeResolutionNote: order.dispute?.resolutionNote ?? null,
      disputeStatus: order.dispute?.status ?? null,
    };
  });

  return (
    <ExpertProjectsClient
      orders={serialized}
      initialTab={searchParams.tab}
    />
  );
}
