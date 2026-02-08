"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";

export default function WaitlistPage() {
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
    } catch (error: any) {
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500">
        <div className="text-center max-w-md">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">You&apos;re in.</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {successMessage}
          </p>
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
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">{BRAND_NAME}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Join the {BRAND_NAME} waitlist</h1>
          <p className="text-lg text-muted-foreground mb-6">
            We&apos;re opening early access soon. Leave your email — we&apos;ll notify you first.
          </p>
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

        <div className="text-center mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </div>
    </div>
  );
}
