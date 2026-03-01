import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";
import { toggleSavedSolution, getSavedSolutions } from "@/actions/saved";

describe("toggleSavedSolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "test@example.com", name: "Test User", role: "BUSINESS" },
    });
  });

  it("returns error when not authenticated", async () => {
    setMockSession(null);
    const result = await toggleSavedSolution("solution-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("saves a solution when not yet saved", async () => {
    prismaMock.savedSolution.findUnique.mockResolvedValue(null);
    prismaMock.savedSolution.create.mockResolvedValue({
      id: "saved-1",
      userId: "user-1",
      solutionId: "solution-1",
    });

    const result = await toggleSavedSolution("solution-1");
    expect(result).toEqual({ saved: true });
    expect(prismaMock.savedSolution.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        solutionId: "solution-1",
      },
    });
  });

  it("unsaves a solution when already saved", async () => {
    prismaMock.savedSolution.findUnique.mockResolvedValue({
      id: "saved-1",
      userId: "user-1",
      solutionId: "solution-1",
    });
    prismaMock.savedSolution.delete.mockResolvedValue({});

    const result = await toggleSavedSolution("solution-1");
    expect(result).toEqual({ saved: false });
    expect(prismaMock.savedSolution.delete).toHaveBeenCalledWith({
      where: { id: "saved-1" },
    });
  });

  it("uses correct compound unique key for lookup", async () => {
    prismaMock.savedSolution.findUnique.mockResolvedValue(null);
    prismaMock.savedSolution.create.mockResolvedValue({
      id: "saved-2",
      userId: "user-1",
      solutionId: "solution-2",
    });

    await toggleSavedSolution("solution-2");
    expect(prismaMock.savedSolution.findUnique).toHaveBeenCalledWith({
      where: {
        userId_solutionId: {
          userId: "user-1",
          solutionId: "solution-2",
        },
      },
    });
  });

  it("returns error when database operation fails", async () => {
    prismaMock.savedSolution.findUnique.mockRejectedValue(new Error("DB error"));

    const result = await toggleSavedSolution("solution-1");
    expect(result).toEqual({ error: "Failed to update" });
  });
});

describe("getSavedSolutions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "test@example.com", name: "Test User", role: "BUSINESS" },
    });
  });

  it("returns empty array when not authenticated", async () => {
    setMockSession(null);
    const result = await getSavedSolutions();
    expect(result).toEqual([]);
  });

  it("returns empty array when no saved solutions", async () => {
    prismaMock.savedSolution.findMany.mockResolvedValue([]);

    const result = await getSavedSolutions();
    expect(result).toEqual([]);
  });

  it("returns solution IDs for saved solutions", async () => {
    prismaMock.savedSolution.findMany.mockResolvedValue([
      { solutionId: "solution-1" },
      { solutionId: "solution-2" },
      { solutionId: "solution-3" },
    ]);

    const result = await getSavedSolutions();
    expect(result).toEqual(["solution-1", "solution-2", "solution-3"]);
    expect(prismaMock.savedSolution.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: { solutionId: true },
    });
  });

  it("returns empty array when database fails", async () => {
    prismaMock.savedSolution.findMany.mockRejectedValue(new Error("DB error"));

    const result = await getSavedSolutions();
    expect(result).toEqual([]);
  });
});
