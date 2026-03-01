// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../mocks/prisma";
import "../mocks/next-auth";
import "../mocks/common";
import { prismaMock } from "../mocks/prisma";

import {
  getReferralStats,
  trackUserLogin,
  checkExpertReferralCondition,
  checkBusinessReferralCondition,
} from "@/actions/referral";

// ── getReferralStats ─────────────────────────────────────────────────────────

describe("getReferralStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when user not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await getReferralStats("nonexistent");
    expect(result).toEqual({ error: "User not found" });
  });

  it("returns referral code, rewards, and counts", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      referralCode: "ABC123",
      referralRewards: { expertDiscountCount: 2, businessDiscountCount: 1 },
    });
    prismaMock.user.count
      .mockResolvedValueOnce(3) // referralCount (completed)
      .mockResolvedValueOnce(1); // pendingCount

    const result = await getReferralStats("user-1");
    expect(result).toEqual({
      referralCode: "ABC123",
      referralRewards: { expertDiscountCount: 2, businessDiscountCount: 1 },
      referralCount: 3,
      pendingCount: 1,
    });
  });

  it("returns error when prisma throws", async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error("DB error"));

    const result = await getReferralStats("user-1");
    expect(result).toEqual({ error: "Failed to fetch referral stats" });
  });
});

// ── trackUserLogin ───────────────────────────────────────────────────────────

describe("trackUserLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when user not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await trackUserLogin("nonexistent");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("increments loginDaysCount on first login (no lastLoginAt)", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ lastLoginAt: null, loginDaysCount: 0 }) // trackUserLogin lookup
      .mockResolvedValueOnce(null); // checkExpertReferralCondition lookup (user has no referredBy)

    prismaMock.user.update.mockResolvedValue({});

    await trackUserLogin("user-1");
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        lastLoginAt: expect.any(Date),
        loginDaysCount: 1,
      },
    });
  });

  it("increments loginDaysCount on a new day", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    prismaMock.user.findUnique
      .mockResolvedValueOnce({ lastLoginAt: yesterday, loginDaysCount: 5 }) // trackUserLogin
      .mockResolvedValueOnce(null); // checkExpertReferralCondition (user not found, skips)

    prismaMock.user.update.mockResolvedValue({});

    await trackUserLogin("user-1");
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        lastLoginAt: expect.any(Date),
        loginDaysCount: 6,
      },
    });
  });

  it("does not increment loginDaysCount for same day login", async () => {
    const today = new Date();

    prismaMock.user.findUnique.mockResolvedValue({ lastLoginAt: today, loginDaysCount: 3 });

    await trackUserLogin("user-1");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});

// ── checkExpertReferralCondition ─────────────────────────────────────────────

describe("checkExpertReferralCondition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips when user not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await checkExpertReferralCondition("nonexistent");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("skips when user has no referredBy", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      referredBy: null,
      referralCompletedAt: null,
      loginDaysCount: 5,
      specialistProfile: { solutions: [{ id: "sol-1" }] },
    });

    await checkExpertReferralCondition("user-1");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    // Only the initial findUnique, no further calls
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
  });

  it("skips when referral already completed", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      referredBy: "REF123",
      referralCompletedAt: new Date(),
      loginDaysCount: 5,
      specialistProfile: { solutions: [{ id: "sol-1" }] },
    });

    await checkExpertReferralCondition("user-1");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("skips when loginDaysCount is less than 3", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      referredBy: "REF123",
      referralCompletedAt: null,
      loginDaysCount: 2,
      specialistProfile: { solutions: [{ id: "sol-1" }] },
    });

    await checkExpertReferralCondition("user-1");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("skips when user has no solutions", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      referredBy: "REF123",
      referralCompletedAt: null,
      loginDaysCount: 5,
      specialistProfile: { solutions: [] },
    });

    await checkExpertReferralCondition("user-1");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("skips when referrer not found", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: "user-1",
        referredBy: "REF123",
        referralCompletedAt: null,
        loginDaysCount: 5,
        specialistProfile: { solutions: [{ id: "sol-1" }] },
      })
      .mockResolvedValueOnce(null); // referrer not found

    await checkExpertReferralCondition("user-1");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("grants reward when all conditions met", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: "user-1",
        referredBy: "REF123",
        referralCompletedAt: null,
        loginDaysCount: 3,
        specialistProfile: { solutions: [{ id: "sol-1" }] },
      })
      .mockResolvedValueOnce({
        id: "referrer-1",
        referralCode: "REF123",
        referralRewards: { expertDiscountCount: 0, businessDiscountCount: 0 },
      });

    prismaMock.user.update.mockResolvedValue({});
    prismaMock.notification.create.mockResolvedValue({});

    await checkExpertReferralCondition("user-1");

    // Referrer rewards updated (expertDiscountCount incremented by 2)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "referrer-1" },
      data: { referralRewards: { expertDiscountCount: 2, businessDiscountCount: 0 } },
    });

    // Referral marked as completed on the referred user
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { referralCompletedAt: expect.any(Date) },
    });

    // Notification created for referrer
    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "referrer-1",
        type: "success",
      }),
    });
  });
});

// ── checkBusinessReferralCondition ───────────────────────────────────────────

describe("checkBusinessReferralCondition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips when user not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await checkBusinessReferralCondition("nonexistent");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("skips when user has no referredBy", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      referredBy: null,
      referralCompletedAt: null,
    });

    await checkBusinessReferralCondition("user-1");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("skips when referral already completed", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      referredBy: "REF456",
      referralCompletedAt: new Date(),
    });

    await checkBusinessReferralCondition("user-1");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("skips when referrer not found", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: "user-1",
        referredBy: "REF456",
        referralCompletedAt: null,
      })
      .mockResolvedValueOnce(null); // referrer not found

    await checkBusinessReferralCondition("user-1");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("grants reward after purchase when conditions are met", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: "user-1",
        referredBy: "REF456",
        referralCompletedAt: null,
      })
      .mockResolvedValueOnce({
        id: "referrer-1",
        referralCode: "REF456",
        referralRewards: { expertDiscountCount: 0, businessDiscountCount: 0 },
      });

    prismaMock.user.update.mockResolvedValue({});
    prismaMock.notification.create.mockResolvedValue({});

    await checkBusinessReferralCondition("user-1");

    // Referrer rewards updated (businessDiscountCount incremented by 1)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "referrer-1" },
      data: { referralRewards: { expertDiscountCount: 0, businessDiscountCount: 1 } },
    });

    // Referral marked as completed on the referred user
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { referralCompletedAt: expect.any(Date) },
    });

    // Notification created for referrer
    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "referrer-1",
        type: "success",
        actionUrl: "/business",
      }),
    });
  });

  it("accumulates rewards on existing rewards", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: "user-2",
        referredBy: "REF789",
        referralCompletedAt: null,
      })
      .mockResolvedValueOnce({
        id: "referrer-2",
        referralCode: "REF789",
        referralRewards: { expertDiscountCount: 4, businessDiscountCount: 2 },
      });

    prismaMock.user.update.mockResolvedValue({});
    prismaMock.notification.create.mockResolvedValue({});

    await checkBusinessReferralCondition("user-2");

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "referrer-2" },
      data: { referralRewards: { expertDiscountCount: 4, businessDiscountCount: 3 } },
    });
  });
});
