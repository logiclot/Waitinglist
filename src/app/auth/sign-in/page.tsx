import { Suspense } from "react";
import { hasGoogle, hasLinkedIn } from "@/lib/auth";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm hasGoogle={hasGoogle} hasLinkedIn={hasLinkedIn} />
    </Suspense>
  );
}
