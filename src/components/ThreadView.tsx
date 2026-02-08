"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, User, Calendar, X, Lock } from "lucide-react";
import { Conversation, Message } from "@/types";
import { scheduleMeeting } from "@/actions/messaging";

interface ThreadViewProps {
  conversation: Conversation;
  currentUser: { id: string };
  otherParty: { name: string; verified?: boolean; id: string };
}

export function ThreadView({ conversation, currentUser, otherParty }: ThreadViewProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [newMessage, setNewMessage] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      conversation_id: conversation.id,
      sender_id: currentUser.id,
      body: newMessage,
      type: "user",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    
    // In a real app, you would POST to API here
  };

  const handleSchedule = async () => {
    if (!meetingDate) return;
    setScheduling(true);
    const res = await scheduleMeeting(conversation.id, meetingDate);
    setScheduling(false);
    
    if (res?.success) {
      setShowScheduler(false);
      setMeetingDate("");
      
      const msg: Message = {
        id: Date.now().toString(),
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        body: res.messageBody,
        type: "system",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
    } else {
        alert("Failed to schedule");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-h-[800px] bg-card border border-border rounded-xl overflow-hidden shadow-sm relative">
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="md:hidden text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="font-bold flex items-center gap-2">
              {otherParty.name}
              {otherParty.verified && <ShieldCheck className="h-4 w-4 text-blue-400" />}
            </h2>
            {conversation.solution && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                 Regarding: <span className="font-medium text-foreground">{conversation.solution.title}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => setShowScheduler(true)}
                className="hidden md:flex items-center gap-2 text-xs bg-[#FF8C00]/10 text-[#FF8C00] border border-[#FF8C00]/20 px-3 py-1.5 rounded-md hover:bg-[#FF8C00]/20 transition-colors font-medium"
            >
                <Calendar className="w-3.5 h-3.5" /> Schedule Session
            </button>
            {conversation.solution && (
            <Link 
                href={`/solutions/${conversation.solution.slug}`}
                className="hidden md:block text-xs bg-secondary hover:bg-secondary/80 border border-border px-3 py-1.5 rounded-md transition-colors"
            >
                View Solution
            </Link>
            )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
             <User className="h-12 w-12 mb-2" />
             <p>No messages yet</p>
           </div>
        )}
        
        {messages.map((msg) => (
           msg.type === 'system' ? (
             <div key={msg.id} className="flex justify-center my-4">
               <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border">
                 {msg.body}
               </span>
             </div>
           ) : (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] md:max-w-[70%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender_id === currentUser.id 
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
      <div className="p-4 border-t border-border bg-background shrink-0">
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write a message..."
            className="flex-1 bg-secondary/20 border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-primary text-primary-foreground px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
          >
            Send
          </button>
        </div>
      </div>

      {/* Scheduler Modal */}
      {showScheduler && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl relative">
              <button onClick={() => setShowScheduler(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              
              <div className="text-center mb-6">
                 <div className="bg-[#FF8C00]/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#FF8C00]/20">
                    <Calendar className="w-6 h-6 text-[#FF8C00]" />
                 </div>
                 <h3 className="font-bold text-lg">Schedule Session</h3>
                 <p className="text-sm text-muted-foreground">Sync with Google Calendar</p>
              </div>

              <div className="space-y-4">
                 <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center gap-2 text-xs text-blue-300">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Meeting protected by LogicLot Mutual NDA.</span>
                 </div>

                 <div>
                    <label className="text-xs font-medium mb-1.5 block">Select Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-sm focus:border-[#FF8C00] transition-colors [color-scheme:dark]"
                    />
                 </div>

                 <button
                   onClick={handleSchedule}
                   disabled={!meetingDate || scheduling}
                   className="w-full py-2.5 bg-[#FF8C00] text-white rounded-md font-bold hover:bg-[#E67E00] transition-colors disabled:opacity-50"
                 >
                   {scheduling ? "Booking..." : "Confirm & Send Link"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
