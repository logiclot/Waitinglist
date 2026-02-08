import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        // Check verification? User said: "If email not verified: show blocking banner"
        // This implies we let them sign in but block access via UI/Middleware, or authorize returns specific error.
        // For simplicity, we authorize them, but the session will carry the 'emailVerifiedAt' status.
        
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerifiedAt: user.emailVerifiedAt,
          onboardingCompletedAt: user.onboardingCompletedAt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.emailVerifiedAt = (user as any).emailVerifiedAt;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.onboardingCompletedAt = (user as any).onboardingCompletedAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.role = token.role as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.emailVerifiedAt = token.emailVerifiedAt as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.onboardingCompletedAt = token.onboardingCompletedAt as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    // error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
};
