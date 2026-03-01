"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { X } from "lucide-react";
import { deleteMyAccount } from "@/actions/auth";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setOpen(false);
    setError(null);
    setPassword("");
  }

  async function handleDelete() {
    if (!password) {
      setError("Please enter your password to confirm.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await deleteMyAccount(password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      await signOut({ callbackUrl: "/" });
    }
  }

  return (
    <>
      <div className="mt-4 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-destructive font-medium hover:text-destructive/80 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-destructive">Delete your account</h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <p className="text-sm text-foreground">
                This will permanently remove all your personal data from LogicLot. This
                action <strong>cannot be undone</strong>.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Your profile and account info will be deleted</li>
                <li>Draft projects, saved solutions and notifications will be removed</li>
                <li>
                  Completed order records are anonymised and retained for legal compliance
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Active orders or open job posts must be completed or cancelled first.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Confirm with your password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDelete()}
                  placeholder="Your current password"
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-destructive transition-colors outline-none"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleClose}
                  className="flex-1 border border-border rounded-lg px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Keep my account
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 bg-destructive text-destructive-foreground rounded-lg px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Deleting…" : "Delete permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
