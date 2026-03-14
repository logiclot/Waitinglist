import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InboxClient } from "@/components/inbox/InboxClient";
import { Conversation, Expert, Solution } from "@/types";

export const metadata = {
  title: "Inbox | LogicLot",
};

export default async function InboxPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const expertProfile = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        ...(expertProfile ? [{ sellerId: expertProfile.id }] : []),
      ],
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      solution: { include: { expert: true } },
      seller: true,
      order: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Fetch buyer business profiles separately to resolve buyer display names
  const buyerIds = [...new Set(conversations.map((c) => c.buyerId))];
  const buyerProfiles = await prisma.businessProfile.findMany({
    where: { userId: { in: buyerIds } },
    select: { userId: true, firstName: true, lastName: true, companyName: true },
  });
  const buyerProfileMap = Object.fromEntries(buyerProfiles.map((bp) => [bp.userId, bp]));

  const mappedConversations: Conversation[] = conversations.map((c) => {
    const bp = buyerProfileMap[c.buyerId];
    const buyerName = bp?.companyName || (bp?.firstName ? `${bp.firstName}${bp.lastName ? ` ${bp.lastName}` : ""}` : null) || "Client";

    return {
      id: c.id,
      buyer_id: c.buyerId,
      seller_id: c.sellerId,
      solution_id: c.solutionId || undefined,
      order_id: c.orderId || undefined,
      job_post_id: c.jobPostId || undefined,
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
      buyer_name: buyerName,

      messages: c.messages.map((m) => ({
        id: m.id,
        conversation_id: m.conversationId,
        sender_id: m.senderId,
        body: m.body,
        type: m.type as "user" | "system" | "bid_card",
        created_at: m.createdAt.toISOString(),
      })),

      solution: c.solution
        ? ({
            ...c.solution,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            implementation_price: c.solution.implementationPriceCents / 100,
            monthly_cost_min: c.solution.monthlyCostMinCents ? c.solution.monthlyCostMinCents / 100 : 0,
            monthly_cost_max: c.solution.monthlyCostMaxCents ? c.solution.monthlyCostMaxCents / 100 : 0,
            delivery_days: c.solution.deliveryDays,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            status: c.solution.status as any,
            integrations: c.solution.integrations,
            implementation_price_cents: c.solution.implementationPriceCents,
          } as unknown as Solution)
        : undefined,

      seller: {
        id: c.seller.id,
        user_id: c.seller.userId,
        name: c.seller.displayName || c.seller.legalFullName,
        verified: c.seller.verified,
        founding: c.seller.isFoundingExpert,
        completed_sales_count: c.seller.completedSalesCount,
        tools: c.seller.tools,
        calendarUrl: c.seller.calendarUrl,
      } as Expert,
    };
  });

  return (
    <InboxClient
      initialConversations={mappedConversations}
      currentUserId={session.user.id}
    />
  );
}
