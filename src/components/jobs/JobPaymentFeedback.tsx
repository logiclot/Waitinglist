"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function JobPaymentFeedback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paid = searchParams.get("paid");
  const canceled = searchParams.get("canceled");
  const free = searchParams.get("free");

  useEffect(() => {
    if (paid === "true") {
      toast.success(
        free === "true"
          ? "Your free Discovery Scan is live! Experts are being notified now."
          : "Payment successful! Your post is now live and visible to experts."
      );
      const params = new URLSearchParams(searchParams.toString());
      params.delete("paid");
      params.delete("canceled");
      params.delete("free");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    } else if (canceled === "true") {
      toast.info("Payment was canceled. You can pay anytime from this page.");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("paid");
      params.delete("canceled");
      params.delete("free");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    }
  }, [paid, canceled, free, router, searchParams]);

  return null;
}
