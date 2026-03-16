"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, ClipboardList, ArrowRight } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";
import { LogoBrand } from "@/components/LogoBrand";
import { LogoMark } from "@/components/LogoMark";

// ---------------------------------------------------------------------------
// Countdown hook — ticks every second until launch date
// ---------------------------------------------------------------------------
const LAUNCH_DATE = new Date("2026-04-08T00:00:00Z");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      done: diff === 0,
    };
  };
  // Start null to avoid SSR hydration mismatch (server vs client time differ)
  const [time, setTime] = useState<ReturnType<typeof calc> | null>(null);
  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return time;
}

export default function WaitlistPage() {
  const countdown = useCountdown(LAUNCH_DATE);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"business" | "expert" | "">("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setErrorMessage("Please select a role.");
      return;
    }
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, role, honeypot }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.status === "existing") {
        setSuccessMessage("You're already on the list!");
      } else {
        setSuccessMessage("We'll email you when early access opens.");
      }
      setStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500">
        <div className="text-center max-w-md">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <LogoMark size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">You&apos;re in.</h1>
          <p className="text-xl text-muted-foreground mb-4">
            {successMessage}
          </p>

          {/* Countdown on success */}
          {countdown && !countdown.done && (
            <div className="mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">Launching in</p>
              <div className="flex items-center justify-center gap-3">
                {[
                  { v: countdown.days, l: "days" },
                  { v: countdown.hours, l: "hrs" },
                  { v: countdown.minutes, l: "min" },
                  { v: countdown.seconds, l: "sec" },
                ].map(({ v, l }) => (
                  <div key={l} className="text-center">
                    <span className="text-2xl font-black text-primary tabular-nums">{String(v).padStart(2, "0")}</span>
                    <p className="text-[10px] text-muted-foreground uppercase">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Free audit nudge */}
          <div className="bg-secondary/40 border border-border rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-foreground mb-1">While you wait...</p>
            <p className="text-xs text-muted-foreground mb-3">
              Take a free 2-minute automation audit. Find out exactly where your business is losing time and money.
            </p>
            <Link
              href="/free-audit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              Take the Free Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-sm text-muted-foreground/60">
            No spam. Unsubscribe anytime.
          </p>
        </div>
        <div className="fixed bottom-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND_NAME}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <LogoBrand size="lg" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Join the {BRAND_NAME} waitlist</h1>
          <p className="text-lg text-muted-foreground mb-2">
            We launch on <span className="font-semibold text-foreground">April 8th</span>. Leave your email — we&apos;ll notify you first.
          </p>

          {/* Countdown */}
          {countdown && !countdown.done && (
            <div className="flex items-center justify-center gap-4 mt-4 mb-2">
              {[
                { v: countdown.days, l: "days" },
                { v: countdown.hours, l: "hrs" },
                { v: countdown.minutes, l: "min" },
                { v: countdown.seconds, l: "sec" },
              ].map(({ v, l }) => (
                <div key={l} className="text-center">
                  <span className="text-3xl font-black text-primary tabular-nums">{String(v).padStart(2, "0")}</span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{l}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border p-6 rounded-xl shadow-sm">
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">Full Name <span className="text-primary">*</span></label>
            <input
              id="fullName"
              type="text"
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email Address <span className="text-primary">*</span></label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">I am a... <span className="text-primary">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`py-2 px-4 rounded-md border text-sm font-medium transition-all ${
                  role === "business"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-secondary"
                }`}
                onClick={() => setRole("business")}
              >
                Business
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-md border text-sm font-medium transition-all ${
                  role === "expert"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-secondary"
                }`}
                onClick={() => setRole("expert")}
              >
                Expert
              </button>
            </div>
          </div>

          {/* Honeypot */}
          <input
            type="text"
            name="website"
            className="hidden"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-md hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Join waitlist"
            )}
          </button>
        </form>

        {/* Free audit nudge */}
        <div className="mt-6 bg-secondary/40 border border-border rounded-xl p-5 text-center">
          <p className="text-sm font-semibold text-foreground mb-1">
            Not ready to sign up yet?
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Take a free 2-minute automation audit. Find out where your business is losing time — no account needed.
          </p>
          <Link
            href="/free-audit"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            Take the Free Audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="text-center mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </div>
    </div>
  );
}
