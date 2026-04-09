import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { log } from "@/lib/logger";
import { createRateLimiter } from "@/lib/rate-limit";
import * as Sentry from "@sentry/nextjs";

// How long (ms) before the JWT re-fetches fresh role/onboarding from DB.
// Keeps session data live without hitting DB on every single request.
const TOKEN_REFRESH_AGE_MS = 5 * 60 * 1000; // 5 minutes

// Brute-force protection: 5 login attempts per email per 15 minutes
const loginLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

/** Converts "JOHN DOE" or "john doe" → "John Doe" */
function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Tracks login activity (lastLoginAt / loginDaysCount) and checks expert
 * referral conditions.  Called once per sign-in from the signIn callback
 * so it never runs on regular page navigations.
 */
async function trackLoginActivity(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastLoginAt: true, loginDaysCount: true },
    });
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let shouldUpdate = false;
    let newLoginDaysCount = user.loginDaysCount;

    if (!user.lastLoginAt) {
      shouldUpdate = true;
      newLoginDaysCount = 1;
    } else {
      const lastLogin = new Date(user.lastLoginAt);
      const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      if (today.getTime() > lastLoginDate.getTime()) {
        shouldUpdate = true;
        newLoginDaysCount += 1;
      }
    }

    if (shouldUpdate) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: now, loginDaysCount: newLoginDaysCount },
      });

      const { checkExpertReferralCondition } = await import("@/actions/referral");
      await checkExpertReferralCondition(userId);
    }
  } catch (error) {
    log.error("auth.track_login_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
  }
}

