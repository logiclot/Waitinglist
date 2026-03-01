"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createThread } from "@/actions/messaging";
import { useSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";

export default function NewMessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const expertId = searchParams.get("expert");
  const solutionId = searchParams.get("solution");
  const orderId = searchParams.get("order");
  const userId = searchParams.get("user"); // If messaging a user (buyer)

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }

    // Determine target ID (Expert or User)
    const targetId = expertId || userId;

    if (!targetId) {
      Sentry.captureMessage("Missing target ID on new message page", "warning");
      router.push("/solutions");
      return;
    }

    async function initThread() {
      // Create thread with either expertId (seller) or direct userId if needed
      // Our action currently expects 'sellerId'. 
      // If we are messaging a buyer, we might need a different action or logic.
      // But usually 'createThread' implies Buyer -> Seller.
      // If Seller -> Buyer, we need to find existing thread or create one where they are buyer.
      
      // For now, let's assume standard flow: Buyer -> Expert
      // If expertId is present, we use it.
      
      const result = await createThread(targetId!, solutionId || undefined, orderId || undefined);
      
      if (result.success && result.threadId) {
        router.push(`/messages/${result.threadId}`);
      } else {
        // Handle error (e.g. self-messaging or not found)
        Sentry.captureMessage(result.error ?? "Unknown messaging error", "error");
        if (result.status === 404) {
            alert("User not found");
            router.push("/solutions");
        } else if (result.status === 400) {
            alert("You cannot message yourself");
            router.back();
        } else {
            alert("Failed to start conversation. Please try again.");
            router.push("/solutions");
        }
      }
    }

    initThread();
  }, [expertId, userId, solutionId, orderId, router, session, status]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Starting conversation...</p>
      </div>
    </div>
  );
}
