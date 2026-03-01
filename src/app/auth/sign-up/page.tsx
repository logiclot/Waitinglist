import { Suspense } from "react";
import { hasGoogle, hasLinkedIn } from "@/lib/auth";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm hasGoogle={hasGoogle} hasLinkedIn={hasLinkedIn} />
    </Suspense>
  );
}
