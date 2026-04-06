"use server";

import { foundingExperts } from "@/data/experts";
import { Analytics } from "@/lib/analytics";
import { authOptions } from "@/lib/auth";
import { TIER_THRESHOLDS } from "@/lib/commission";
import { welcomeEmail } from "@/lib/email-templates";
import { log } from "@/lib/logger";
import { createNotification } from "@/lib/notifications";
import {
  fireBusinessOnboardingNotifications,
  fireExpertOnboardingNotifications,
} from "@/lib/onboarding-notifications";
import { prisma } from "@/lib/prisma";
import { getFromEmail, resend } from "@/lib/resend";
import type { Role } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { getServerSession } from "next-auth";
import { randomUUID } from 'node:crypto';

const FROM_EMAIL = getFromEmail();

/** Converts "JOHN DOE" or "john doe" → "John Doe" */
function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function sendWelcomeEmail(userId: string, role: "business" | "expert") {
  if (!FROM_EMAIL) return;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        businessProfile: { select: { firstName: true, freeDiscoveryScansRemaining: true } },
        specialistProfile: { select: { displayName: true, legalFullName: true } },
      },
    });
    if (!user?.email) return;

    const firstName =
      role === "business"
        ? (user.businessProfile?.firstName ?? "there")
        : (user.specialistProfile?.displayName ?? user.specialistProfile?.legalFullName ?? "there");

    const hasFreeScan = role === "business" && (user.businessProfile?.freeDiscoveryScansRemaining ?? 0) > 0;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: role === "business"
        ? "You're all set on LogicLot. Here's what to do next"
        : "Welcome to LogicLot. Your profile is live",
      html: welcomeEmail({ firstName, role, hasFreeScan }),
      headers: {
        'X-Entity-Ref-ID': randomUUID(),
      }
    });
  } catch (e) {
    log.error("onboarding.welcome_email_failed", { userId, error: String(e) });
  }
}

export async function selectRole(role: Role) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  if (role === "ADMIN") {
    return { error: "Invalid role" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });
    return { success: true };
  } catch (e) {
    log.error("onboarding.select_role_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to update role" };
  }
}

export async function createBusinessProfile(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  // Phase 1 Fields (Updated)
  const companyName = (formData.get("companyName") as string) || "";
  const fullName = formData.get("fullName") as string;
  const jobTitle = (formData.get("jobTitle") as string) || "";
  const website = formData.get("website") as string;
  const country = formData.get("country") as string;

  const industry = formData.get("industry") as string;
  const companySize = formData.get("companySize") as string; // teamSize

  const tools = formData.getAll("tools") as string[]; // coreTools
  const businessPrimaryProblems = formData.getAll("businessPrimaryProblems") as string[]; // painPoints

  const intent = formData.get("intent") as string; // decisionContext
  const profileImageUrl = (formData.get("profileImageUrl") as string) || null;

  // Derived fields — normalize casing ("JOHN DOE" → "John Doe")
  const normalizedName = fullName ? toTitleCase(fullName.trim()) : "";
  const nameParts = normalizedName ? normalizedName.split(" ") : ["Business", "User"];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "";

  const jobRole = jobTitle || "Admin";
  const howHeard = "Direct"; // Placeholder

  try {
    await prisma.businessProfile.upsert({
      where: { userId: session.user.id },
      update: {
        companyName,
        website,
        country,
        industry,
        companySize,
        tools,
        businessPrimaryProblems,
        decisionContext: intent,
        firstName,
        lastName,
        jobRole,
        howHeard,
        interests: tools,
      },
      create: {
        userId: session.user.id,
        companyName,
        website,
        country,
        industry,
        companySize,
        tools,
        businessPrimaryProblems,
        decisionContext: intent,
        firstName,
        lastName,
        jobRole,
        howHeard,
        interests: tools,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompletedAt: new Date(),
        ...(profileImageUrl && { profileImageUrl }),
      },
    });

    // Grant 1 free Discovery Scan if the user signed up via the waitlist
    grantWaitlistFreeDiscoveryScan(session.user.id).catch((err) => {
      log.warn("onboarding.free_scan_grant_failed", { error: String(err) });
      Sentry.captureException(err);
    });

    sendWelcomeEmail(session.user.id, "business").catch((err) => {
      log.warn("onboarding.welcome_email_failed", { error: String(err) });
      Sentry.captureException(err);
    });
    Analytics.onboardingCompleted(session.user.id, { role: "BUSINESS" });
    fireBusinessOnboardingNotifications(session.user.id).catch((err) => {
      log.warn("onboarding.business_notifications_failed", { error: String(err) });
      Sentry.captureException(err);
    });

    return { success: true };
  } catch (e) {
    log.error("onboarding.create_business_profile_failed", { error: String(e) });
    return { error: "Failed to create profile" };
  }
}

/**
 * Checks if the user signed up via the waitlist (as a business) and grants
 * 1 free Discovery Scan if they haven't already received one.
 * Safe to call multiple times — only grants once (idempotent).
 */
async function grantWaitlistFreeDiscoveryScan(userId: string) {
  // Look up the user's email to check against waitlist
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, businessProfile: { select: { id: true, freeDiscoveryScansRemaining: true } } },
  });
  if (!user?.email || !user.businessProfile) return;

  // Already granted? Skip (idempotent)
  if (user.businessProfile.freeDiscoveryScansRemaining > 0) return;

  // Check if this email exists on the waitlist as a business signup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const waitlistEntry = await (prisma as any).waitlistSignup.findUnique({
    where: { email: user.email },
    select: { role: true },
  });

  if (!waitlistEntry || waitlistEntry.role !== "business") return;

  // Grant 1 free Discovery Scan
  await prisma.businessProfile.update({
    where: { id: user.businessProfile.id },
    data: { freeDiscoveryScansRemaining: 1 },
  });

  // Notify the user
  await createNotification(
    userId,
    "🎁 Free Discovery Scan unlocked!",
    "As a waitlist member, you have 1 free Discovery Scan. Let our experts assess your business and propose where automation can save you the most time and money.",
    "success",
    "/jobs/discovery"
  );

  log.info("onboarding.free_discovery_scan_granted", { userId });
}

