import Link from "next/link";
import { conversations, experts, solutions } from "@/data/mock";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "Messages | AI Marketplace",
  description: "Your conversations with specialists.",
};

// Mock current user
const CURRENT_USER_ID = "user_1";

export default function MessagesPage() {
  const myConversations = conversations.filter(c => c.buyer_id === CURRENT_USER_ID);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {myConversations.length === 0 ? (
           <div className="p-12 text-center">
             <div className="bg-secondary/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <MessageSquare className="h-8 w-8 text-muted-foreground" />
             </div>
             <h2 className="text-lg font-semibold mb-2">No conversations yet</h2>
             <p className="text-muted-foreground mb-6">When you message a specialist, your conversation will appear here.</p>
             <Link href="/solutions" className="inline-flex items-center justify-center px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium">
               Browse Solutions
             </Link>
           </div>
        ) : (
          <div className="divide-y divide-border">
            {myConversations.map(conv => {
              // Resolve other party (simple mock logic: assume we are buyer)
              const expert = experts.find(e => e.id === conv.seller_id);
              const solution = solutions.find(s => s.id === conv.solution_id);
              const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="block p-4 hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold truncate pr-2 flex items-center gap-2">
                       {expert?.name || "Unknown Expert"}
                       {solution && <span className="text-xs font-normal text-muted-foreground">• {solution.title}</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {lastMsg ? (
                      <span className={lastMsg.sender_id === CURRENT_USER_ID ? "text-muted-foreground/70" : "text-foreground"}>
                        {lastMsg.sender_id === CURRENT_USER_ID && "You: "}
                        {lastMsg.body}
                      </span>
                    ) : (
                      "No messages"
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
