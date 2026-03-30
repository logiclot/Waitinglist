import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InboxClient } from "@/components/inbox/InboxClient";
import { Conversation, Expert, Solution } from "@/types";

export const metadata = {
  title: "Messages | LogicLot",
};

function InboxSkeleton() {
  return (
    <div className="h-full">
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-28 bg-secondary/40 rounded-md animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-60px)]">
          {/* Conversation List Skeleton */}
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 border-b border-border bg-secondary/10">
              <div className="h-9 w-full bg-secondary/30 rounded-lg animate-pulse" />
            </div>
            <div className="overflow-y-auto flex-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full p-4 border-b border-border/50 border-l-4 border-l-transparent"
                >
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary/40 shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="h-4 w-24 bg-secondary/40 rounded animate-pulse" />
                        <div className="h-3 w-14 bg-secondary/30 rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-32 bg-secondary/30 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-secondary/20 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area Skeleton */}
          <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-secondary/5">
              <div className="w-16 h-16 bg-secondary/20 rounded-full animate-pulse mb-4" />
              <div className="h-5 w-40 bg-secondary/30 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-secondary/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function InboxContent({ userId }: { userId: string }) {
  const expertProfile = await prisma.specialistProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: expertProfile?.id }],
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      solution: {
        include: { expert: true },
      },
      seller: {
        include: { user: { select: { id: true, profileImageUrl: true } } },
      },
      order: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const buyerIds = [...new Set(conversations.map((c) => c.buyerId))];
  const [buyerUsers, buyerProfiles] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: buyerIds } },
      select: { id: true, profileImageUrl: true },
    }),
    prisma.businessProfile.findMany({
      where: { userId: { in: buyerIds } },
      select: {
        userId: true,
        companyName: true,
        firstName: true,
        lastName: true,
      },
    }),
  ]);

  const buyerImageMap = Object.fromEntries(
    buyerUsers.map((u) => [u.id, u.profileImageUrl]),
  );
  const buyerProfileMap = Object.fromEntries(
    buyerProfiles.map((bp) => [bp.userId, bp]),
  );

  const mappedConversations: Conversation[] = conversations.map((c) => {
    const bp = buyerProfileMap[c.buyerId];
    const buyerName =
      bp?.companyName ||
      (bp?.firstName
        ? `${bp.firstName}${bp.lastName ? ` ${bp.lastName}` : ""}`
        : null) ||
      "Client";

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
      buyer_image: buyerImageMap[c.buyerId] ?? null,

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
            monthly_cost_min: c.solution.monthlyCostMinCents
              ? c.solution.monthlyCostMinCents / 100
              : 0,
            monthly_cost_max: c.solution.monthlyCostMaxCents
              ? c.solution.monthlyCostMaxCents / 100
              : 0,
            delivery_days: c.solution.deliveryDays,
            status: c.solution.status as import("@/types").SolutionStatus,
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
        profile_image_url: c.seller.user?.profileImageUrl ?? undefined,
      } as Expert,
    };
  });

  return (
    <div className="h-full">
      <InboxClient
        initialConversations={mappedConversations}
        currentUserId={userId}
      />
    </div>
  );
}

export default async function DashboardMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  return (
    <Suspense fallback={<InboxSkeleton />}>
      <InboxContent userId={session.user.id} />
    </Suspense>
  );
}
