import { verifyEmail } from "@/actions/auth";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid verification link.</p>
      </div>
    );
  }

  const result = await verifyEmail(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {result.success ? (
          <>
            <div className="bg-green-500/10 text-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">Email Verified</h1>
            <p className="text-muted-foreground">
              Thank you for verifying your email. You can now continue to onboarding.
            </p>
            <Link
              href="/onboarding"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Continue to Onboarding
            </Link>
          </>
        ) : (
          <>
            <div className="bg-red-500/10 text-red-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">Verification Failed</h1>
            <p className="text-muted-foreground">{result.error}</p>
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              Back to Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
