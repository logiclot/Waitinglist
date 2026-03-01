"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

interface PaymentButtonProps {
  solutionId: string;
  title?: string;
  isUpgrade?: boolean;
  upgradePriceCents?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PaymentButton({ solutionId, title = "Buy Now", isUpgrade, upgradePriceCents }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solutionId, isUpgrade }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (error) {
      Sentry.captureException(error, { tags: { context: "payment-button" } });
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="block w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-bold text-lg transition-colors shadow-md shadow-primary/20 flex items-center justify-center gap-2"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : title}
    </button>
  );
}
