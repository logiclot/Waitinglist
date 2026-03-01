import { hasGoogle, hasLinkedIn } from "@/lib/auth";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return <SignInForm hasGoogle={hasGoogle} hasLinkedIn={hasLinkedIn} />;
}
