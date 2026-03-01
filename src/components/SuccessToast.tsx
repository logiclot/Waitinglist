"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export function SuccessToast({ message }: { message: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    toast.success(message);
    
    // Clean up URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("success");
    params.delete("orderId"); // Optional cleanup
    router.replace(`?${params.toString()}`);
  }, [message, router, searchParams]);

  return null;
}
