"use client";

import { useFormState } from "react-dom";
import { submitBid } from "@/actions/jobs";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function BidForm({ jobId }: { jobId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction] = useFormState(submitBid as any, null);
  const [pending, setPending] = useState(false);

  if (state?.success) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center">
        <h3 className="text-green-500 font-bold mb-2">Bid Submitted!</h3>
        <p className="text-sm text-green-500/80">The buyer has been notified of your proposal.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-bold text-lg mb-4">Submit a Proposal</h3>
      <form action={(formData) => { setPending(true); (formAction as unknown as (formData: FormData) => void)(formData); }} className="space-y-4">
        <input type="hidden" name="jobId" value={jobId} />
        
        <div>
          <label className="block text-sm font-medium mb-1">Message to Buyer</label>
          <textarea 
            name="message"
            required
            rows={4}
            className="w-full bg-background border border-border rounded-md px-3 py-2"
            placeholder="Explain why you're a good fit..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Time Estimate</label>
            <select name="estimatedTime" required className="w-full bg-background border border-border rounded-md px-3 py-2">
              <option value="">Select...</option>
              <option value="Same day">Same day</option>
              <option value="1–3 days">1–3 days</option>
              <option value="4–7 days">4–7 days</option>
              <option value="1–2 weeks">1–2 weeks</option>
              <option value="2+ weeks">2+ weeks</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price Estimate (Optional)</label>
            <input 
              name="priceEstimate"
              className="w-full bg-background border border-border rounded-md px-3 py-2"
              placeholder="e.g. $1,200–$1,500"
            />
          </div>
        </div>

        {state?.error && (
          <div className="text-red-500 text-sm">{state.error}</div>
        )}

        <button 
          type="submit" 
          disabled={pending}
          className="w-full py-2 bg-primary text-primary-foreground rounded-md font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Proposal"}
        </button>
      </form>
    </div>
  );
}
