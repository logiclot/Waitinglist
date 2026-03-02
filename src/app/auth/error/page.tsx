import Link from "next/link";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const hasGoogleEnv = !!(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
  const hasLinkedInEnv = !!(process.env.LINKEDIN_CLIENT_ID?.trim() && process.env.LINKEDIN_CLIENT_SECRET?.trim());

  const messages: Record<string, string> = {
    Configuration: "Social sign-in is not configured for this environment. Please use email and password instead.",
    OAuthCallback: "Something went wrong during sign-in. Please try again or use email and password.",
    OAuthCreateAccount: "We couldn't create your account. Please try again or use email and password.",
    Callback: "Sign-in was interrupted. Please try again.",
    Default: "An error occurred during sign-in. Please try again or use email and password.",
  };

  const msg = error ? messages[error] ?? messages.Default : messages.Default;

  return (
    <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Sign-in error</h1>
        <p className="text-muted-foreground">{msg}</p>
        {process.env.NODE_ENV === "development" && (!hasGoogleEnv || !hasLinkedInEnv) && (
          <p className="text-sm text-muted-foreground">
            To enable Google or LinkedIn sign-in, set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET in your environment.
          </p>
        )}
        <Link
          href="/auth/sign-in"
          className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Back to sign in
        </Link>
    </div>
  );
}
