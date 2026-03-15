import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";
import {
  createSolutionDraft,
  updateSolutionDraft,
  publishSolution,
  archiveSolution,
} from "@/actions/solutions";

// Mock the lock module
vi.mock("@/lib/solutions/lock", () => ({
  getSolutionLockState: vi.fn().mockResolvedValue({ locked: false }),
}));

// Helper to create FormData
function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("createSolutionDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "test@example.com", name: "Test User", role: "SPECIALIST" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await createSolutionDraft(makeFormData({ title: "Test" }));
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when expert profile not found", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue(null);

    const result = await createSolutionDraft(makeFormData({ title: "Test" }));
    expect(result).toEqual({ error: "Expert profile not found" });
  });

  it("returns error when title is missing", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1", status: "APPROVED" });

    const result = await createSolutionDraft(makeFormData({ title: "" }));
    expect(result).toEqual({ error: "Title is required" });
  });

  it("creates draft successfully", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1", status: "APPROVED" });
    prismaMock.solution.create.mockResolvedValue({ id: "solution-1" });

    const result = await createSolutionDraft(
      makeFormData({
        title: "My Solution",
        category: "CRM",
        implementationPriceCents: "5000",
        deliveryDays: "14",
        supportDays: "30",
        lastStep: "2",
      })
    );

    expect(result).toEqual({ success: true, solutionId: "solution-1" });
    expect(prismaMock.solution.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        expertId: "expert-1",
        title: "My Solution",
        category: "CRM",
        implementationPriceCents: 5000,
        deliveryDays: 14,
        supportDays: 30,
        status: "draft",
        lastStep: 2,
      }),
    });
  });

  it("returns error when prisma create fails", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1", status: "APPROVED" });
    prismaMock.solution.create.mockRejectedValue(new Error("DB error"));

    const result = await createSolutionDraft(makeFormData({ title: "Test" }));
    expect(result).toEqual({ error: "DB error" });
  });
});

describe("updateSolutionDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "test@example.com", name: "Test User", role: "SPECIALIST" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await updateSolutionDraft("sol-1", { title: "Updated" });
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when solution not found", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1" });
    prismaMock.solution.findUnique.mockResolvedValue(null);

    const result = await updateSolutionDraft("nonexistent", { title: "Updated" });
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when user is not the owner", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1" });
    prismaMock.solution.findUnique.mockResolvedValue({ id: "sol-1", expertId: "other-expert" });

    const result = await updateSolutionDraft("sol-1", { title: "Updated" });
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when solution is locked", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1" });
    prismaMock.solution.findUnique.mockResolvedValue({ id: "sol-1", expertId: "expert-1" });

    const { getSolutionLockState } = await import("@/lib/solutions/lock");
    (getSolutionLockState as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      locked: true,
      reason: "Active bid exists",
    });

    const result = await updateSolutionDraft("sol-1", { title: "Updated" });
    expect(result).toEqual({ error: "Solution is locked: Active bid exists" });
  });

  it("updates draft successfully", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1" });
    prismaMock.solution.findUnique.mockResolvedValue({ id: "sol-1", expertId: "expert-1" });
    prismaMock.solution.update.mockResolvedValue({});

    const result = await updateSolutionDraft("sol-1", { title: "Updated Title" });
    expect(result).toEqual({ success: true });
    expect(prismaMock.solution.update).toHaveBeenCalledWith({
      where: { id: "sol-1" },
      data: { title: "Updated Title" },
    });
  });
});

describe("publishSolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "test@example.com", name: "Test User", role: "SPECIALIST" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await publishSolution("sol-1");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when not the owner", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1", status: "APPROVED" });
    prismaMock.solution.findUnique.mockResolvedValue({ id: "sol-1", expertId: "other-expert" });

    const result = await publishSolution("sol-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when required fields are missing", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1", status: "APPROVED" });
    prismaMock.solution.findUnique.mockResolvedValue({
      id: "sol-1",
      expertId: "expert-1",
      title: "Test",
      category: "CRM",
      longDescription: null,
      integrations: [],
      included: [],
      implementationPriceCents: 0,
      deliveryDays: 0,
      accessRequired: null,
      paybackPeriod: null,
    });

    const result = await publishSolution("sol-1");
    expect(result).toHaveProperty("error");
    expect(result.error).toContain("Missing required fields");
    expect(result.error).toContain("Description");
    expect(result.error).toContain("Tools");
    expect(result.error).toContain("Included deliverables");
    expect(result.error).toContain("Price");
  });

  it("publishes solution successfully when all fields are present", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1", status: "APPROVED" });
    prismaMock.solution.findUnique.mockResolvedValue({
      id: "sol-1",
      expertId: "expert-1",
      title: "Full Solution",
      category: "CRM",
      longDescription: "Detailed description here",
      integrations: ["Salesforce", "HubSpot"],
      structureConsistent: ["Feature A"],
      structureCustom: ["Feature B"],
      measurableOutcome: "Save 10 hours/week",
      included: ["Setup", "Training", "Documentation"],
      implementationPriceCents: 10000,
      deliveryDays: 7,
      accessRequired: "Admin",
      paybackPeriod: "lt_1m",
      milestones: [{ title: "Full delivery", price: 100, priceCents: 10000 }],
    });
    prismaMock.solution.update.mockResolvedValue({});

    const result = await publishSolution("sol-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.solution.update).toHaveBeenCalledWith({
      where: { id: "sol-1" },
      data: expect.objectContaining({
        status: "published",
        publishedAt: expect.any(Date),
        moderationStatus: "auto_approved",
        approvedAt: expect.any(Date),
      }),
    });
  });
});

describe("archiveSolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "test@example.com", name: "Test User", role: "SPECIALIST" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await archiveSolution("sol-1");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when not the owner", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1" });
    prismaMock.solution.findUnique.mockResolvedValue({ id: "sol-1", expertId: "other-expert" });

    const result = await archiveSolution("sol-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when solution is locked", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1" });
    prismaMock.solution.findUnique.mockResolvedValue({ id: "sol-1", expertId: "expert-1" });

    const { getSolutionLockState } = await import("@/lib/solutions/lock");
    (getSolutionLockState as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      locked: true,
      reason: "Active project exists",
    });

    const result = await archiveSolution("sol-1");
    expect(result).toEqual({ error: "Cannot remove: Active project exists" });
  });

  it("archives solution successfully", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1", userId: "user-1" });
    prismaMock.solution.findUnique.mockResolvedValue({ id: "sol-1", expertId: "expert-1" });
    prismaMock.solution.update.mockResolvedValue({});

    const result = await archiveSolution("sol-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.solution.update).toHaveBeenCalledWith({
      where: { id: "sol-1" },
      data: { status: "archived" },
    });
  });
});
