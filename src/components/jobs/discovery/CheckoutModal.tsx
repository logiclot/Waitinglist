"use client";

import { formatCentsToCurrency } from "@/lib/commission";
import {
  CUSTOM_PROJECT_PRICE_CENTS,
  DISCOVERY_SCAN_PRICE_CENTS,
} from "@/lib/pricing-config";
import { Check, Lightbulb, Loader2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CheckoutModalProps {
  jobId: string;
  type: "discovery" | "custom";
  hasFreeScans?: boolean;
  onClose: () => void;
}

export function CheckoutModal({
  jobId,
  type,
  onClose,
  hasFreeScans = false,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDiscovery = type === "discovery";
  const price = formatCentsToCurrency(
    isDiscovery ? DISCOVERY_SCAN_PRICE_CENTS : CUSTOM_PROJECT_PRICE_CENTS,
  );

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/post-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || "Checkout failed. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-4 right-4 p-2 -m-2 text-muted-foreground hover:text-foreground touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            {isDiscovery ? "Start Discovery Scan" : "Post Custom Project"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isDiscovery
              ? "Your business profile will be shared with Elite experts who will identify opportunities and propose solutions."
              : "Your brief will be published to Elite experts who will review it and send structured proposals."}
          </p>
        </div>
        <div
          className={`rounded-lg p-4 mb-6 border ${hasFreeScans ? "bg-emerald-500/5 border-emerald-500/20" : "bg-secondary/50 border-border"}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-foreground">
              {isDiscovery ? "Discovery Scan Fee" : "Project Posting Fee"}
            </span>
            {hasFreeScans ? (
              <span className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  {price}
                </span>
                <span className="font-bold text-xl text-emerald-600">FREE</span>
              </span>
            ) : (
              <span className="font-bold text-xl text-foreground">
                {price} one-time
              </span>
            )}
          </div>
          {hasFreeScans ? (
            <div className="text-xs text-emerald-600 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Your waitlist credit covers this.
              Click below to go live instantly.
            </div>
          ) : isDiscovery ? (
            <div className="text-xs text-emerald-600 flex items-center gap-1.5">
              <Check className="w-3 h-3" /> Fee credited toward your first build
              when you proceed
            </div>
          ) : null}
        </div>
        <div className="space-y-3 mb-6 text-sm text-muted-foreground">
          {isDiscovery ? (
            <>
              <div className="flex gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Get up to 5 high-quality expert proposals</span>
              </div>
              <div className="flex gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Experts identify your best automation opportunities</span>
              </div>
              <div className="flex gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Posting fee credited toward your first project</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Up to 3 structured proposals from Elite experts</span>
              </div>
              <div className="flex gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Each proposal includes scope, phases, and exact pricing
                </span>
              </div>
              <div className="flex gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Accept one — project starts immediately with milestones
                </span>
              </div>
            </>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3 mb-4 text-center">
            {error}
          </p>
        )}
        {hasFreeScans ? (
          <Link
            href={`/jobs/${jobId}`}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
          >
            <Sparkles className="w-5 h-5" /> View Job
          </Link>
        ) : (
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Redirecting to
                payment…
              </>
            ) : (
              `Pay ${price} & Go Live`
            )}
          </button>
        )}
        <p className="text-xs text-center text-muted-foreground mt-4">
          {hasFreeScans
            ? "No payment required. Your waitlist credit will be applied."
            : "Secure payment via Stripe. One-time fee."}
        </p>
        <p className="text-[10px] text-center text-muted-foreground/80 mt-2">
          By paying you agree to our{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
