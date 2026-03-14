"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { RotateCcw, Loader2, X } from "lucide-react";
import { requestRevision } from "@/actions/orders";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RequestRevisionModalProps {
  orderId: string;
  revisionCount: number;
}

export function RequestRevisionModal({ orderId, revisionCount }: RequestRevisionModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (note.trim().length < 20) {
      toast.error("Please provide at least 20 characters describing the changes needed.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await requestRevision(orderId, note);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Revision request sent to the expert.");
        setOpen(false);
        setNote("");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-border bg-background hover:bg-secondary text-foreground px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
      >
        <RotateCcw className="w-3 h-3" /> Request Modification
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-lg w-full text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-bold text-xl flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" /> Request Modification
              </h4>
              <button
                onClick={() => !submitting && setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Describe the changes you need. The expert will review your request and either accept it or, if they disagree, a dispute will be opened for review.
            </p>

            {revisionCount > 0 && (
              <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                This project has had {revisionCount} previous revision{revisionCount !== 1 ? "s" : ""}.
              </div>
            )}

            {/* Textarea */}
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Please describe what changes or modifications you need..."
              className="w-full h-32 border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-background"
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-2 mb-6">
              <span className={`text-xs ${note.trim().length < 20 ? "text-muted-foreground" : "text-green-600"}`}>
                {note.trim().length} / 20 min characters
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || note.trim().length < 20}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Request"
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
