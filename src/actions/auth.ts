"use server";

import { prisma } from "@/lib/prisma";
import { resend, getFromEmail } from "@/lib/resend";
import { verificationEmail, passwordResetEmail } from "@/lib/email-templates";
import { log } from "@/lib/logger";
import { Analytics } from "@/lib/analytics";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { APP_URL as BASE_APP_URL } from "@/lib/app-url";
import { Prisma } from "@prisma/client";

import { validatePassword } from "@/lib/password-rules";
import { createRateLimiter } from "@/lib/rate-limit";

/** 5 signup attempts per email per hour */
const signupLimiter = createRateLimiter({ limit: 5, windowMs: 60 * 60_000 });
/** 3 password-reset requests per email per hour */
const resetLimiter = createRateLimiter({ limit: 3, windowMs: 60 * 60_000 });

const FROM_EMAIL = getFromEmail();
// NEXTAUTH_URL is always set locally (127.0.0.1:3000); NEXT_PUBLIC_APP_URL overrides in production
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  BASE_APP_URL;

export async function signUp(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const referralCode = formData.get("referralCode") as string | null;
  const inviteToken = formData.get("inviteToken") as string | null;
  const termsAccepted = formData.get("termsAccepted") === "on";

  if (!email || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  // Rate limit by email to prevent enumeration and spam
  const rl = await signupLimiter.check(email.toLowerCase());
  if (!rl.success) {
    return { error: "Too many signup attempts. Please try again later." };
  }

  if (!termsAccepted) {
    return { error: "You must accept the Terms & Conditions and Privacy Policy to continue." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const pwError = validatePassword(password);
  if (pwError) return { error: pwError };

  try {
    // Validate referral code if provided (outside transaction — read-only)
    let validReferralCode: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (referrer) validReferralCode = referralCode;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If invite token provided, run entire signup + invite-consume atomically
    if (inviteToken) {
      const result = await prisma.$transaction(async (tx) => {
        const found = await tx.waitlistSignup.findUnique({
          where: { inviteToken },
          select: { id: true, email: true, role: true, usedAt: true },
        });
        if (!found || found.usedAt) {
          throw new Error("INVITE_INVALID");
        }
        if (found.email.toLowerCase() !== email.toLowerCase()) {
          throw new Error("INVITE_EMAIL_MISMATCH");
        }

        const existingUser = await tx.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });
        if (existingUser) throw new Error("USER_EXISTS");

        const user = await tx.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            referredBy: validReferralCode,
            role: found.role === "expert" ? "EXPERT" : "BUSINESS",
            emailVerifiedAt: new Date(),
          },
        });

        await tx.waitlistSignup.update({
          where: { id: found.id },
          data: { usedAt: new Date() },
        });

        return user;
      });

      Analytics.signedUp(result.id, { hasReferral: !!validReferralCode });
      return { success: true, email, invited: true };
    }

    // Normal flow (no invite token)
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (existingUser) {
      return { error: "An account with this email already exists" };
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        referredBy: validReferralCode,
      },
    });

    // Send verification email
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    await sendVerificationEmail(email, token);

    Analytics.signedUp(user.id, { hasReferral: !!validReferralCode });

    return { success: true, email };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "INVITE_INVALID") return { error: "This invite link is invalid or has already been used." };
    if (msg === "INVITE_EMAIL_MISMATCH") return { error: "This invite link is for a different email address." };
    if (msg === "USER_EXISTS") return { error: "An account with this email already exists" };
    log.error("auth.signup_failed", { error: String(e) });
    return { error: "Something went wrong. Please try again." };
  }
}

export async function verifyEmail(token: string) {
  try {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return { error: "This verification link is invalid." };
    }

    if (new Date() > verificationToken.expiresAt) {
      return { error: "This verification link has expired. Please request a new one." };
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: new Date() },
    });

    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return { success: true };
  } catch (e) {
    log.error("auth.verify_email_failed", { error: String(e) });
    return { error: "Verification failed. Please try again." };
  }
}

/** Resend a verification email for an already-registered user. */
export async function resendVerificationEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return { error: "No account found with this email." };
    if (user.emailVerifiedAt) return { error: "This email is already verified." };

    // Invalidate any existing token
    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    await sendVerificationEmail(email, token);

    return { success: true };
  } catch (e) {
    log.error("auth.resend_verification_failed", { error: String(e) });
    return { error: "Failed to resend. Please try again." };
  }
}

