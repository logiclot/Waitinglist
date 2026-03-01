import { notFound, redirect } from "next/navigation";
import { ThreadView } from "@/components/ThreadView";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Conversation, Solution, Expert } from "@/types";

interface PageProps {
  params: {
    threadId: string;
  };
}

export const metadata = {
  title: "Conversation | LogicLot",
};

export default async function ThreadPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.threadId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      },
      solution: {
        include: { expert: true }
      },
      seller: { include: { user: { select: { profileImageUrl: true } } } },
      order: true,
      buyer: {
        select: {
          profileImageUrl: true,
          businessProfile: { select: { firstName: true, lastName: true, companyName: true } }
        }
      }
    }
  });

  if (!conversation) {
    notFound();
  }

  // Verify participant
  const isBuyer = conversation.buyerId === session.user.id;
  const isSeller = conversation.seller.userId === session.user.id;

  if (!isBuyer && !isSeller) {
    notFound(); // Or unauthorized
  }

  // Determine other party
  let otherPartyName = "Unknown";
  let otherPartyId = "";
  let otherPartyVerified = false;
  let otherPartyImage: string | null = null;

  if (isBuyer) {
    otherPartyName = conversation.seller.displayName || conversation.seller.legalFullName;
    otherPartyId = conversation.seller.userId;
    otherPartyVerified = conversation.seller.verified;
    otherPartyImage = conversation.seller.user?.profileImageUrl ?? null;
  } else {
    const bp = conversation.buyer?.businessProfile;
    otherPartyName = bp?.companyName || (bp ? `${bp.firstName || ""} ${bp.lastName || ""}`.trim() : null) || "Client";
    otherPartyId = conversation.buyerId;
    otherPartyImage = conversation.buyer?.profileImageUrl ?? null;
  }

  // Map to Client Types
  const mappedConversation: Conversation = {
    id: conversation.id,
    buyer_id: conversation.buyerId,
    seller_id: conversation.sellerId,
    solution_id: conversation.solutionId || undefined,
    order_id: conversation.orderId || undefined,
    created_at: conversation.createdAt.toISOString(),
    updated_at: conversation.updatedAt.toISOString(),
    
    messages: conversation.messages.map(m => ({
      id: m.id,
      conversation_id: m.conversationId,
      sender_id: m.senderId,
      body: m.body,
      type: m.type as "user" | "system",
      created_at: m.createdAt.toISOString()
    })),
    
    solution: conversation.solution ? {
      ...conversation.solution,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      implementation_price: conversation.solution.implementationPriceCents / 100,
      monthly_cost_min: conversation.solution.monthlyCostMinCents ? conversation.solution.monthlyCostMinCents / 100 : 0,
      monthly_cost_max: conversation.solution.monthlyCostMaxCents ? conversation.solution.monthlyCostMaxCents / 100 : 0,
      delivery_days: conversation.solution.deliveryDays,
      status: conversation.solution.status as import("@/types").SolutionStatus,
      integrations: conversation.solution.integrations,
      implementation_price_cents: conversation.solution.implementationPriceCents,
    } as unknown as Solution : undefined,

    seller: {
      id: conversation.seller.id,
      name: conversation.seller.displayName,
      verified: conversation.seller.verified,
      founding: conversation.seller.isFoundingExpert,
      completed_sales_count: conversation.seller.completedSalesCount,
      tools: conversation.seller.tools,
      calendarUrl: conversation.seller.calendarUrl ?? undefined
    } as Expert
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <ThreadView 
          conversation={mappedConversation} 
          currentUser={{
            id: session.user.id,
            name: session.user.name || undefined,
            image: session.user.image ?? undefined
          }}
          otherParty={{
            id: otherPartyId,
            name: otherPartyName,
            verified: otherPartyVerified,
            image: otherPartyImage
          }}
          expertCalendarUrl={isBuyer ? (conversation.seller.calendarUrl ?? undefined) : undefined}
          meetLinkUrl={isSeller ? (conversation.seller.calendarUrl ?? undefined) : undefined}
        />
      </div>
    </div>
  );
}
