import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { log } from "@/lib/logger";

const TOKEN_REFRESH_AGE_MS = 60 * 1000; // 1 minute

export const hasGoogle = !!(
  process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
);
export const hasLinkedIn = !!(
  process.env.LINKEDIN_CLIENT_ID?.trim() && process.env.LINKEDIN_CLIENT_SECRET?.trim()
);

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== "production",
  providers: [
    ...(hasGoogle
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    ...(hasLinkedIn
      ? [
          LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
            client: { token_endpoint_auth_method: "client_secret_post" },
            issuer: "https://www.linkedin.com",
            profile: (profile) => ({
              id: profile.sub,
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              role: "USER",
              emailVerifiedAt: null,
              onboardingCompletedAt: null,
            }),
            wellKnown:
              "https://www.linkedin.com/oauth/.well-known/openid-configuration",
            authorization: {
              params: {
                scope: "openid profile email",
              },
            },
          }),
        ]
      : []),
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
        try {
          const email = credentials.email.trim().toLowerCase();

          const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
            select: {
              id: true,
              email: true,
              passwordHash: true,
              role: true,
              emailVerifiedAt: true,
              onboardingCompletedAt: true,
            },
          });

          if (!user) {
            log.warn("auth.credentials.user_not_found", {
              emailPrefix: email.slice(0, 5) + "***",
            });
            return null;
          }

          if (!user.passwordHash || user.passwordHash.length < 10) {
            log.warn("auth.credentials.no_password", {
              emailPrefix: email.slice(0, 5) + "***",
              userId: user.id,
            });
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
          if (!isValid) {
            log.warn("auth.credentials.password_mismatch", {
              emailPrefix: email.slice(0, 5) + "***",
              userId: user.id,
            });
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role as "USER" | "BUSINESS" | "EXPERT" | "ADMIN",
            emailVerifiedAt: user.emailVerifiedAt,
            onboardingCompletedAt: user.onboardingCompletedAt,
          };
        } catch (err) {
          log.error("auth.credentials.error", { error: String(err) });
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "linkedin") {
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: {
            id: true,
            role: true,
            emailVerifiedAt: true,
            onboardingCompletedAt: true,
          },
        });

        if (existingUser) {
          if (!existingUser.emailVerifiedAt) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerifiedAt: new Date() },
            });
          }
          user.id = existingUser.id;
          user.role = existingUser.role;
          user.onboardingCompletedAt = existingUser.onboardingCompletedAt;
          return true;
        } else {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              passwordHash: "",
              emailVerifiedAt: new Date(),
              role: "USER",
            },
          });
          user.id = newUser.id;
          user.role = newUser.role;
          return true;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerifiedAt =
          user.emailVerifiedAt instanceof Date
            ? user.emailVerifiedAt.toISOString()
            : (user.emailVerifiedAt ?? null);
        token.onboardingCompletedAt =
          user.onboardingCompletedAt instanceof Date
            ? user.onboardingCompletedAt.toISOString()
            : (user.onboardingCompletedAt ?? null);
        token.refreshedAt = Date.now();
      }

      // 1-minute JWT refresh
      const lastRefresh = token.refreshedAt || 0;
      if (token.id && Date.now() - lastRefresh > TOKEN_REFRESH_AGE_MS) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: {
              role: true,
              emailVerifiedAt: true,
              onboardingCompletedAt: true,
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.emailVerifiedAt =
              dbUser.emailVerifiedAt?.toISOString() ?? null;
            token.onboardingCompletedAt =
              dbUser.onboardingCompletedAt?.toISOString() ?? null;
          }
        } catch {
          // Non-fatal — keep stale token
        }
        token.refreshedAt = Date.now();
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.emailVerifiedAt = token.emailVerifiedAt ?? null;
        session.user.onboardingCompletedAt = token.onboardingCompletedAt ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  session: {
    strategy: "jwt",
  },
};
