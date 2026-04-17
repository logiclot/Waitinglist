"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus("error");
      return;
    }

    (async () => {
      const res = await signIn("verify-email", {
        token,
        redirect: false,
      });

      if (res?.ok && !res.error) {
        setStatus("success");
        router.push("/onboarding");
        router.refresh();
      } else {
        setStatus("error");
      }
    })();
  }, [token, router]);

  if (status === "loading") {
    return (
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-primary/10 text-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <h1 className="text-3xl font-bold">Verifying your email…</h1>
        <p className="text-muted-foreground">Hang tight, we&apos;re setting up your account.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-green-500/10 text-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold">Email Verified</h1>
        <p className="text-muted-foreground">Redirecting you to onboarding…</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full text-center space-y-6">
      <div className="bg-red-500/10 text-red-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
        <XCircle className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold">Verification Failed</h1>
      <p className="text-muted-foreground">
        This verification link is invalid or has expired. If your email is already verified, please sign in.
      </p>
      <Link
        href="/auth/sign-in"
        className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
      >
        Go to Sign In
      </Link>
    </div>
  );
}