// Resend using the current session — no email param needed.
// Used by the verify-email-notice page when the user is already logged in.
export async function resendVerificationEmailForSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Not signed in." };
  return resendVerificationEmail(session.user.email);
}

// ── Password Reset ────────────────────────────────────────────────────────────

export async function requestPasswordReset(prevState: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Email is required." };

  // Rate limit by email to prevent spam and enumeration
  const rl = await resetLimiter.check(email);
  if (!rl.success) {
    return { success: true }; // Return success to avoid leaking that the email exists
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "asc" },
    });

    // No account — return success to prevent email enumeration attacks
    if (!user) {
      return { success: true };
    }

    // OAuth-only account — tell the user which provider to use instead
    if (!user.passwordHash || user.passwordHash.length < 10) {
      const linkedAccount = await prisma.account.findFirst({
        where: { userId: user.id },
        select: { provider: true },
      });
      const provider = linkedAccount?.provider;
      const providerName = provider === "google" ? "Google" : provider === "linkedin" ? "LinkedIn" : null;

      if (providerName) {
        return { error: `This account uses ${providerName} sign-in and doesn't have a password. Please sign in with ${providerName} instead.` };
      }
      return { error: "This account doesn't have a password. Please sign in with your social account." };
    }

    // Invalidate any existing reset token for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    if (!FROM_EMAIL) {
      log.info("auth.password_reset_link_dev", {
        url: `${APP_URL}/auth/reset-password?token=${token}`,
      });
    } else {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Reset your LogicLot password",
        html: passwordResetEmail({ resetUrl: `${APP_URL}/auth/reset-password?token=${token}` }),
        headers: {
          'X-Entity-Ref-ID': randomUUID(),
        }
      });
    }

    return { success: true };
  } catch (e) {
    log.error("auth.password_reset_request_failed", { error: String(e) });
    return { error: "Something went wrong. Please try again." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  if (!token) return { error: "Missing reset token." };
  const pwError = validatePassword(newPassword);
  if (pwError) return { error: pwError };

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) return { error: "This reset link is invalid or has already been used." };
    if (new Date() > resetToken.expiresAt) {
      return { error: "This reset link has expired. Please request a new one." };
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashed },
    });

    // Consume the token
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return { success: true };
  } catch (e) {
    log.error("auth.password_reset_failed", { error: String(e) });
    return { error: "Something went wrong. Please try again." };
  }
}

