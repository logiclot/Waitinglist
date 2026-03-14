"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { acceptOrder } from "@/actions/orders";
import { useRouter } from "next/navigation";

export function ExpertAcceptButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    const res = await acceptOrder(orderId);
    setLoading(false);

    if ("error" in res) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm hover:bg-primary/90 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Accepting...
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4" />
          Accept & Start Working
        </>
      )}
    </button>
  );
}
