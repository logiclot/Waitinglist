import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function BusinessSecurityPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Shield className="h-8 w-8 text-primary" /> Security
      </h1>
      <div className="bg-card border border-border rounded-xl p-8 max-w-xl">
        <p className="text-muted-foreground mb-6">
          Security settings are coming soon. For now, you can reset your password from the sign-in page if needed.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
        >
          Reset password
        </Link>
      </div>
      <Link
        href="/business/settings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>
    </div>
  );
}
