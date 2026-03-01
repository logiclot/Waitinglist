import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InboxClient } from "@/components/inbox/InboxClient";
import type { Conversation, Message } from "@/types";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/sign-in");

  const userId = session.user.id;

  // Check if user is an expert
  const specialist = await prisma.specialistProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  // Fetch all conversations where user is buyer or seller
  const rawConversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: userId },
        ...(specialist ? [{ sellerId: specialist.id }] : []),
      ],
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      solution: { select: { id: true, slug: true, title: true, demoPriceCents: true } },
      order: { select: { id: true, status: true } },
      seller: {
        select: {
          id: true,
          displayName: true,
          userId: true,
          slug: true,
          calendarUrl: true,
          isFoundingExpert: true,
          completedSalesCount: true,
          tools: true,
        },
      },
      buyer: { select: { id: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Map to the Conversation type that InboxClient expects
  const conversations: Conversation[] = rawConversations.map((c) => ({
    id: c.id,
    buyer_id: c.buyerId,
    seller_id: c.sellerId,
    solution_id: c.solutionId ?? undefined,
    order_id: c.orderId ?? undefined,
    created_at: c.createdAt.toISOString(),
    updated_at: c.updatedAt.toISOString(),
    buyer_name: c.buyer.email?.split("@")[0] || "Client",
    messages: c.messages.map((m): Message => ({
      id: m.id,
      conversation_id: c.id,
      sender_id: m.senderId,
      body: m.body,
      type: m.type as "user" | "system",
      created_at: m.createdAt.toISOString(),
    })),
    solution: c.solution
      ? {
          id: c.solution.id,
          slug: c.solution.slug,
          title: c.solution.title,
          description: "",
          category: "",
          implementation_price_cents: 0,
          implementation_price: 0,
          monthly_cost_min: 0,
          monthly_cost_max: 0,
          delivery_days: 0,
          integrations: [],
          status: "published" as const,
        }
      : undefined,
    order: c.order
      ? {
          id: c.order.id,
          buyer_id: c.buyerId,
          seller_id: c.sellerId,
          solution_id: c.solutionId || "",
          price_cents: 0,
          status: c.order.status as "draft" | "paid_pending_implementation" | "in_progress" | "delivered" | "approved" | "refunded" | "disputed",
          created_at: c.createdAt.toISOString(),
          updated_at: c.updatedAt.toISOString(),
        }
      : undefined,
    seller: {
      id: c.seller.id,
      user_id: c.seller.userId,
      slug: c.seller.slug ?? undefined,
      name: c.seller.displayName || "Expert",
      verified: true,
      founding: c.seller.isFoundingExpert ?? false,
      completed_sales_count: c.seller.completedSalesCount,
      tools: c.seller.tools,
    },
  }));

  return <InboxClient initialConversations={conversations} currentUserId={userId} />;
}
