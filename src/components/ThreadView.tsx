"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Calendar,
  X,
  Lock,
  Video,
  ExternalLink,
  CheckCircle2,
  FileText,
  MessageSquare,
  Send,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Conversation, Message } from "@/types";
import { scheduleMeeting, sendMessage } from "@/actions/messaging";
import { acceptOrder } from "@/actions/orders";
import { BidCardMessage } from "@/components/messages/BidCardMessage";
import { OrderCardMessage } from "@/components/messages/OrderCardMessage";
import { MilestoneTimeline } from "@/components/projects/MilestoneTimeline";
// formatCentsToCurrency available from @/lib/commission if needed

interface OrderContextProps {
  orderId: string;
  projectTitle: string;
  totalCents: number;
  status: string;
  milestones: { title: string; priceCents: number; status: string }[];
}

interface ThreadViewProps {
  conversation: Conversation;
  currentUser: { id: string; name?: string; image?: string | null };
  otherParty: {
    name: string;
    verified?: boolean;
    id: string;
    image?: string | null;
  };
  /** When business views: expert's calendar URL for booking */
  expertCalendarUrl?: string;
  /** When expert views: their calendar URL to send to business */
  meetLinkUrl?: string;
  /** Is current user the buyer? */
  isBuyer?: boolean;
  /** Order context for showing project status */
  orderContext?: OrderContextProps;
}

