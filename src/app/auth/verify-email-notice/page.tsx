"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { resendVerificationEmail, resendVerificationEmailForSession } from "@/actions/auth";

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailNoticePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  // Seconds remaining before another resend is allowed (0 = ready)
  const [cooldown, setCooldown] = useState(0);

  // Tick down the cooldown every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // Poll the session every 3 seconds to detect email verification
  useEffect(() => {
    if (verified) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (session?.user?.emailVerifiedAt) {
          setVerified(true);
          clearInterval(interval);
          // Brief delay so the user sees the success message
          setTimeout(() => router.push("/onboarding"), 1500);
        }
      } catch {
        // Non-fatal — keep polling
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [verified, router]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || loading) return;

    setLoading(true);
    setError(null);
    setSent(false);

    // Use session-based action when we have no email in the URL (user arrived
    // via middleware redirect while already logged in)
    const result = email
      ? await resendVerificationEmail(email)
      : await resendVerificationEmailForSession();

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
      setCooldown(COOLDOWN_SECONDS);
    }
  }, [email, loading, cooldown]);

  return (
    <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-primary/10 text-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-bold text-foreground">Verify your email</h1>

        <p className="text-muted-foreground leading-relaxed">
          We sent a verification link to{" "}
          {email ? (
            <span className="font-semibold text-foreground">{email}</span>
          ) : (
            "your email address"
          )}
          . Click the link in the email to activate your account.
        </p>

        {verified ? (
          <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Email verified! Redirecting you now…
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for verification…
            </div>

            <div className="bg-secondary/50 rounded-xl border border-border p-5 text-sm text-muted-foreground text-left space-y-2">
              <p className="font-medium text-foreground">Not seeing it?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam or junk folder</li>
                <li>The link is valid for 24 hours</li>
                <li>Make sure you used the correct email address</li>
              </ul>
            </div>

            {/* Resend button — always visible, with cooldown */}
            <div className="space-y-3">
              {sent && (
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  New verification email sent — check your inbox.
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <button
                onClick={handleResend}
                disabled={loading || cooldown > 0}
                className="flex items-center gap-2 mx-auto text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-opacity"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {loading
                  ? "Sending…"
                  : cooldown > 0
                  ? `Resend available in ${cooldown}s`
                  : "Resend verification email"}
              </button>
            </div>
          </>
        )}

        <Link
          href="/auth/sign-in"
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Sign In
        </Link>
    </div>
  );
}
