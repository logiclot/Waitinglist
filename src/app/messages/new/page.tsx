"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createThread } from "@/actions/messaging";
import { useSession } from "next-auth/react";

export default function NewMessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const expertId = searchParams.get("expert");
  const solutionId = searchParams.get("solution");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }

    if (!expertId) {
      router.push("/solutions");
      return;
    }

    async function initThread() {
      const result = await createThread(expertId!, solutionId || undefined);
      
      if (result.success && result.threadId) {
        router.push(`/messages/${result.threadId}`);
      } else {
        // Handle error (e.g. self-messaging or not found)
        console.error(result.error);
        if (result.status === 404) {
            alert("Specialist not found");
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
  }, [expertId, solutionId, router, session, status]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Starting conversation...</p>
      </div>
    </div>
  );
}
