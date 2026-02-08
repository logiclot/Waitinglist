"use client";

import { useFormState } from "react-dom";
import { signUp } from "@/actions/auth";
import Link from "next/link";
import { useState, useEffect } from "react";

const initialState = {
  error: null as string | null,
  success: false as boolean,
  email: null as string | null,
};

export default function SignUpPage() {
  // @ts-expect-error: useFormState type definition mismatch with server action return type
  const [state, formAction] = useFormState(signUp, initialState);
  const [pending, setPending] = useState(false);

  // Reset pending state when we get a result/error
  useEffect(() => {
    setPending(false);
  }, [state]);

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-2xl border border-emerald-100">
            ✉️
          </div>
          <h1 className="text-3xl font-bold text-foreground">Verify your email</h1>
          <p className="text-muted-foreground">
            We sent a verification link to <span className="font-semibold text-foreground">{state.email}</span>.
            <br />
            Please verify to continue.
          </p>
          <div className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-md border border-border">
            (Check server console for link in Dev mode)
          </div>
          <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Create an account</h1>
          <p className="text-muted-foreground mt-2">Start your automation journey</p>
        </div>

        <form action={(formData) => { setPending(true); formAction(formData); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          {state?.error && (
            <div className="text-destructive text-sm text-center">{state.error}</div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {pending ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
