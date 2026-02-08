import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      emailVerifiedAt: string | null;
      onboardingCompletedAt: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    emailVerifiedAt: Date | null;
    onboardingCompletedAt: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    emailVerifiedAt: Date | null;
    onboardingCompletedAt: Date | null;
  }
}
