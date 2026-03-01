import { hasGoogle, hasLinkedIn } from "@/lib/auth";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return <SignUpForm hasGoogle={hasGoogle} hasLinkedIn={hasLinkedIn} />;
}
