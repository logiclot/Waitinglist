"use client";

import { AlertTriangle, X } from "lucide-react";

interface BindingOfferModalProps {
  open: boolean;
  onAgree: () => void;
  onCancel: () => void;
}

export function BindingOfferModal({ open, onAgree, onCancel }: BindingOfferModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Before you submit</h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            By submitting this proposal, you agree to the following:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-secondary/30 border border-border rounded-xl p-4">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Binding offer</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your proposal is a binding offer. If the client accepts, you are committed to deliver at the stated price and timeline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-secondary/30 border border-border rounded-xl p-4">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Free demo on request</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If the client requests a free demo of your proposed solution before accepting, you agree to provide one at no cost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-secondary/10 rounded-b-2xl">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAgree}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Agree and continue
          </button>
        </div>
      </div>
    </div>
  );
}
