"use client";

import { markJobAsPaid } from "@/actions/jobs";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export function PaymentStub({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    setLoading(true);
    // Simulate delay
    await new Promise(r => setTimeout(r, 1500));
    
    const res = await markJobAsPaid(jobId);
    if (res.success) {
      router.refresh();
    } else {
      alert("Payment failed");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-8 text-center space-y-6">
      <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
        <Lock className="h-6 w-6" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Job post fee</h2>
        <p className="text-muted-foreground">
          Posting a job costs $100. This keeps requests high-quality and limits spam. You’ll receive proposals from Elite specialists.
        </p>
      </div>

      <div className="bg-secondary/50 p-4 rounded-md text-sm font-medium">
        Total due: <span className="text-lg font-bold ml-2">$100.00</span>
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-3 bg-primary text-primary-foreground rounded-md font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing...
          </>
        ) : (
          "Pay $100 and publish"
        )}
      </button>
      
      <p className="text-xs text-muted-foreground">
        Secure payment via Stripe (Simulated in V1)
      </p>
    </div>
  );
}