export async function createSpecialistProfile(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return { error: "Not authenticated" };

  // --- Step 1: Identity — normalize casing ("JOHN DOE" → "John Doe") ---
  const rawName = formData.get("legalFullName") as string;
  const legalFullName = rawName ? toTitleCase(rawName.trim()) : rawName;
  const rawDisplay = (formData.get("displayName") as string) || legalFullName;
  const displayNameInput = rawDisplay ? toTitleCase(rawDisplay.trim()) : rawDisplay;
  const country = formData.get("country") as string;
  const isAgency = formData.get("roleType") === "Agency";

  const agencyName = formData.get("agencyName") as string;
  const businessIdentificationNumber = formData.get("businessIdentificationNumber") as string;
  const agencyTeamSize = formData.get("agencyTeamSize") as string;

  // --- Step 2: Experience ---
  const yearsExperience = formData.get("yearsExperience") as string;
  const pastImplementations = formData.get("approxImplementations") as string; // Mapping to pastImplementations
  const typicalProjectSize = formData.get("typicalProjectSize") as string;
  const clientAcquisitionSource = formData.getAll("clientAcquisitionSource") as string[];
  const portfolioUrl = formData.get("portfolioUrl") as string;

  // --- Step 3: Tools & Capacity ---
  const primaryTool = formData.get("primaryTool") as string;
  const tools = formData.getAll("secondaryTools") as string[]; // Secondary tools
  const availability = formData.get("availability") as string; // Weekly capacity

  const profileImageUrl = (formData.get("profileImageUrl") as string) || null;

  // --- Step 4: Legal ---
  // Checkboxes are usually "on" if checked, null if not.
  const legalAgreed = formData.get("legalAgreed") === "on";
  const authorityConsent = formData.get("authorityConsent") === "on";
  const marketingConsent = formData.get("marketingConsent") === "on";

  // Required Fields Validation
  if (!legalFullName || !country || !yearsExperience || !pastImplementations || !typicalProjectSize || !primaryTool || !availability) {
    return { error: "Required fields missing" };
  }

  if (isAgency && (!agencyName || !businessIdentificationNumber)) {
    return { error: "Agency details required" };
  }

  if (!legalAgreed || !authorityConsent) {
    return { error: "You must agree to the terms and authority consent." };
  }

  // Generate a slug (using legal name or agency name)
  const baseName = isAgency && agencyName ? agencyName : legalFullName;
  const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substr(2, 4);

  // Display Name: user input → agency name fallback → legal name
  const displayName = isAgency && agencyName ? agencyName : (displayNameInput || legalFullName);

  try {
    await prisma.specialistProfile.upsert({
      where: { userId: session.user.id },
      update: {
        legalFullName,
        displayName,
        country,
        isAgency,
        isFoundingExpert: foundingExperts.includes(session.user.email),
        platformFeePercentage: foundingExperts.includes(session.user.email) ? TIER_THRESHOLDS.FOUNDING : TIER_THRESHOLDS.STANDARD,
        agencyName: isAgency ? agencyName : null,
        businessIdentificationNumber: isAgency ? businessIdentificationNumber : null,
        agencyTeamSize: isAgency ? agencyTeamSize : null,
        yearsExperience,
        pastImplementations,
        typicalProjectSize,
        clientAcquisitionSource,
        portfolioUrl,

        primaryTool,
        tools, // Secondary
        availability, // Capacity

        legalStatus: legalAgreed ? "accepted" : "pending",
        termsAcceptedAt: new Date(),
        authorityConsent,
        marketingConsent,

        // On update: preserve existing status (do NOT reset a SUSPENDED expert to APPROVED)
        specialties: [], // Deprecated in new flow or empty
        portfolioLinks: [], // Using portfolioUrl now
      },
      create: {
        userId: session.user.id,
        slug,

        legalFullName,
        displayName,
        country,
        isAgency,
        agencyName: isAgency ? agencyName : null,
        businessIdentificationNumber: isAgency ? businessIdentificationNumber : null,
        agencyTeamSize: isAgency ? agencyTeamSize : null,

        yearsExperience,
        pastImplementations,
        typicalProjectSize,
        clientAcquisitionSource,
        portfolioUrl,

        primaryTool,
        tools, // Secondary
        availability, // Capacity

        legalStatus: legalAgreed ? "accepted" : "pending",
        termsAcceptedAt: new Date(),
        authorityConsent,
        marketingConsent,

        // Defaults
        status: "APPROVED",
        specialties: [],
        portfolioLinks: [],
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompletedAt: new Date(),
        ...(profileImageUrl && { profileImageUrl }),
      },
    });

    // Fire-and-forget welcome email
    sendWelcomeEmail(session.user.id, "expert").catch((err) => {
      log.warn("onboarding.welcome_email_failed", { error: String(err) });
      Sentry.captureException(err);
    });
    Analytics.onboardingCompleted(session.user.id, { role: "EXPERT" });
    fireExpertOnboardingNotifications(session.user.id).catch((err) => {
      log.warn("onboarding.expert_notifications_failed", { error: String(err) });
      Sentry.captureException(err);
    });

    return { success: true };
  } catch (e) {
    log.error("onboarding.create_specialist_profile_failed", { error: String(e) });
    return { error: "Failed to create profile" };
  }
}
