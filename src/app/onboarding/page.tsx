"use client";

import { selectRole } from "@/actions/onboarding";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Wrench } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";
import { signOut, useSession } from "next-auth/react";

export default function OnboardingPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const { data: session } = useSession();

  const handleSelect = async (role: "BUSINESS" | "SPECIALIST") => {
    setPending(true);
    const result = await selectRole(role);
    if (result.success) {
      if (role === "BUSINESS") router.push("/onboarding/business");
      else router.push("/onboarding/expert");
    } else {
      setPending(false);
      // Automatically sign out if there's an error (likely stale session due to secret change)
      alert("Your session has expired or is invalid. Please sign in again.");
      signOut({ callbackUrl: "/auth/sign-in" });
    }
  };

  const isAdmin = session?.user?.email === 'logiclot.helpdesk@gmail.com' || session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">How do you want to use {BRAND_NAME}?</h1>
        <p className="text-muted-foreground text-lg">Choose your account type to get started.</p>
        
        {isAdmin && (
           <button 
             onClick={() => router.push("/admin")}
             className="mt-4 text-sm text-yellow-600 hover:underline"
           >
             Skip to Admin Dashboard
           </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <button
          onClick={() => handleSelect("BUSINESS")}
          disabled={pending}
          className="group relative flex flex-col items-center text-center p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg disabled:opacity-50"
        >
          <div className="bg-primary/10 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-foreground">Business</h2>
          <p className="text-muted-foreground leading-relaxed">
            Buy ready to implement automations for your day to day business.
          </p>
        </button>

        <button
          onClick={() => handleSelect("SPECIALIST")}
          disabled={pending}
          className="group relative flex flex-col items-center text-center p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg disabled:opacity-50"
        >
          <div className="bg-secondary p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
            <Wrench className="h-10 w-10 text-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-foreground">Specialist</h2>
          <p className="text-muted-foreground leading-relaxed">
            List productized solutions and deliver implementations to businesses.
          </p>
        </button>
      </div>
    </div>
  );
}
