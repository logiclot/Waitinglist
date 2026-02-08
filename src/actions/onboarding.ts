"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function selectRole(role: "BUSINESS" | "SPECIALIST") {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update role" };
  }
}

export async function createBusinessProfile(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  // Phase 1 Fields (Updated)
  const companyName = formData.get("companyName") as string;
  const fullName = formData.get("fullName") as string;
  const website = formData.get("website") as string;
  const country = formData.get("country") as string;
  const timezone = formData.get("timezone") as string;
  
  const industry = formData.get("industry") as string;
  const companySize = formData.get("companySize") as string; // teamSize
  
  const tools = formData.getAll("tools") as string[]; // coreTools
  const businessPrimaryProblems = formData.getAll("businessPrimaryProblems") as string[]; // painPoints
  
  const intent = formData.get("intent") as string; // decisionContext

  // Derived fields
  const nameParts = fullName ? fullName.trim().split(" ") : ["Business", "User"];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "";
  
  const jobRole = "Admin"; // Placeholder
  const howHeard = "Direct"; // Placeholder

  if (!companyName) {
    return { error: "Company Name is required" };
  }

  try {
    await prisma.businessProfile.upsert({
      where: { userId: session.user.id },
      update: {
        companyName,
        website,
        country,
        timezone,
        industry,
        companySize,
        tools,
        businessPrimaryProblems,
        decisionContext: intent,
        // Legacy/Placeholders
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
        timezone,
        industry,
        companySize,
        tools,
        businessPrimaryProblems,
        decisionContext: intent,
        // Legacy/Placeholders
        firstName,
        lastName,
        jobRole,
        howHeard,
        interests: tools,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompletedAt: new Date() },
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create profile" };
  }
}

export async function createSpecialistProfile(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  // --- Step 1: Identity ---
  const legalFullName = formData.get("legalFullName") as string;
  const country = formData.get("country") as string;
  const timezone = formData.get("timezone") as string;
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

  // --- Step 4: Legal ---
  // Checkboxes are usually "on" if checked, null if not.
  const legalAgreed = formData.get("legalAgreed") === "on";
  const authorityConsent = formData.get("authorityConsent") === "on";
  const marketingConsent = formData.get("marketingConsent") === "on";

  // Required Fields Validation
  if (!legalFullName || !country || !timezone || !yearsExperience || !pastImplementations || !typicalProjectSize || !primaryTool || !availability) {
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

  // Display Name logic (use Agency Name if Agency, else Legal Name)
  const displayName = isAgency && agencyName ? agencyName : legalFullName;

  try {
    await prisma.specialistProfile.upsert({
      where: { userId: session.user.id },
      update: {
        legalFullName,
        displayName,
        country,
        timezone,
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
        specialties: [], // Deprecated in new flow or empty
        portfolioLinks: [], // Using portfolioUrl now
      },
      create: {
        userId: session.user.id,
        slug,
        
        legalFullName,
        displayName,
        country,
        timezone,
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
      data: { onboardingCompletedAt: new Date() },
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create profile" };
  }
}
