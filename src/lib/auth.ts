import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { log } from "@/lib/logger";

// How long (ms) before the JWT re-fetches fresh role/onboarding from DB.
// Keeps session data live without hitting DB on every single request.
const TOKEN_REFRESH_AGE_MS = 60 * 1000; // 1 minute

/** Converts "JOHN DOE" or "john doe" → "John Doe" */
function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
          // If user exists but no passwordHash (OAuth user), or even if they have one,
          // we allow sign in. We might want to link the account here if we had an Account model,
          // but for now we just ensure the user record exists.
          
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
            },
          });

          user.id = newUser.id;
          user.role = newUser.role;
          user.emailVerifiedAt = newUser.emailVerifiedAt;
          user.onboardingCompletedAt = null;
          user.image = newUser.profileImageUrl || user.image;
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
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
      const lastRefresh = (token.refreshedAt as number) || 0;
      if (token.id && Date.now() - lastRefresh > TOKEN_REFRESH_AGE_MS) {
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
  },
};
