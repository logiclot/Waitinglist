"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Shows a success toast and auto-refreshes the page a few times after Stripe
 * checkout redirects.  This covers the brief window between the redirect back
 * from Stripe and the webhook updating the DB (typically 1-5 seconds).
 */
export function SuccessToast({ message }: { message: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    toast.success(message);

    // Auto-refresh the server data a few times to catch webhook updates
    const t1 = setTimeout(() => router.refresh(), 1500);
    const t2 = setTimeout(() => router.refresh(), 4000);
    const t3 = setTimeout(() => {
      router.refresh();
      // Clean up URL after refreshes are done
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      params.delete("orderId");
      const remaining = params.toString();
      router.replace(remaining ? `?${remaining}` : window.location.pathname);
    }, 7000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [message, router, searchParams]);

  return null;
}
