import { notFound } from "next/navigation";
import { conversations, experts, solutions } from "@/data/mock";
import { ThreadView } from "@/components/ThreadView";

interface PageProps {
  params: {
    threadId: string;
  };
}

export const metadata = {
  title: "Conversation | AI Marketplace",
};

// Mock current user
const CURRENT_USER_ID = "user_1";

export default function ThreadPage({ params }: PageProps) {
  const conversation = conversations.find((c) => c.id === params.threadId);

  if (!conversation) {
    notFound();
  }

  // Resolve relationship (mock: assume we are buyer)
  const expert = experts.find(e => e.id === conversation.seller_id);
  const solution = solutions.find(s => s.id === conversation.solution_id);

  // Hydrate conversation with related data if needed
  const hydratedConversation = {
    ...conversation,
    solution: solution,
    seller: expert
  };

  const otherParty = {
    id: expert?.id || "unknown",
    name: expert?.name || "Unknown Expert",
    verified: expert?.verified
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <ThreadView 
          conversation={hydratedConversation} 
          currentUser={{ id: CURRENT_USER_ID }}
          otherParty={otherParty}
        />
      </div>
    </div>
  );
}
