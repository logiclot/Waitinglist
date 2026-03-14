"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { acceptRevision, denyRevision } from "@/actions/orders";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ExpertRevisionActionsProps {
  orderId: string;
}

export function ExpertRevisionActions({ orderId }: ExpertRevisionActionsProps) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [showDenyConfirm, setShowDenyConfirm] = useState(false);
  const [denying, setDenying] = useState(false);
  const [denyReason, setDenyReason] = useState("");

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await acceptRevision(orderId);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Revision accepted. You can now work on the changes.");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setAccepting(false);
    }
  };

  const handleDeny = async () => {
    setDenying(true);
    try {
      const res = await denyRevision(orderId, denyReason);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Revision denied. A dispute has been opened for review.");
        setShowDenyConfirm(false);
        setDenyReason("");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setDenying(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleAccept}
          disabled={accepting || denying}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          {accepting ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> Accepting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3" /> Accept & Revise
            </>
          )}
        </button>
        <button
          onClick={() => setShowDenyConfirm(true)}
          disabled={accepting || denying}
          className="border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <XCircle className="w-3 h-3" /> Deny
        </button>
      </div>

      {/* Deny confirmation modal */}
      {showDenyConfirm && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => !denying && setShowDenyConfirm(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-md w-full text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="shrink-0 mt-0.5 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Deny Revision Request?</h4>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  This will open a dispute. LogicLot staff will review the project and give a verdict. Both parties will be contacted within 1–2 business days.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="deny-reason" className="block text-sm font-semibold mb-1.5">
                Why are you denying this revision? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deny-reason"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Explain why you believe the revision request is unreasonable or outside the agreed scope..."
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {denyReason.trim().length}/20 characters minimum. This will be visible to the admin reviewing the dispute.
              </p>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowDenyConfirm(false)}
                disabled={denying}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeny}
                disabled={denying || denyReason.trim().length < 20}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {denying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Deny & Open Dispute"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