export const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
export const hasLinkedIn = !!(process.env.LINKEDIN_CLIENT_ID?.trim() && process.env.LINKEDIN_CLIENT_SECRET?.trim());

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== "production",
  providers: [
    ...(hasGoogle
      ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          profile: (profile) => ({
            id: profile.sub,
            name: profile.name ? toTitleCase(profile.name) : profile.name,
            email: profile.email,
            image: profile.picture,
            role: "USER",
          }),
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
            name: profile.name ? toTitleCase(profile.name) : profile.name,
            email: profile.email,
            image: profile.picture,
            role: "USER",
          }),
          wellKnown: "https://www.linkedin.com/oauth/.well-known/openid-configuration",
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

          // Brute-force protection
          const rateCheck = await loginLimiter.check(`login:${email}`);
          if (!rateCheck.success) {
            log.warn("auth.credentials.rate_limited", { emailPrefix: email.slice(0, 5) + "***" });
            throw new Error("Too many login attempts. Please try again in 15 minutes.");
          }

          type UserRow = {
            id: string;
            email: string;
            passwordHash: string;
            role: string;
            emailVerifiedAt: Date | null;
            onboardingCompletedAt: Date | null;
            profileImageUrl: string | null;
          };

          const rows = await prisma.$queryRaw<UserRow[]>`
            SELECT id, email, "passwordHash", role, "emailVerifiedAt", "onboardingCompletedAt", "profileImageUrl"
            FROM "User"
            WHERE LOWER(email) = ${email}
            ORDER BY "createdAt" ASC
            LIMIT 1
          `;

          const user = rows[0];

          if (!user) {
            log.warn("auth.credentials.user_not_found", { emailPrefix: email.slice(0, 5) + "***" });
            return null;
          }

          if (!user.passwordHash || user.passwordHash.length < 10) {
            log.warn("auth.credentials.no_password", { emailPrefix: email.slice(0, 5) + "***", userId: user.id });
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isValid) {
            log.warn("auth.credentials.password_mismatch", { emailPrefix: email.slice(0, 5) + "***", userId: user.id });
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role as "USER" | "BUSINESS" | "EXPERT" | "ADMIN",
            emailVerifiedAt: user.emailVerifiedAt,
            onboardingCompletedAt: user.onboardingCompletedAt,
            profileImageUrl: user.profileImageUrl,
          };
        } catch (err) {
          log.error("auth.credentials.error", { error: String(err) });
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account, profile: _profile }) {
      if (account?.provider === "google" || account?.provider === "linkedin") {
        if (!user.email) return false;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true, emailVerifiedAt: true, onboardingCompletedAt: true, profileImageUrl: true },
        });

        if (existingUser) {
          // Update verified status + backfill profile image from OAuth if missing
          const needsUpdate = !existingUser.emailVerifiedAt || (!existingUser.profileImageUrl && user.image);
          if (needsUpdate) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                ...(!existingUser.emailVerifiedAt && { emailVerifiedAt: new Date() }),
                ...(!existingUser.profileImageUrl && user.image && { profileImageUrl: user.image }),
              },
            });
          }

          // Inject role and profile into user object for session/jwt callbacks
          user.id = existingUser.id;
          user.role = existingUser.role;
          user.emailVerifiedAt = existingUser.emailVerifiedAt ?? new Date();
          user.onboardingCompletedAt = existingUser.onboardingCompletedAt;
          user.image = existingUser.profileImageUrl || user.image;

          // Link OAuth account to this user (idempotent upsert)
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state as string | undefined,
            },
            create: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state as string | undefined,
            },
          });

          await trackLoginActivity(existingUser.id);
          return true;
        } else {
          // Create new user — persist OAuth profile image
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              passwordHash: "", // No password for OAuth users
              emailVerifiedAt: new Date(), // Trusted provider
              role: "USER", // Default role
              profileImageUrl: user.image || null,
              // Create linked Account record in the same transaction
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string | undefined,
                },
              },
            },
          });

          user.id = newUser.id;
          user.role = newUser.role;
          user.emailVerifiedAt = newUser.emailVerifiedAt;
          user.onboardingCompletedAt = null;
          user.image = newUser.profileImageUrl || user.image;
          await trackLoginActivity(newUser.id);
          return true;
        }
      }
      if (user?.id) {
        await trackLoginActivity(user.id as string);
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // On first sign-in, seed token from the auth result
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.emailVerifiedAt = user.emailVerifiedAt instanceof Date
          ? user.emailVerifiedAt.toISOString()
          : (user.emailVerifiedAt as string | null | undefined);
        token.onboardingCompletedAt = user.onboardingCompletedAt instanceof Date
          ? user.onboardingCompletedAt.toISOString()
          : (user.onboardingCompletedAt as string | null | undefined);
        token.image = (user as { image?: string; profileImageUrl?: string }).image
          || (user as { image?: string; profileImageUrl?: string }).profileImageUrl;
        token.refreshedAt = Date.now();
      }

      // On subsequent requests, re-fetch from DB once per TOKEN_REFRESH_AGE_MS.
      // This ensures role and onboarding changes propagate without requiring sign-out.
      // Force immediate refresh when session.update() is called (e.g. after onboarding).
      const lastRefresh = (token.refreshedAt as number) || 0;
      const needsRefresh = trigger === "update" || Date.now() - lastRefresh > TOKEN_REFRESH_AGE_MS;
      if (token.id && needsRefresh) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true, emailVerifiedAt: true, onboardingCompletedAt: true, profileImageUrl: true,
              businessProfile: { select: { firstName: true, lastName: true } },
              specialistProfile: { select: { displayName: true } },
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.emailVerifiedAt = dbUser.emailVerifiedAt as unknown as string;
            token.onboardingCompletedAt = dbUser.onboardingCompletedAt as unknown as string;
            token.image = dbUser.profileImageUrl ?? token.image;
            // Derive display name from profile
            const profileName = dbUser.specialistProfile?.displayName
              || (dbUser.businessProfile ? `${dbUser.businessProfile.firstName} ${dbUser.businessProfile.lastName}`.trim() : null);
            if (profileName) token.name = profileName;
          }
        } catch {
          // Non-fatal — keep using cached token values if DB is unreachable
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
        session.user.image = (token.image as string) ?? null;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour — forces re-authentication; refresh cycle (5 min) keeps session fresh within this window
  },
};
