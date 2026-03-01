import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isOnboardingComplete = !!token?.onboardingCompletedAt;
    const isEmailVerified = !!token?.emailVerifiedAt;
    const role = token?.role;

    // 0. Email verification gate — block all protected routes until verified.
    //    Social-login users are auto-verified in the signIn callback so this
    //    only affects email/password signups.
    if (!isEmailVerified) {
      const dest = new URL("/auth/verify-email-notice", req.url);
      // Pass email so the page can show the resend button without asking again
      if (token?.email) dest.searchParams.set("email", token.email);
      return NextResponse.redirect(dest);
    }

    // 1. Admins always go straight to /admin — guard everything else from them too
    if (role === "ADMIN") {
      if (!path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    // 2. Non-admins cannot access /admin
    if (path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 3. If trying to access onboarding but already done → home dashboard
    if (path.startsWith("/onboarding") && isOnboardingComplete) {
      if (role === "BUSINESS") return NextResponse.redirect(new URL("/business", req.url));
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 4. If trying to access dashboard but NOT done → onboarding
    if (path.startsWith("/dashboard") && !isOnboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // 5. Redirect Business Users from /dashboard to /business
    if (path === "/dashboard" && role === "BUSINESS") {
      return NextResponse.redirect(new URL("/business", req.url));
    }

    // 6. Route guarding for role-specific paths
    if (path.startsWith("/business") && role !== "BUSINESS") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/expert") && role !== "EXPERT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/sign-in",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/business/:path*",
    "/expert/:path*",
    "/admin/:path*",
  ],
};
