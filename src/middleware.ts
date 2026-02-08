import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if user has completed onboarding
    // @ts-expect-error: token type extended
    const isOnboardingComplete = !!token?.onboardingCompletedAt;
    // @ts-expect-error: token type extended
    const role = token?.role;

    // 1. If trying to access onboarding but already done -> Redirect to Dashboard
    if (path.startsWith("/onboarding") && isOnboardingComplete) {
      // Determine where to send based on role
      if (role === "BUSINESS") return NextResponse.redirect(new URL("/business", req.url));
      // Experts go to /dashboard (which redirects to ExpertOverview) OR we could map to /expert/dashboard if we wanted
      // Current expert home is /dashboard (ExpertOverview). 
      // User requested "Business dashboard layout just like expert", and we moved Business to /business.
      // Experts stay at /dashboard (ExpertOverview)? 
      // The Sidebar for experts points to /dashboard for Overview.
      // So /dashboard is fine for experts.
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. If trying to access dashboard but NOT done -> Redirect to Onboarding
    // Admin bypass: Admins might not need standard onboarding flow
    if (path.startsWith("/dashboard") && !isOnboardingComplete && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // 3. Redirect Business Users from /dashboard to /business
    if (path === "/dashboard" && role === "BUSINESS") {
      return NextResponse.redirect(new URL("/business", req.url));
    }
    
    // 4. Route Guarding for Role Specific paths
    if (path.startsWith("/business") && role !== "BUSINESS" && role !== "ADMIN") {
       return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/expert") && role !== "SPECIALIST" && role !== "ADMIN") {
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
    "/expert/:path*"
  ],
};
