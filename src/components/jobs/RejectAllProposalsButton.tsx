"use client";

import { useState } from "react";
import { rejectAllBidsAndRefund } from "@/actions/jobs";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2, X } from "lucide-react";

interface RejectAllProposalsButtonProps {
  jobId: string;
}

export function RejectAllProposalsButton({ jobId }: RejectAllProposalsButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (feedback.trim().length < 20) {
      toast.error("Please provide at least 20 characters of feedback.");
      return;
    }

    if (!confirm("Are you sure? This will reject all proposals and issue a 75% refund (€75.00). This action cannot be undone.")) {
      return;
    }

    setSubmitting(true);
    const res = await rejectAllBidsAndRefund(jobId, feedback);
    setSubmitting(false);

    if (res.success) {
      setDone(true);
      toast.success("All proposals rejected. Your refund is being processed.");
    } else {
      toast.error(res.error ?? "Something went wrong.");
    }
  };

  if (done) {
    return (
      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Project closed — refund initiated</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            A refund of €75.00 will appear on your statement in 5–10 business days.
          </p>
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
        >
          Not satisfied? Reject all &amp; get 75% refund
        </button>
      </div>
    );
  }

  return (
    <div className="border border-destructive/20 bg-destructive/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-destructive/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-semibold text-foreground">Reject all proposals</span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          If none of the proposals meet your needs, you can close this project and receive a <strong className="text-foreground">75% refund (€75.00)</strong>.
          All experts will be notified. Please tell us what you expected — this helps us improve expert quality.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            What did you expect that wasn&apos;t covered? <span className="text-destructive">*</span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. I needed a solution focused on X, but all proposals were about Y..."
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-destructive/50 focus:border-destructive/50 outline-none transition resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {feedback.trim().length < 20
              ? `${20 - feedback.trim().length} more character${20 - feedback.trim().length === 1 ? "" : "s"} needed`
              : "Ready to submit"}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || feedback.trim().length < 20}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              "Reject all & refund €75"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
