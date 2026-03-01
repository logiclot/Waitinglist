"use client";

import { useFormState } from "react-dom";
import { requestPasswordReset } from "@/actions/auth";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Mail, CheckCircle } from "lucide-react";

type FormState = { success?: boolean; error?: string | null };
const initialState: FormState = {};

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState<FormState, FormData>(
    requestPasswordReset as (s: FormState, f: FormData) => Promise<FormState>,
    initialState
  );
  const [pending, setPending] = useState(false);

  useEffect(() => { setPending(false); }, [state]);

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-green-500/10 text-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Check your inbox</h1>
          <p className="text-muted-foreground leading-relaxed">
            If an account exists for that email, we&apos;ve sent a password reset link. It expires in 1 hour.
          </p>
          <div className="bg-secondary/50 rounded-xl border border-border p-4 text-sm text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder, or{" "}
            <Link href="/auth/forgot-password" className="text-primary hover:underline font-medium">
              try again
            </Link>
            .
          </div>
          <Link href="/auth/sign-in" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <div className="bg-primary/10 text-primary p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Forgot your password?</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form
          action={(formData) => { setPending(true); formAction(formData); }}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email address</label>
            <input
              name="email"
              type="email"
              required
              autoFocus
              placeholder="you@company.com"
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          {state?.error && (
            <p className="text-destructive text-sm text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Remember it?{" "}
          <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
