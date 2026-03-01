import { describe, it, expect, beforeEach } from "vitest";
import "../mocks/prisma";
import { prismaMock } from "../mocks/prisma";

// Must import AFTER prisma mock is set up
import { getPersonalizedRecommendations } from "@/lib/recommendation-engine";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSolution(overrides: Record<string, unknown> = {}) {
  return {
    id: "sol-default",
    slug: "sol-default",
    title: "Default Solution",
    category: "Automation",
    shortSummary: "A test solution",
    outcome: null,
    implementationPriceCents: 10000,
    deliveryDays: 7,
    integrations: [] as string[],
    status: "published",
    createdAt: new Date(),
    expert: { displayName: "Expert", slug: "expert-1", verified: true },
    _count: { orders: 0 },
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("getPersonalizedRecommendations", () => {
  const userId = "user-1";

  beforeEach(() => {
    // Sensible defaults: no profile, no past orders, no solutions
    prismaMock.businessProfile.findUnique.mockResolvedValue(null);
    prismaMock.order.findMany.mockResolvedValue([]);
    prismaMock.solution.findMany.mockResolvedValue([]);
  });

  it("returns empty array when no solutions are available", async () => {
    const results = await getPersonalizedRecommendations(userId);
    expect(results).toEqual([]);
  });

  it("returns solutions sorted by tool overlap (user has Zapier + Slack)", async () => {
    prismaMock.businessProfile.findUnique.mockResolvedValue({
      industry: "SaaS",
      companySize: "11-50",
      tools: ["Zapier", "Slack"],
    });

    prismaMock.solution.findMany.mockResolvedValue([
      makeSolution({
        id: "sol-1",
        slug: "sol-1",
        title: "Zapier + Slack Automation",
        integrations: ["Zapier", "Slack"],
        _count: { orders: 2 },
      }),
      makeSolution({
        id: "sol-2",
        slug: "sol-2",
        title: "Only Zapier",
        integrations: ["Zapier"],
        _count: { orders: 5 },
      }),
      makeSolution({
        id: "sol-3",
        slug: "sol-3",
        title: "HubSpot CRM",
        integrations: ["HubSpot"],
        _count: { orders: 10 },
      }),
    ]);

    const results = await getPersonalizedRecommendations(userId, 3);

    // sol-1 (2 overlaps) > sol-2 (1 overlap) > sol-3 (0 overlaps)
    expect(results[0].id).toBe("sol-1");
    expect(results[1].id).toBe("sol-2");
    expect(results[2].id).toBe("sol-3");
  });

  it("excludes already-purchased solutions", async () => {
    prismaMock.businessProfile.findUnique.mockResolvedValue({
      industry: "SaaS",
      companySize: "11-50",
      tools: ["Zapier"],
    });

    prismaMock.order.findMany.mockResolvedValue([
      { solutionId: "purchased-1" },
    ]);

    prismaMock.solution.findMany.mockResolvedValue([
      makeSolution({ id: "sol-available", slug: "sol-available", title: "Available" }),
    ]);

    const results = await getPersonalizedRecommendations(userId);

    // Verify the prisma query excluded purchased solutions
    expect(prismaMock.solution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "published",
          id: { notIn: ["purchased-1"] },
        }),
      })
    );

    // We still get the non-purchased solution back
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("sol-available");
  });

  it("falls back to popularity when no tool overlap", async () => {
    prismaMock.businessProfile.findUnique.mockResolvedValue({
      industry: "SaaS",
      companySize: "11-50",
      tools: ["Notion"], // No solutions use Notion
    });

    prismaMock.solution.findMany.mockResolvedValue([
      makeSolution({
        id: "sol-popular",
        slug: "sol-popular",
        title: "Popular Solution",
        integrations: ["Zapier"],
        _count: { orders: 20 },
      }),
      makeSolution({
        id: "sol-unpopular",
        slug: "sol-unpopular",
        title: "Unpopular Solution",
        integrations: ["HubSpot"],
        _count: { orders: 1 },
      }),
    ]);

    const results = await getPersonalizedRecommendations(userId, 2);

    // Both have 0 tool overlap, so popularity decides
    expect(results[0].id).toBe("sol-popular");
    expect(results[0].orderCount).toBe(20);
    expect(results[1].id).toBe("sol-unpopular");
    expect(results[1].orderCount).toBe(1);
  });

  it("limits results to the specified limit", async () => {
    prismaMock.solution.findMany.mockResolvedValue([
      makeSolution({ id: "sol-1", slug: "sol-1", _count: { orders: 5 } }),
      makeSolution({ id: "sol-2", slug: "sol-2", _count: { orders: 4 } }),
      makeSolution({ id: "sol-3", slug: "sol-3", _count: { orders: 3 } }),
      makeSolution({ id: "sol-4", slug: "sol-4", _count: { orders: 2 } }),
      makeSolution({ id: "sol-5", slug: "sol-5", _count: { orders: 1 } }),
    ]);

    const results = await getPersonalizedRecommendations(userId, 2);

    expect(results).toHaveLength(2);
  });

  it("works when user has no business profile (returns popularity-based results)", async () => {
    // profile is null (default from beforeEach)
    prismaMock.solution.findMany.mockResolvedValue([
      makeSolution({
        id: "sol-popular",
        slug: "sol-popular",
        title: "Popular",
        integrations: ["Zapier"],
        _count: { orders: 15 },
      }),
      makeSolution({
        id: "sol-less-popular",
        slug: "sol-less-popular",
        title: "Less Popular",
        integrations: ["Slack"],
        _count: { orders: 3 },
      }),
    ]);

    const results = await getPersonalizedRecommendations(userId, 5);

    // No profile means userTools = [], so toolOverlap = 0 for all.
    // Sorting falls back to popularity (order count).
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe("sol-popular");
    expect(results[1].id).toBe("sol-less-popular");
  });

  it("maps solution fields correctly to RecommendedSolution shape", async () => {
    prismaMock.solution.findMany.mockResolvedValue([
      makeSolution({
        id: "sol-x",
        slug: "sol-x",
        title: "X Solution",
        category: "CRM",
        shortSummary: "Short summary",
        outcome: "Saves 10h/week",
        implementationPriceCents: 25000,
        deliveryDays: 14,
        integrations: ["HubSpot", "Slack"],
        expert: { displayName: "Jane Doe", slug: "jane-doe", verified: true },
        _count: { orders: 8 },
      }),
    ]);

    const [result] = await getPersonalizedRecommendations(userId, 1);

    expect(result).toEqual({
      id: "sol-x",
      slug: "sol-x",
      title: "X Solution",
      category: "CRM",
      shortSummary: "Short summary",
      outcome: "Saves 10h/week",
      implementationPriceCents: 25000,
      deliveryDays: 14,
      integrations: ["HubSpot", "Slack"],
      expertName: "Jane Doe",
      expertSlug: "jane-doe",
      expertVerified: true,
      orderCount: 8,
    });
  });

  it("performs case-insensitive tool matching", async () => {
    prismaMock.businessProfile.findUnique.mockResolvedValue({
      industry: "SaaS",
      companySize: "11-50",
      tools: ["zapier", "SLACK"],
    });

    prismaMock.solution.findMany.mockResolvedValue([
      makeSolution({
        id: "sol-case",
        slug: "sol-case",
        integrations: ["Zapier", "slack"],
        _count: { orders: 1 },
      }),
    ]);

    const results = await getPersonalizedRecommendations(userId, 1);
    // Both tools should match despite different casing
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("sol-case");
  });
});
