// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";

import {
  getAdminData,
  approveSpecialist,
  suspendSpecialist,
  verifySpecialist,
  makeFoundingSpecialist,
  updateSolutionVideoStatus,
} from "@/actions/admin";

// ── getAdminData ─────────────────────────────────────────────────────────────

describe("getAdminData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "admin-1", email: "admin@example.com", name: "Admin", role: "ADMIN" },
    });
  });

  it("returns error when session is null (unauthorized)", async () => {
    setMockSession(null);
    const result = await getAdminData();
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns experts and solutions on success", async () => {
    const mockExperts = [{ id: "sp-1", displayName: "Expert A" }];
    const mockSolutions = [{ id: "sol-1", title: "Solution A", expert: { id: "sp-1" } }];

    prismaMock.specialistProfile.findMany.mockResolvedValue(mockExperts);
    prismaMock.solution.findMany.mockResolvedValue(mockSolutions);

    const result = await getAdminData();
    expect(result).toEqual({ experts: mockExperts, solutions: mockSolutions });
    expect(prismaMock.specialistProfile.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
    expect(prismaMock.solution.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      include: { expert: true },
    });
  });
});

// ── approveSpecialist ────────────────────────────────────────────────────────

describe("approveSpecialist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "admin-1", email: "admin@example.com", name: "Admin", role: "ADMIN" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await approveSpecialist("sp-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("approves specialist with correct data", async () => {
    prismaMock.specialistProfile.update.mockResolvedValue({});

    const result = await approveSpecialist("sp-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.specialistProfile.update).toHaveBeenCalledWith({
      where: { id: "sp-1" },
      data: { status: "APPROVED" },
    });
  });
});

// ── suspendSpecialist ────────────────────────────────────────────────────────

describe("suspendSpecialist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "admin-1", email: "admin@example.com", name: "Admin", role: "ADMIN" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await suspendSpecialist("sp-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("suspends specialist with correct data", async () => {
    prismaMock.specialistProfile.update.mockResolvedValue({});

    const result = await suspendSpecialist("sp-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.specialistProfile.update).toHaveBeenCalledWith({
      where: { id: "sp-1" },
      data: { status: "SUSPENDED" },
    });
  });
});

// ── verifySpecialist ─────────────────────────────────────────────────────────

describe("verifySpecialist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "admin-1", email: "admin@example.com", name: "Admin", role: "ADMIN" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await verifySpecialist("sp-1", true);
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("verifies specialist (set to true)", async () => {
    prismaMock.specialistProfile.update.mockResolvedValue({});

    const result = await verifySpecialist("sp-1", true);
    expect(result).toEqual({ success: true });
    expect(prismaMock.specialistProfile.update).toHaveBeenCalledWith({
      where: { id: "sp-1" },
      data: { verified: true },
    });
  });

  it("un-verifies specialist (set to false)", async () => {
    prismaMock.specialistProfile.update.mockResolvedValue({});

    const result = await verifySpecialist("sp-1", false);
    expect(result).toEqual({ success: true });
    expect(prismaMock.specialistProfile.update).toHaveBeenCalledWith({
      where: { id: "sp-1" },
      data: { verified: false },
    });
  });
});

// ── makeFoundingSpecialist ───────────────────────────────────────────────────

describe("makeFoundingSpecialist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "admin-1", email: "admin@example.com", name: "Admin", role: "ADMIN" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await makeFoundingSpecialist("sp-1", 1);
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("makes specialist founding with given rank", async () => {
    prismaMock.specialistProfile.update.mockResolvedValue({});

    const result = await makeFoundingSpecialist("sp-1", 5);
    expect(result).toEqual({ success: true });
    expect(prismaMock.specialistProfile.update).toHaveBeenCalledWith({
      where: { id: "sp-1" },
      data: { isFoundingExpert: true, foundingRank: 5 },
    });
  });
});

// ── updateSolutionVideoStatus ────────────────────────────────────────────────

describe("updateSolutionVideoStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "admin-1", email: "admin@example.com", name: "Admin", role: "ADMIN" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await updateSolutionVideoStatus("sol-1", "approved");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("approves a solution video", async () => {
    prismaMock.solution.update.mockResolvedValue({});

    const result = await updateSolutionVideoStatus("sol-1", "approved");
    expect(result).toEqual({ success: true });
    expect(prismaMock.solution.update).toHaveBeenCalledWith({
      where: { id: "sol-1" },
      data: {
        demoVideoStatus: "approved",
        demoVideoReviewedAt: expect.any(Date),
      },
    });
  });

  it("rejects a solution video (sets reviewedAt to null)", async () => {
    prismaMock.solution.update.mockResolvedValue({});

    const result = await updateSolutionVideoStatus("sol-1", "rejected");
    expect(result).toEqual({ success: true });
    expect(prismaMock.solution.update).toHaveBeenCalledWith({
      where: { id: "sol-1" },
      data: {
        demoVideoStatus: "rejected",
        demoVideoReviewedAt: null,
      },
    });
  });
});
