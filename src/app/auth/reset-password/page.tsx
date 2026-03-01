"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/actions/auth";
import { CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">Invalid reset link</h1>
          <p className="text-muted-foreground">This link is missing a token. Please request a new one.</p>
          <Link href="/auth/forgot-password" className="text-primary hover:underline font-medium text-sm">
            Request new link →
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-green-500/10 text-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Password updated</h1>
          <p className="text-muted-foreground">Your password has been changed. You can now sign in with your new password.</p>
          <button
            onClick={() => router.push("/auth/sign-in")}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setError(null);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Choose a new password</h1>
          <p className="text-muted-foreground mt-2">Make it strong — at least 8 characters.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">New password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoFocus
                className="w-full bg-white border border-border rounded-md px-3 py-2 pr-10 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Confirm new password</label>
            <input
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Updating…" : "Set new password"}
          </button>
        </form>
      </div>
    </div>
  );
}
