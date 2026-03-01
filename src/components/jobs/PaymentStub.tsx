"use client";

import { useState, useEffect } from "react";
import { Loader2, Lock, Zap } from "lucide-react";

interface PaymentStubProps {
  jobId: string;
  category?: string;
}

export function PaymentStub({ jobId, category }: PaymentStubProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSimulate, setShowSimulate] = useState(false);

  const isDiscovery = category === "Discovery" || category === "Discovery Scan";
  const price = isDiscovery ? "€50" : "€100";

  useEffect(() => {
    fetch("/api/checkout/post-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    })
      .then(r => r.json())
      .then(d => { if (d.useSimulate) setShowSimulate(true); })
      .catch(() => {});
  }, [jobId]);

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
      if (data.useSimulate) {
        setShowSimulate(true);
        setLoading(false);
        return;
      }
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

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/simulate-payment`, { method: "POST" });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setError(data.error || "Simulate failed.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-8 text-center space-y-6">
      <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
        <Lock className="h-6 w-6" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Complete payment to go live</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isDiscovery
            ? "A one-time €50 fee to receive up to 5 expert proposals. Credited toward your first build when you proceed."
            : "A one-time €100 posting fee that ensures you receive proposals only from verified Elite experts."}
        </p>
      </div>

      <div className="bg-secondary/50 p-4 rounded-xl text-sm font-medium">
        Total due: <span className="text-lg font-bold ml-2">{price}</span>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {showSimulate ? (
        <button
          onClick={handleSimulate}
          disabled={loading}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Activating…</>
          ) : (
            <><Zap className="h-4 w-4" /> Simulate payment (dev only)</>
          )}
        </button>
      ) : (
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to payment…</>
          ) : (
            `Pay ${price} & Go Live`
          )}
        </button>
      )}

      <p className="text-xs text-muted-foreground">
        Secure payment via Stripe.
      </p>
      <p className="text-[10px] text-muted-foreground/80 mt-1">
        By paying you agree to our <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Terms</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Privacy Policy</a>.
      </p>
    </div>
  );
}