export function ThreadView({
  conversation,
  currentUser,
  otherParty,
  expertCalendarUrl,
  meetLinkUrl,
  isBuyer,
  orderContext,
}: ThreadViewProps) {
  const [messages, setMessages] = useState<Message[]>(
    conversation.messages || [],
  );
  const [newMessage, setNewMessage] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [showCalendarEmbed, setShowCalendarEmbed] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [sendingMeetLink, setSendingMeetLink] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
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

    const res = await sendMessage(conversation.id, msg.body);
    if (!res.success) {
      alert("Failed to send message");
    }
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

  const handleSendMeetLink = async () => {
    if (!meetLinkUrl?.trim()) return;
    setSendingMeetLink(true);
    const body = `Here's my calendar to book a call: ${meetLinkUrl}`;
    const msg: Message = {
      id: Date.now().toString(),
      conversation_id: conversation.id,
      sender_id: currentUser.id,
      body,
      type: "user",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    const res = await sendMessage(conversation.id, body);
    setSendingMeetLink(false);
    if (!res.success) alert("Failed to send");
  };

  const handleAcceptOrder = async () => {
    if (!orderContext) return;
    setAcceptLoading(true);
    const res = await acceptOrder(orderContext.orderId);
    setAcceptLoading(false);
    if ("error" in res) {
      alert(res.error);
    } else {
      // Add a system message showing acceptance
      const msg: Message = {
        id: Date.now().toString(),
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        body: `${currentUser.name || "Expert"} has accepted the order and started working on your project.`,
        type: "system",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
    }
  };

  // Check if this is a fresh thread (no user messages yet) with an active order
  const hasUserMessages = messages.some((m) => m.type === "user");
  const showWelcomeBanner = isBuyer && orderContext && !hasUserMessages;
  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm relative">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-border bg-secondary/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={
              isBuyer ? "/business/projects" : "/dashboard/messages"
            }
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Avatar
            src={otherParty.image}
            name={otherParty.name}
            size="sm"
            className="shrink-0"
          />
          <div>
            <h2 className="font-bold text-sm flex items-center gap-1.5">
              {otherParty.name}
              {otherParty.verified && (
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              )}
            </h2>
            {conversation.solution && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {conversation.solution.title}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Book a call (buyer only, when expert has calendar) */}
          {expertCalendarUrl && (
            <>
              <a
                href={expertCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="md:hidden inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" /> Book a call
              </a>
              <button
                onClick={() => setShowCalendarEmbed(!showCalendarEmbed)}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" /> Book a call
              </button>
            </>
          )}

          {/* Schedule Session (when no calendar URL — fallback) */}
          {!expertCalendarUrl && isBuyer && (
            <button
              onClick={() => setShowScheduler(true)}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" /> Schedule a call
            </button>
          )}

          {/* View invoice */}
          {orderContext && (
            <Link
              href={`/invoice/${orderContext.orderId}`}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Invoice
            </Link>
          )}

          {/* View solution */}
          {conversation.solution && !orderContext && (
            <Link
              href={`/solutions/${conversation.solution.slug}`}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              View Solution
            </Link>
          )}
        </div>
      </div>

      {/* ── Order Context Banner (for buyers with active orders) ── */}
      {orderContext && isBuyer && (
        <div className="border-b border-border bg-emerald-50/50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-emerald-900">
                Thank you for your order!
              </h3>
              <p className="text-xs text-emerald-800/70 mt-1 leading-relaxed">
                Your payment is secured in escrow.{" "}
                <strong>{otherParty.name}</strong> will review and accept your
                order within 24-48 hours. In the meantime, feel free to send a
                message or book a call directly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Milestone Timeline (for both buyer and expert when order exists) ── */}
      {orderContext && (
        <div className="border-b border-border px-5 py-4 bg-secondary/5">
          <MilestoneTimeline
            milestones={orderContext.milestones}
            orderStatus={orderContext.status}
            projectTitle={orderContext.projectTitle}
            isBuyer={!!isBuyer}
            orderId={orderContext.orderId}
            onAcceptOrder={!isBuyer ? handleAcceptOrder : undefined}
            acceptLoading={acceptLoading}
          />
        </div>
      )}

      {/* ── Main: messages + calendar sidebar ── */}
      <div className="flex flex-1 min-h-0">
        {/* Message area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-5 space-y-4"
            ref={scrollRef}
            style={{ minHeight: "350px", maxHeight: "calc(100vh - 360px)" }}
          >
            {/* Welcome state for empty threads */}
            {showWelcomeBanner && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-base text-foreground mb-1">
                  Start the conversation
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Introduce yourself and share any details that will help{" "}
                  <strong>{otherParty.name}</strong> get started on your project
                  right away.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {expertCalendarUrl ? (
                    <>
                      <a
                        href={expertCalendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="md:hidden inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book a call
                      </a>
                      <button
                        onClick={() => setShowCalendarEmbed(true)}
                        className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book a call
                      </button>
                    </>
                  ) : isBuyer ? (
                    <button
                      onClick={() => setShowScheduler(true)}
                      className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule a call
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {/* Empty state for non-order threads */}
            {messages.length === 0 && !showWelcomeBanner && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 py-12">
                <User className="h-12 w-12 mb-2" />
                <p>No messages yet</p>
              </div>
            )}

            {messages.map((msg) =>
              msg.type === "system" ? (
                <div key={msg.id} className="flex justify-center my-4">
                  <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border max-w-md text-center">
                    {msg.body}
                  </span>
                </div>
              ) : msg.type === "bid_card" ? (
                <div key={msg.id} className="flex justify-start my-4">
                  <BidCardMessage body={msg.body} />
                </div>
              ) : msg.type === "order_card" ? (
                <div key={msg.id} className="flex justify-center my-4">
                  <OrderCardMessage body={msg.body} />
                </div>
              ) : (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.sender_id === currentUser.id
                      ? "justify-end flex-row-reverse"
                      : "justify-start"
                  }`}
                >
                  <Avatar
                    src={
                      msg.sender_id === currentUser.id
                        ? currentUser.image
                        : otherParty.image
                    }
                    name={
                      msg.sender_id === currentUser.id
                        ? currentUser.name || "You"
                        : otherParty.name
                    }
                    size="sm"
                    className="shrink-0"
                  />
                  <div
                    className={`max-w-[80%] md:max-w-[70%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender_id === currentUser.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground border border-border"
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              ),
            )}
          </div>

          {/* ── Composer ── */}
          <div className="px-5 py-4 border-t border-border bg-background shrink-0">
            {/* Expert: send meeting link shortcut */}
            {meetLinkUrl && (
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleSendMeetLink}
                  disabled={sendingMeetLink}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  <Video className="w-3.5 h-3.5" />
                  {sendingMeetLink
                    ? "Sending..."
                    : "Send my meeting link"}
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Write a message..."
                className="flex-1 bg-secondary/20 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Calendar Embed Sidebar ── */}
        {expertCalendarUrl && showCalendarEmbed && (
          <div className="hidden md:flex flex-col w-96 border-l border-border shrink-0 bg-background">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Book a call with {otherParty.name}
              </span>
              <button
                onClick={() => setShowCalendarEmbed(false)}
                className="p-1 rounded hover:bg-secondary text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <iframe
                src={expertCalendarUrl}
                title={`${otherParty.name}'s availability`}
                className="w-full h-full min-h-[400px] border-0"
              />
            </div>
            <div className="p-2 border-t border-border">
              <a
                href={expertCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-primary hover:text-primary/80 font-medium py-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in new tab
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Scheduler Modal ── */}
      {showScheduler && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setShowScheduler(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Schedule a Call</h3>
              <p className="text-sm text-muted-foreground">
                Pick a time and we&apos;ll generate a meeting link
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-2 text-xs text-blue-700">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  This session is covered by the LogicLot Mutual NDA.
                </span>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block">
                  Select Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <button
                onClick={handleSchedule}
                disabled={!meetingDate || scheduling}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
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
