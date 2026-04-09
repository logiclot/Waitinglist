"use client";

import { selectRole } from "@/actions/onboarding";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Wrench, Check } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";
import { signOut, useSession } from "next-auth/react";

type AccountRole = "BUSINESS" | "EXPERT";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: refreshSession } = useSession();

  const existingRole = session?.user?.role;
  const preSelected: AccountRole | null =
    existingRole === "EXPERT" || existingRole === "BUSINESS"
      ? existingRole
      : null;

  const [selected, setSelected] = useState<AccountRole | null>(preSelected);
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setPending(true);

    if (selected === existingRole) {
      router.push(
        selected === "BUSINESS" ? "/onboarding/business" : "/onboarding/expert",
      );
      return;
    }

    const result = await selectRole(selected);
    if (result.success) {
      await refreshSession();
      router.push(
        selected === "BUSINESS" ? "/onboarding/business" : "/onboarding/expert",
      );
    } else {
      setPending(false);
      alert("Your session has expired or is invalid. Please sign in again.");
      signOut({ callbackUrl: "/auth/sign-in" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          How do you want to use {BRAND_NAME}?
        </h1>
        <p className="text-muted-foreground text-lg">
          {preSelected
            ? "Please confirm how you'd like to use your account."
            : "Pick the option that best describes you."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <button
          type="button"
          onClick={() => setSelected("BUSINESS")}
          disabled={pending}
          className={`group relative flex flex-col items-center text-center p-8 rounded-xl border-2 bg-card transition-all hover:shadow-lg disabled:opacity-50 ${
            selected === "BUSINESS"
              ? "border-primary ring-2 ring-primary/20 shadow-md"
              : "border-border hover:border-primary/50"
          }`}
        >
          {selected === "BUSINESS" && (
            <span className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-4 w-4" />
            </span>
          )}
          <div className="bg-primary/10 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            I&apos;m looking to automate my business
          </h2>
          <p className="text-sm font-medium text-primary mb-3">
            Business Owner
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Browse ready-made automations and get them set up in your tools by
            trusted experts.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelected("EXPERT")}
          disabled={pending}
          className={`group relative flex flex-col items-center text-center p-8 rounded-xl border-2 bg-card transition-all hover:shadow-lg disabled:opacity-50 ${
            selected === "EXPERT"
              ? "border-primary ring-2 ring-primary/20 shadow-md"
              : "border-border hover:border-primary/50"
          }`}
        >
          {selected === "EXPERT" && (
            <span className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-4 w-4" />
            </span>
          )}
          <div className="bg-secondary p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
            <Wrench className="h-10 w-10 text-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            I&apos;m looking to sell my automations
          </h2>
          <p className="text-sm font-medium text-primary mb-3">Expert</p>
          <p className="text-muted-foreground leading-relaxed">
            List your automation services, find clients, and get paid for
            delivering solutions.
          </p>
        </button>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected || pending}
        className="mt-10 px-10 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-lg transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? "Setting up…" : "Confirm & Continue"}
      </button>
    </div>
  );
}
