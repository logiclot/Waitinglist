// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";
import { setMockSession } from "../mocks/next-auth";

import {
  createEcosystem,
  updateEcosystem,
  publishEcosystem,
  addSolutionToEcosystem,
  removeSolutionFromEcosystem,
  reorderEcosystemItems,
  deleteEcosystem,
} from "@/actions/ecosystems";

// ── createEcosystem ──────────────────────────────────────────────────────────

describe("createEcosystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "expert@example.com", name: "Expert", role: "EXPERT" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const result = await createEcosystem({ title: "My Stack", description: "A pitch" });
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when expert profile not found", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue(null);

    const result = await createEcosystem({ title: "My Stack", description: "A pitch" });
    expect(result).toEqual({ error: "Expert profile not found" });
  });

  it("creates ecosystem with unique slug", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    // Slug is unique on first try
    prismaMock.ecosystem.findUnique.mockResolvedValue(null);
    prismaMock.ecosystem.create.mockResolvedValue({ id: "eco-1" });

    const result = await createEcosystem({ title: "My Stack", description: "A pitch" });
    expect(result).toEqual({ success: true, ecosystemId: "eco-1" });
    expect(prismaMock.ecosystem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        expertId: "expert-1",
        title: "My Stack",
        slug: "my-stack",
        description: "A pitch",
        isPublished: false,
      }),
    });
  });

  it("appends number to slug when slug already exists", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    // First slug exists, second is unique
    prismaMock.ecosystem.findUnique
      .mockResolvedValueOnce({ id: "existing" }) // "my-stack" exists
      .mockResolvedValueOnce(null); // "my-stack-1" is unique
    prismaMock.ecosystem.create.mockResolvedValue({ id: "eco-2" });

    const result = await createEcosystem({ title: "My Stack", description: "Pitch" });
    expect(result).toEqual({ success: true, ecosystemId: "eco-2" });
    expect(prismaMock.ecosystem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: "my-stack-1",
      }),
    });
  });

  it("returns error when prisma create throws", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue(null);
    prismaMock.ecosystem.create.mockRejectedValue(new Error("DB error"));

    const result = await createEcosystem({ title: "Fail Stack", description: "P" });
    expect(result).toEqual({ error: "Failed to create ecosystem" });
  });
});

// ── updateEcosystem ──────────────────────────────────────────────────────────

describe("updateEcosystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "expert@example.com", name: "Expert", role: "EXPERT" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const result = await updateEcosystem("eco-1", { title: "Updated" });
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when expert profile not found", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue(null);

    const result = await updateEcosystem("eco-1", { title: "Updated" });
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when ecosystem not found", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue(null);

    const result = await updateEcosystem("eco-1", { title: "Updated" });
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when ecosystem belongs to different expert", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "other-expert" });

    const result = await updateEcosystem("eco-1", { title: "Updated" });
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("updates ecosystem successfully", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "expert-1" });
    prismaMock.ecosystem.update.mockResolvedValue({});

    const result = await updateEcosystem("eco-1", { title: "Updated Title", description: "New pitch" });
    expect(result).toEqual({ success: true });
    expect(prismaMock.ecosystem.update).toHaveBeenCalledWith({
      where: { id: "eco-1" },
      data: { title: "Updated Title", description: "New pitch" },
    });
  });
});

// ── publishEcosystem ─────────────────────────────────────────────────────────

describe("publishEcosystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "expert@example.com", name: "Expert", role: "EXPERT" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const result = await publishEcosystem("eco-1", true);
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when expert profile not found", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue(null);

    const result = await publishEcosystem("eco-1", true);
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when ecosystem belongs to different expert", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "other-expert", items: [] });

    const result = await publishEcosystem("eco-1", true);
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when trying to publish empty ecosystem", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({
      id: "eco-1",
      expertId: "expert-1",
      slug: "my-stack",
      items: [],
    });

    const result = await publishEcosystem("eco-1", true);
    expect(result).toEqual({ error: "Cannot publish an empty suite. Add at least one solution." });
  });

  it("publishes ecosystem with items successfully", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({
      id: "eco-1",
      expertId: "expert-1",
      slug: "my-stack",
      items: [{ id: "item-1", solution: { id: "sol-1", slug: "sol-slug-1" } }],
    });
    prismaMock.ecosystem.update.mockResolvedValue({});

    const result = await publishEcosystem("eco-1", true);
    expect(result).toEqual({ success: true });
    expect(prismaMock.ecosystem.update).toHaveBeenCalledWith({
      where: { id: "eco-1" },
      data: { isPublished: true },
    });
  });

  it("unpublishes ecosystem successfully (no items check needed)", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({
      id: "eco-1",
      expertId: "expert-1",
      slug: "my-stack",
      items: [],
    });
    prismaMock.ecosystem.update.mockResolvedValue({});

    const result = await publishEcosystem("eco-1", false);
    expect(result).toEqual({ success: true });
    expect(prismaMock.ecosystem.update).toHaveBeenCalledWith({
      where: { id: "eco-1" },
      data: { isPublished: false },
    });
  });
});

// ── addSolutionToEcosystem ───────────────────────────────────────────────────