export async function deleteMyAccount(password: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not signed in." };

  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.passwordHash === "DELETED") {
      return { error: "Account not found. Please contact support." };
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) return { error: "Incorrect password." };

    const [activeOrdersAsBuyer, activeJobs, expert] = await Promise.all([
      prisma.order.count({
        where: {
          buyerId: userId,
          status: { notIn: ["approved", "refunded"] },
        },
      }),
      prisma.jobPost.count({
        where: {
          buyerId: userId,
          status: { notIn: ["draft", "cancelled", "closed"] },
        },
      }),
      prisma.specialistProfile.findUnique({ where: { userId } }),
    ]);

    if (activeOrdersAsBuyer > 0) {
      return {
        error:
          "You have active orders. Please wait until all orders are completed before deleting your account.",
      };
    }

    if (activeJobs > 0) {
      return {
        error:
          "You have active job posts. Please cancel them before deleting your account.",
      };
    }

    if (expert) {
      const activeOrdersAsSeller = await prisma.order.count({
        where: {
          sellerId: expert.id,
          status: { notIn: ["approved", "refunded"] },
        },
      });
      if (activeOrdersAsSeller > 0) {
        return {
          error:
            "You have active client orders. Please complete or cancel them before deleting your account.",
        };
      }
    }

    // Perform anonymisation and targeted deletion
    await prisma.$transaction(async (tx) => {
      // Auth tokens
      await tx.emailVerificationToken.deleteMany({ where: { userId } });
      await tx.passwordResetToken.deleteMany({ where: { userId } });

      // Ephemeral user data
      await tx.savedSolution.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.feedback.deleteMany({ where: { userId } });
      await tx.surveyCompletion.deleteMany({ where: { userId } });

      // Conversations with no linked order (messages cascade from conversation)
      await tx.conversation.deleteMany({ where: { buyerId: userId, orderId: null } });

      // Draft/cancelled job posts (bids cascade from jobPost)
      await tx.jobPost.deleteMany({
        where: { buyerId: userId, status: { in: ["draft", "cancelled"] } },
      });

      if (expert) {
        // Archive all solutions to remove from public marketplace
        await tx.solution.updateMany({
          where: { expertId: expert.id },
          data: { status: "archived" },
        });

        // Delete ecosystems (ecosystem items cascade)
        await tx.ecosystem.deleteMany({ where: { expertId: expert.id } });

        // Delete bids that haven't been accepted into an order
        await tx.bid.deleteMany({
          where: {
            specialistId: expert.id,
            status: { in: ["submitted", "shortlisted", "rejected", "withdrawn"] },
          },
        });

        // Anonymise specialist profile (keep record for FK integrity on orders)
        await tx.specialistProfile.update({
          where: { id: expert.id },
          data: {
            legalFullName: "Deleted Expert",
            displayName: "Deleted Expert",
            slug: `deleted-${userId}`,
            status: "SUSPENDED" as const,
            phoneNumber: null,
            bio: null,
            portfolioLinks: [],
            portfolioUrl: null,
            calendarUrl: null,
            invoiceCompanyName: null,
            invoiceAddress: null,
            invoiceVatNumber: null,
            businessIdentificationNumber: null,
            agencyName: null,
          },
        });
      }

      // Anonymise business profile
      await tx.businessProfile.updateMany({
        where: { userId },
        data: {
          firstName: "Deleted",
          lastName: "User",
          companyName: "Deleted",
          jobRole: "deleted",
          howHeard: "deleted",
          billingEmail: null,
          website: null,
          whatToAutomate: null,
        },
      });

      // Anonymise user record — keep row for FK integrity on orders/conversations
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId}@deleted.invalid`,
          passwordHash: "DELETED",
          profileImageUrl: null,
          referralCode: null,
          referredBy: null,
          referralRewards: Prisma.DbNull,
        },
      });
    });

    log.info("auth.account_deleted", { userId });
    return { success: true };
  } catch (e) {
    log.error("auth.account_delete_failed", { userId, error: String(e) });
    return { error: "Something went wrong. Please try again or contact contact@logiclot.io." };
  }
}

/**
 * When credentials sign-in fails, check if the email belongs to an OAuth-only
 * account so we can show a helpful "use Google/LinkedIn" message instead of
 * the generic "invalid email or password" error.
 */
export async function getCredentialSignInError(email: string): Promise<string | null> {
  try {
    const normalised = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalised, mode: "insensitive" } },
      select: { id: true, passwordHash: true },
    });

    if (!user) return null; // generic error is fine

    if (!user.passwordHash || user.passwordHash.length < 10) {
      const linkedAccount = await prisma.account.findFirst({
        where: { userId: user.id },
        select: { provider: true },
      });
      const provider = linkedAccount?.provider;
      const providerName = provider === "google" ? "Google" : provider === "linkedin" ? "LinkedIn" : null;

      if (providerName) {
        return `This account uses ${providerName} sign-in. Please use the "${providerName}" button above to log in.`;
      }
      return "This account doesn't have a password. Please sign in with your social account.";
    }

    return null; // password exists — generic error is fine (wrong password)
  } catch {
    return null;
  }
}

export async function getFoundingExpertStatus(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "EXPERT") return false;

  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: { isFoundingExpert: true, tier: true },
  });

  if (!expert) {
    return false
  }

  return !!(expert.tier === "FOUNDING");
}

async function sendVerificationEmail(to: string, token: string) {
  if (!FROM_EMAIL) {
    // Dev fallback: log the link so the developer can follow it
    log.info("auth.verification_link_dev", {
      url: `${APP_URL}/auth/verify?token=${token}`,
    });
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Verify your LogicLot email address",
      html: verificationEmail({ verifyUrl: `${APP_URL}/auth/verify?token=${token}` }),
      headers: {
        'X-Entity-Ref-ID': randomUUID(),
      }
    });
  } catch (e) {
    // Non-fatal — user can request a resend
    log.error("auth.verification_email_send_failed", { to, error: String(e) });
  }
}
