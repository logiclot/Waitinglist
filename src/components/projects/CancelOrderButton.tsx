"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/actions/orders";
import { Trash2, X } from "lucide-react";

interface Props {
  orderId: string;
  orderStatus: string;
}

export function CancelOrderButton({ orderId, orderStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isDraft = orderStatus === "draft";
  const label = isDraft ? "Delete" : "Cancel Project";

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    const result = await cancelOrder(orderId);
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold">
                {isDraft ? "Delete this project?" : "Cancel this project?"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              {isDraft
                ? "This project draft will be permanently deleted. No payment has been made."
                : "This will cancel the project. If any milestones were funded, the order will be flagged for review and any eligible refund processed by support."}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-border rounded-lg px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
              >
                Keep Project
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-destructive text-destructive-foreground rounded-lg px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Processing…" : isDraft ? "Delete" : "Cancel Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