describe("addSolutionToEcosystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "expert@example.com", name: "Expert", role: "EXPERT" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const result = await addSolutionToEcosystem("eco-1", "sol-1");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when expert profile not found", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue(null);

    const result = await addSolutionToEcosystem("eco-1", "sol-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when ecosystem belongs to different expert", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "other-expert" });

    const result = await addSolutionToEcosystem("eco-1", "sol-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("adds solution at next position when items already exist", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "expert-1" });
    prismaMock.ecosystemItem.findFirst.mockResolvedValue({ position: 2 });
    prismaMock.ecosystemItem.create.mockResolvedValue({});
    prismaMock.solution.findUnique.mockResolvedValue({ slug: "my-solution" });

    const result = await addSolutionToEcosystem("eco-1", "sol-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.ecosystemItem.create).toHaveBeenCalledWith({
      data: {
        ecosystemId: "eco-1",
        solutionId: "sol-1",
        position: 3,
      },
    });
  });

  it("adds solution at position 0 when no items exist", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "expert-1" });
    prismaMock.ecosystemItem.findFirst.mockResolvedValue(null);
    prismaMock.ecosystemItem.create.mockResolvedValue({});
    prismaMock.solution.findUnique.mockResolvedValue({ slug: "my-solution" });

    const result = await addSolutionToEcosystem("eco-1", "sol-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.ecosystemItem.create).toHaveBeenCalledWith({
      data: {
        ecosystemId: "eco-1",
        solutionId: "sol-1",
        position: 0,
      },
    });
  });
});

// ── removeSolutionFromEcosystem ──────────────────────────────────────────────

describe("removeSolutionFromEcosystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "expert@example.com", name: "Expert", role: "EXPERT" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const result = await removeSolutionFromEcosystem("eco-1", "sol-1");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when ecosystem belongs to different expert", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "other-expert" });

    const result = await removeSolutionFromEcosystem("eco-1", "sol-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("removes solution from ecosystem successfully", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "expert-1" });
    prismaMock.ecosystemItem.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.solution.findUnique.mockResolvedValue({ slug: "my-solution" });

    const result = await removeSolutionFromEcosystem("eco-1", "sol-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.ecosystemItem.deleteMany).toHaveBeenCalledWith({
      where: { ecosystemId: "eco-1", solutionId: "sol-1" },
    });
  });
});

// ── reorderEcosystemItems ────────────────────────────────────────────────────

describe("reorderEcosystemItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "expert@example.com", name: "Expert", role: "EXPERT" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const result = await reorderEcosystemItems("eco-1", ["sol-1", "sol-2"]);
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when ecosystem belongs to different expert", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "other-expert" });

    const result = await reorderEcosystemItems("eco-1", ["sol-1", "sol-2"]);
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("reorders items via $transaction successfully", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "expert-1" });
    prismaMock.ecosystemItem.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.$transaction.mockImplementation(async (fns: unknown[]) => {
      if (Array.isArray(fns)) {
        return Promise.all(fns);
      }
      return fns;
    });

    const result = await reorderEcosystemItems("eco-1", ["sol-2", "sol-1", "sol-3"]);
    expect(result).toEqual({ success: true });

    // $transaction should have been called with an array of updateMany promises
    expect(prismaMock.$transaction).toHaveBeenCalled();
    // Each solution should have had updateMany called with correct position
    expect(prismaMock.ecosystemItem.updateMany).toHaveBeenCalledWith({
      where: { ecosystemId: "eco-1", solutionId: "sol-2" },
      data: { position: 0 },
    });
    expect(prismaMock.ecosystemItem.updateMany).toHaveBeenCalledWith({
      where: { ecosystemId: "eco-1", solutionId: "sol-1" },
      data: { position: 1 },
    });
    expect(prismaMock.ecosystemItem.updateMany).toHaveBeenCalledWith({
      where: { ecosystemId: "eco-1", solutionId: "sol-3" },
      data: { position: 2 },
    });
  });
});

// ── deleteEcosystem ──────────────────────────────────────────────────────────

describe("deleteEcosystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession({
      user: { id: "user-1", email: "expert@example.com", name: "Expert", role: "EXPERT" },
    });
  });

  it("returns error when session is null", async () => {
    setMockSession(null);
    const result = await deleteEcosystem("eco-1");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when expert profile not found", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue(null);

    const result = await deleteEcosystem("eco-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns error when ecosystem belongs to different expert", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({ id: "eco-1", expertId: "other-expert" });

    const result = await deleteEcosystem("eco-1");
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("deletes ecosystem successfully", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({
      id: "eco-1",
      expertId: "expert-1",
      isPublished: false,
      slug: "my-stack",
    });
    prismaMock.ecosystem.delete.mockResolvedValue({});

    const result = await deleteEcosystem("eco-1");
    expect(result).toEqual({ success: true });
    expect(prismaMock.ecosystem.delete).toHaveBeenCalledWith({ where: { id: "eco-1" } });
  });

  it("revalidates stacks path when deleting published ecosystem", async () => {
    prismaMock.specialistProfile.findUnique.mockResolvedValue({ id: "expert-1" });
    prismaMock.ecosystem.findUnique.mockResolvedValue({
      id: "eco-1",
      expertId: "expert-1",
      isPublished: true,
      slug: "published-stack",
    });
    prismaMock.ecosystem.delete.mockResolvedValue({});

    const result = await deleteEcosystem("eco-1");
    expect(result).toEqual({ success: true });
  });
});
