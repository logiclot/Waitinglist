"use client";

import { useState } from "react";
import { conversations as initialConversations } from "@/data/mock";
import { Conversation, Message } from "@/types";
import { Send, User, ShieldCheck } from "lucide-react";
import Link from "next/link";

// Mock user
const CURRENT_USER_ID = "user_1";

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversations[0]?.id || null);
  const [newMessage, setNewMessage] = useState("");

  const activeConversation = conversations.find(c => c.id === selectedId);

  const handleSend = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      conversation_id: activeConversation.id,
      sender_id: CURRENT_USER_ID,
      body: newMessage,
      type: "user",
      created_at: new Date().toISOString()
    };

    const updatedConv = {
      ...activeConversation,
      messages: [...(activeConversation.messages || []), msg]
    };

    setConversations(conversations.map(c => c.id === activeConversation.id ? updatedConv : c));
    setNewMessage("");
  };

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
      <h1 className="text-2xl font-bold mb-6">Inbox</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-60px)]">
        {/* Conversation List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-secondary/10">
            <h2 className="font-semibold">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No messages yet.
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left p-4 border-b border-border/50 hover:bg-secondary/20 transition-colors ${
                    selectedId === conv.id ? "bg-secondary/30 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm truncate pr-2">
                       {/* In real app, resolve name based on OTHER party */}
                       AI Automations Agency
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {conv.solution?.title || "General Inquiry"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate opacity-70">
                    {conv.messages?.[conv.messages.length - 1]?.body || "No messages"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                <div>
                   <h2 className="font-bold flex items-center gap-2">
                     AI Automations Agency
                     <ShieldCheck className="h-3 w-3 text-blue-400" />
                   </h2>
                   {activeConversation.order && (
                     <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                       Order #{activeConversation.order.id.substring(0,6)} • {activeConversation.solution?.title}
                     </div>
                   )}
                </div>
                {activeConversation.order && (
                  <Link 
                    href={`/orders/${activeConversation.order.id}`}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors"
                  >
                    View Order
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation.messages?.map((msg) => (
                   msg.type === 'system' ? (
                     <div key={msg.id} className="flex justify-center my-4">
                       <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border">
                         {msg.body}
                       </span>
                     </div>
                   ) : (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.sender_id === CURRENT_USER_ID ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-xl px-4 py-3 text-sm ${
                        msg.sender_id === CURRENT_USER_ID 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground border border-border'
                      }`}>
                        {msg.body}
                      </div>
                    </div>
                   )
                ))}
              </div>

              {/* Composer */}
              <div className="p-4 border-t border-border bg-background">
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-secondary/20 border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button 
                    onClick={handleSend}
                    className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors"
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
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <User className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
