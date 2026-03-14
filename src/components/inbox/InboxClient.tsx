"use client";

import { useState, useEffect, useRef } from "react";
import { Conversation, Message } from "@/types";
import { Send, User, ShieldCheck, Search, Video } from "lucide-react";
import Link from "next/link";
import { sendMessage } from "@/actions/messaging";
import { BidCardMessage } from "@/components/messages/BidCardMessage";
import { OrderCardMessage } from "@/components/messages/OrderCardMessage";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";

interface InboxClientProps {
  initialConversations: Conversation[];
  currentUserId: string;
}

export function InboxClient({ initialConversations, currentUserId }: InboxClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversations[0]?.id || null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [buyingDemo, setBuyingDemo] = useState(false);
  const [sendingMeetLink, setSendingMeetLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeConversation = conversations.find(c => c.id === selectedId);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation, conversations]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversation || isSending) return;

    setIsSending(true);
    const tempId = Math.random().toString(36).substr(2, 9);
    const msgBody = newMessage;
    
    // Optimistic update
    const optimisticMsg: Message = {
      id: tempId,
      conversation_id: activeConversation.id,
      sender_id: currentUserId,
      body: msgBody,
      type: "user",
      created_at: new Date().toISOString()
    };

    const updatedConv = {
      ...activeConversation,
      messages: [...(activeConversation.messages || []), optimisticMsg]
    };

    setConversations(prev => prev.map(c => c.id === activeConversation.id ? updatedConv : c));
    setNewMessage("");

    // Server Action
    const result = await sendMessage(activeConversation.id, msgBody);
    
    if (!result.success) {
      // Revert on failure (simplified for now, ideally show error toast)
      Sentry.captureMessage("Failed to send message", "error");
      toast.error("Failed to send message");
    } else {
      router.refresh(); // Re-fetch to get real ID and any system updates
    }
    setIsSending(false);
  };

  const handleSendMeetLink = async () => {
    if (!activeConversation || !expertCalendarUrl || isSending) return;
    setSendingMeetLink(true);
    const body = `Here's my calendar to book a call: ${expertCalendarUrl}`;
    const optimisticMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      conversation_id: activeConversation.id,
      sender_id: currentUserId,
      body,
      type: "user",
      created_at: new Date().toISOString(),
    };
    const updatedConv = {
      ...activeConversation,
      messages: [...(activeConversation.messages || []), optimisticMsg],
    };
    setConversations(prev => prev.map(c => c.id === activeConversation.id ? updatedConv : c));
    const result = await sendMessage(activeConversation.id, body);
    setSendingMeetLink(false);
    if (!result.success) {
      toast.error("Failed to send link");
      router.refresh();
    } else {
      router.refresh();
    }
  };

  const handleBookDemo = async () => {
    if (!activeConversation?.solution_id) return;
    setBuyingDemo(true);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          solutionId: activeConversation.solution_id,
          type: "demo_booking"
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Checkout failed");
      }
    } catch (error) {
      Sentry.captureException(error, { tags: { context: "inbox-message" } });
      toast.error("Something went wrong");
    } finally {
      setBuyingDemo(false);
    }
  };

  // Helper to get other party name
  const getOtherPartyName = (conv: Conversation) => {
    if (conv.seller?.user_id === currentUserId) {
      // We are the seller — use the resolved buyer name from the server
      return conv.buyer_name || "Client";
    }
    // We are the buyer — show seller/expert name
    return conv.seller?.name || "Expert";
  };

  // Filtered conversations based on search query
  const filteredConversations = searchQuery.trim()
    ? conversations.filter((conv) => {
        const q = searchQuery.toLowerCase();
        const otherName = getOtherPartyName(conv).toLowerCase();
        const solutionTitle = (conv.solution?.title || "").toLowerCase();
        const lastMsg = (conv.messages?.[conv.messages.length - 1]?.body || "").toLowerCase();
        return otherName.includes(q) || solutionTitle.includes(q) || lastMsg.includes(q);
      })
    : conversations;

  const isBuyer = activeConversation ? currentUserId === activeConversation.buyer_id : false;
  const expertCalendarUrl = activeConversation?.seller ? (activeConversation.seller as unknown as { calendarUrl?: string }).calendarUrl : null;
  const demoPriceCents = (activeConversation?.solution as unknown as { demoPriceCents?: number })?.demoPriceCents || 200;

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inbox</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-60px)]">
        {/* Conversation List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-border bg-secondary/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                <User className="h-8 w-8 opacity-20" />
                {searchQuery ? "No results found." : "No messages yet."}
              </div>
            ) : (
              filteredConversations.map(conv => {
                const otherPartyName = getOtherPartyName(conv);
                const lastMsg = conv.messages?.[conv.messages.length - 1];
                const isSelected = selectedId === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left p-4 border-b border-border/50 hover:bg-secondary/20 transition-all ${
                      isSelected ? "bg-secondary/30 border-l-4 border-l-primary pl-[12px]" : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-semibold text-sm truncate pr-2 ${isSelected ? "text-primary" : "text-foreground"}`}>
                         {otherPartyName}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(conv.updated_at || conv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate font-medium mb-1">
                      {conv.solution?.title || (conv.job_post_id ? "Project Proposal" : "General Inquiry")}
                    </div>
                    <div className="text-xs text-muted-foreground truncate opacity-70">
                      {lastMsg?.sender_id === currentUserId ? "You: " : ""}{lastMsg?.type === 'bid_card' ? "Sent a proposal" : lastMsg?.type === 'order_card' ? "Order update" : (lastMsg?.body || "No messages")}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm relative">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between shrink-0">
                <div>
                   <h2 className="font-bold flex items-center gap-2">
                     {getOtherPartyName(activeConversation)}
                     {activeConversation.seller?.verified && <ShieldCheck className="h-4 w-4 text-blue-400" />}
                   </h2>
                   {activeConversation.solution && (
                     <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                       Regarding: <span className="font-medium text-foreground">{activeConversation.solution.title}</span>
                     </div>
                   )}
                </div>
                <div className="flex gap-2">
                  {/* Demo/Call Button */}
                  {isBuyer && expertCalendarUrl && activeConversation.solution_id && (
                    <button
                      onClick={handleBookDemo}
                      disabled={buyingDemo}
                      className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5 font-bold disabled:opacity-70"
                    >
                      <Video className="w-3.5 h-3.5" />
                      {buyingDemo ? "..." : `Book Demo (€${(demoPriceCents / 100).toFixed(2)})`}
                    </button>
                  )}
                  {activeConversation.solution && (
                    <Link 
                      href={`/solutions/${activeConversation.solution.slug}`}
                      className="text-xs border border-border bg-background px-3 py-1.5 rounded-md hover:bg-secondary transition-colors"
                    >
                      View Solution
                    </Link>
                  )}
                  {activeConversation.order && (
                    <Link 
                      href={`/business/projects`}
                      className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors"
                    >
                      View Project
                    </Link>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5" ref={scrollRef}>
                {activeConversation.messages?.map((msg) => (
                   msg.type === 'system' ? (
                     <div key={msg.id} className="flex justify-center my-4">
                       <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border">
                         {msg.body}
                       </span>
                     </div>
                   ) : msg.type === 'bid_card' ? (
                     <div key={msg.id} className="flex flex-col items-start my-4">
                       <BidCardMessage body={msg.body} />
                       <span className="text-[10px] text-muted-foreground mt-1 px-1">
                         {new Date(msg.created_at).toLocaleString('en-US', {
                           weekday: 'short',
                           hour: 'numeric',
                           minute: 'numeric',
                           hour12: true,
                         })}
                       </span>
                     </div>
                   ) : msg.type === 'order_card' ? (
                     <div key={msg.id} className="flex justify-center my-4">
                       <OrderCardMessage body={msg.body} />
                     </div>
                   ) : (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender_id === currentUserId ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        msg.sender_id === currentUserId
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-white dark:bg-secondary border border-border rounded-bl-none'
                      }`}>
                        {msg.body}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {new Date(msg.created_at).toLocaleString('en-US', {
                          weekday: 'short',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })}
                      </span>
                    </div>
                   )
                ))}
              </div>

              {/* Composer */}
              <div className="p-4 border-t border-border bg-background">
                {/* Expert-only: Send meeting/call link to buyer */}
                {!isBuyer && expertCalendarUrl && (
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={handleSendMeetLink}
                      disabled={sendingMeetLink}
                      className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-md hover:bg-emerald-500/20 transition-colors font-medium disabled:opacity-50"
                    >
                      <Video className="w-3.5 h-3.5" />
                      {sendingMeetLink ? "Sending..." : "Send my meeting link"}
                    </button>
                  </div>
                )}
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    disabled={isSending}
                    className="flex-1 bg-secondary/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={isSending || !newMessage.trim()}
                    className="bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground">
                  Keep communication here for faster support and order protection.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-secondary/5">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 opacity-40" />
              </div>
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm opacity-70">Choose a thread from the left to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
