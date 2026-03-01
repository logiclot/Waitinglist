// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";

import {
  selectRole,
  createBusinessProfile,
  createSpecialistProfile,
} from "@/actions/onboarding";

function makeFormData(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        fd.append(key, v);
      }
    } else {
      fd.set(key, value);
    }
  }
  return fd;
}

// ── selectRole ───────────────────────────────────────────────────────────────

describe("selectRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "test@example.com", name: "Test User", role: "USER" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const result = await selectRole("BUSINESS");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("updates user role to BUSINESS", async () => {
    prismaMock.user.update.mockResolvedValue({});

    const result = await selectRole("BUSINESS");
    expect(result).toEqual({ success: true });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { role: "BUSINESS" },
    });
  });

  it("updates user role to EXPERT", async () => {
    prismaMock.user.update.mockResolvedValue({});

    const result = await selectRole("EXPERT");
    expect(result).toEqual({ success: true });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { role: "EXPERT" },
    });
  });

  it("returns error when prisma throws", async () => {
    prismaMock.user.update.mockRejectedValue(new Error("DB error"));

    const result = await selectRole("BUSINESS");
    expect(result).toEqual({ error: "Failed to update role" });
  });
});

// ── createBusinessProfile ────────────────────────────────────────────────────

describe("createBusinessProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "biz@example.com", name: "Biz User", role: "BUSINESS" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const fd = makeFormData({ companyName: "Test Co" });
    const result = await createBusinessProfile(null, fd);
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when companyName is missing", async () => {
    const fd = makeFormData({ fullName: "John Doe" });
    const result = await createBusinessProfile(null, fd);
    expect(result).toEqual({ error: "Company Name is required" });
  });

  it("creates business profile successfully", async () => {
    prismaMock.businessProfile.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const fd = makeFormData({
      companyName: "Acme Corp",
      fullName: "John Doe",
      website: "https://acme.com",
      country: "US",
      timezone: "America/New_York",
      industry: "Technology",
      companySize: "10-50",
      tools: ["Slack", "HubSpot"],
      businessPrimaryProblems: ["Lead gen", "Data entry"],
      intent: "Exploring",
    });

    const result = await createBusinessProfile(null, fd);
    expect(result).toEqual({ success: true });
    expect(prismaMock.businessProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        create: expect.objectContaining({
          userId: "user-1",
          companyName: "Acme Corp",
          country: "US",
          timezone: "America/New_York",
        }),
        update: expect.objectContaining({
          companyName: "Acme Corp",
        }),
      })
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { onboardingCompletedAt: expect.any(Date) },
    });
  });

  it("returns error when prisma throws", async () => {
    prismaMock.businessProfile.upsert.mockRejectedValue(new Error("DB error"));

    const fd = makeFormData({ companyName: "Fail Co" });
    const result = await createBusinessProfile(null, fd);
    expect(result).toEqual({ error: "Failed to create profile" });
  });
});

// ── createSpecialistProfile ──────────────────────────────────────────────────

describe("createSpecialistProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "expert@example.com", name: "Expert User", role: "SPECIALIST" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const fd = makeFormData({ legalFullName: "Jane Doe" });
    const result = await createSpecialistProfile(null, fd);
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when required fields are missing", async () => {
    const fd = makeFormData({ legalFullName: "Jane Doe" });
    // Missing country, timezone, yearsExperience, pastImplementations, typicalProjectSize, primaryTool, availability
    const result = await createSpecialistProfile(null, fd);
    expect(result).toEqual({ error: "Required fields missing" });
  });

  it("returns error when agency fields are missing for agency type", async () => {
    const fd = makeFormData({
      legalFullName: "Jane Doe",
      country: "US",
      timezone: "America/New_York",
      roleType: "Agency",
      yearsExperience: "5",
      approxImplementations: "20",
      typicalProjectSize: "$5k-$10k",
      primaryTool: "Zapier",
      availability: "Full-time",
      legalAgreed: "on",
      authorityConsent: "on",
    });
    // Missing agencyName and businessIdentificationNumber
    const result = await createSpecialistProfile(null, fd);
    expect(result).toEqual({ error: "Agency details required" });
  });

  it("returns error when legal agreements not accepted", async () => {
    const fd = makeFormData({
      legalFullName: "Jane Doe",
      country: "US",
      timezone: "America/New_York",
      yearsExperience: "5",
      approxImplementations: "20",
      typicalProjectSize: "$5k-$10k",
      primaryTool: "Zapier",
      availability: "Full-time",
      // legalAgreed and authorityConsent missing
    });
    const result = await createSpecialistProfile(null, fd);
    expect(result).toEqual({ error: "You must agree to the terms and authority consent." });
  });

  it("creates specialist profile successfully (individual)", async () => {
    prismaMock.specialistProfile.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const fd = makeFormData({
      legalFullName: "Jane Doe",
      country: "US",
      timezone: "America/New_York",
      yearsExperience: "5",
      approxImplementations: "20",
      typicalProjectSize: "$5k-$10k",
      primaryTool: "Zapier",
      availability: "Full-time",
      legalAgreed: "on",
      authorityConsent: "on",
      portfolioUrl: "https://jane.dev",
    });

    const result = await createSpecialistProfile(null, fd);
    expect(result).toEqual({ success: true });
    expect(prismaMock.specialistProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        create: expect.objectContaining({
          userId: "user-1",
          legalFullName: "Jane Doe",
          displayName: "Jane Doe",
          country: "US",
          timezone: "America/New_York",
          isAgency: false,
          agencyName: null,
          businessIdentificationNumber: null,
          yearsExperience: "5",
          primaryTool: "Zapier",
          status: "APPROVED",
        }),
      })
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { onboardingCompletedAt: expect.any(Date) },
    });
  });

  it("creates specialist profile successfully (agency)", async () => {
    prismaMock.specialistProfile.upsert.mockResolvedValue({});
    prismaMock.user.update.mockResolvedValue({});

    const fd = makeFormData({
      legalFullName: "Jane Doe",
      country: "DE",
      timezone: "Europe/Berlin",
      roleType: "Agency",
      agencyName: "Automation Agency GmbH",
      businessIdentificationNumber: "DE123456789",
      agencyTeamSize: "5-10",
      yearsExperience: "8",
      approxImplementations: "50",
      typicalProjectSize: "$10k-$25k",
      primaryTool: "Make",
      availability: "Part-time",
      legalAgreed: "on",
      authorityConsent: "on",
    });

    const result = await createSpecialistProfile(null, fd);
    expect(result).toEqual({ success: true });
    expect(prismaMock.specialistProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          isAgency: true,
          agencyName: "Automation Agency GmbH",
          businessIdentificationNumber: "DE123456789",
          displayName: "Automation Agency GmbH",
        }),
      })
    );
  });

  it("returns error when prisma throws", async () => {
    prismaMock.specialistProfile.upsert.mockRejectedValue(new Error("DB error"));

    const fd = makeFormData({
      legalFullName: "Jane Doe",
      country: "US",
      timezone: "America/New_York",
      yearsExperience: "5",
      approxImplementations: "20",
      typicalProjectSize: "$5k-$10k",
      primaryTool: "Zapier",
      availability: "Full-time",
      legalAgreed: "on",
      authorityConsent: "on",
    });

    const result = await createSpecialistProfile(null, fd);
    expect(result).toEqual({ error: "Failed to create profile" });
  });
});
