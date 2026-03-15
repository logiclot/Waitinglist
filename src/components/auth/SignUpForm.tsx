"use client";

import { useFormState } from "react-dom";
import { signUp } from "@/actions/auth";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Linkedin, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";

type FormState = { error?: string | null; success?: boolean; email?: string | null; invited?: boolean };
const initialState: FormState = {};

interface SignUpFormProps {
  hasGoogle: boolean;
  hasLinkedIn: boolean;
}

export function SignUpForm({ hasGoogle, hasLinkedIn }: SignUpFormProps) {
  const [state, formAction] = useFormState<FormState, FormData>(signUp as (s: FormState, f: FormData) => Promise<FormState>, initialState);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  const inviteToken = searchParams.get("invite");
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviteName, setInviteName] = useState<string | null>(null);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null); // null = loading
  const hasSocial = hasGoogle || hasLinkedIn;

  // Validate invite token on mount
  useEffect(() => {
    if (!inviteToken) return;
    fetch(`/api/auth/validate-invite?token=${encodeURIComponent(inviteToken)}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setInviteEmail(data.email);
          setInviteName(data.name);
          setInviteValid(true);
        } else {
          setInviteValid(false);
        }
      })
      .catch(() => setInviteValid(false));
  }, [inviteToken]);

  useEffect(() => {
    if (state?.success && state?.invited) {
      // Invited user: auto sign-in (email already verified, role already set)
      signIn("credentials", {
        email: state.email,
        redirect: true,
        callbackUrl: "/onboarding",
      });
      return;
    }
    setPending(false);
  }, [state]);

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/onboarding" });
  };

  // Invite token invalid or already used
  if (inviteToken && inviteValid === false) {
    return (
      <div className="max-w-md w-full text-center space-y-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-2xl border border-red-100">
          !
        </div>
        <h1 className="text-3xl font-bold text-foreground">Invalid invite link</h1>
        <p className="text-muted-foreground">
          This invite link is invalid or has already been used.
        </p>
        <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
          Sign up with a different email
        </Link>
      </div>
    );
  }

  // Still loading invite validation
  if (inviteToken && inviteValid === null) {
    return (
      <div className="max-w-md w-full text-center space-y-6">
        <div className="animate-pulse text-muted-foreground">Validating invite...</div>
      </div>
    );
  }

  if (state?.success && !state?.invited) {
    return (
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
          Didn&apos;t receive it?{" "}
          <Link href={`/auth/verify-email-notice?email=${encodeURIComponent(state?.email ?? "")}`} className="text-primary hover:underline font-medium">
            Resend verification email
          </Link>
        </div>
        <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
          Back to Sign In
        </Link>
      </div>
    );
  }

  // Invited user: show "setting up your account" while auto sign-in happens
  if (state?.success && state?.invited) {
    return (
      <div className="max-w-md w-full text-center space-y-6">
        <div className="animate-pulse text-muted-foreground">Setting up your account...</div>
      </div>
    );
  }

  return (
    <div className="max-w-sm w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">
          {inviteEmail ? "Set up your password" : "Create an account"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {inviteEmail
            ? `Welcome${inviteName ? `, ${inviteName.split(" ")[0]}` : ""}! Create a password to get started.`
            : "Start your automation journey"}
        </p>
      </div>

        {hasSocial && !inviteEmail && (
          <>
            <div className="space-y-3">
              {hasGoogle && (
                <button
                  onClick={() => handleSocialLogin("google")}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-white border border-border text-foreground py-2.5 rounded-md font-medium hover:bg-secondary/50 transition-colors min-h-[44px] touch-manipulation"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign up with Google
                </button>
              )}
              {hasLinkedIn && (
                <button
                  onClick={() => handleSocialLogin("linkedin")}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-[#0077B5] text-white py-2.5 rounded-md font-medium hover:bg-[#00669c] transition-colors min-h-[44px] touch-manipulation"
                >
                  <Linkedin className="w-5 h-5 fill-current shrink-0" />
                  Sign up with LinkedIn
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
              </div>
            </div>
          </>
        )}

        <form action={(formData) => { setPending(true); formAction(formData); }} className="space-y-6">
          {referralCode && (
            <input type="hidden" name="referralCode" value={referralCode} />
          )}
          {inviteToken && (
            <input type="hidden" name="inviteToken" value={inviteToken} />
          )}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              value={inviteEmail ?? undefined}
              readOnly={!!inviteEmail}
              className={`w-full border border-border rounded-md px-3 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[44px] touch-manipulation ${
                inviteEmail ? "bg-secondary/50 cursor-not-allowed text-muted-foreground" : "bg-white"
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-white border border-border rounded-md px-3 py-2.5 pr-10 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[44px] touch-manipulation"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Confirm Password</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-white border border-border rounded-md px-3 py-2.5 pr-10 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none min-h-[44px] touch-manipulation"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary shrink-0"
            />
            <label htmlFor="termsAccepted" className="text-sm text-muted-foreground leading-snug">
              I agree to the{" "}
              <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>

          {state?.error && (
            <div className="text-destructive text-sm text-center">{state.error}</div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-[44px] touch-manipulation"
          >
            {pending ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {!inviteEmail && (
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        )}
    </div>
  );
}
