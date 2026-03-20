"use server";

import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as Sentry from "@sentry/nextjs";

// Helper to type the JSON field
interface ReferralRewards {
  expertDiscountCount: number;
  businessDiscountCount: number;
}

export async function getReferralStats(userId: string) {
  try {
    // Verify the caller owns this userId
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== userId) {
      return { error: "Unauthorized" };
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        referralRewards: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Count successful referrals (where reward was granted)
    const referralCount = await prisma.user.count({
      where: { 
        referredBy: user.referralCode,
        referralCompletedAt: { not: null }
      },
    });
    
    // Count pending referrals
     const pendingCount = await prisma.user.count({
      where: { 
        referredBy: user.referralCode,
        referralCompletedAt: null
      },
    });

    return {
      referralCode: user.referralCode,
      referralRewards: user.referralRewards as unknown as ReferralRewards | null,
      referralCount,
      pendingCount
    };
  } catch (error) {
    log.error("referral.fetch_stats_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
    return { error: "Failed to fetch referral stats" };
  }
}

export async function trackUserLogin(userId: string) {
  try {
    // Verify the caller owns this userId
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== userId) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastLoginAt: true, loginDaysCount: true }
    });

    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let shouldUpdate = false;
    let newLoginDaysCount = user.loginDaysCount;

    if (!user.lastLoginAt) {
      shouldUpdate = true;
      newLoginDaysCount = 1;
    } else {
      const lastLogin = new Date(user.lastLoginAt);
      const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      
      if (today.getTime() > lastLoginDate.getTime()) {
        shouldUpdate = true;
        newLoginDaysCount += 1;
      }
    }

    if (shouldUpdate) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: now,
          loginDaysCount: newLoginDaysCount
        }
      });
      
      // Check expert referral condition after login update
      await checkExpertReferralCondition(userId);
    }
  } catch (error) {
    log.error("referral.track_login_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
  }
}

export async function checkExpertReferralCondition(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialistProfile: { include: { solutions: true } } },
    });

    if (!user || !user.referredBy || user.referralCompletedAt) return;

    // Condition: 3 days active
    if (user.loginDaysCount < 3) return;

    // Condition: Added solutions
    const hasSolutions = user.specialistProfile?.solutions && user.specialistProfile.solutions.length > 0;
    if (!hasSolutions) return;

    // Find referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode: user.referredBy },
    });

    if (!referrer) return;

    // Grant Reward: Expert gets 5% off margin for next 2 sales.
    // We store this as "expertDiscountCount: 2"
    const currentRewards = (referrer.referralRewards as unknown as ReferralRewards) || { expertDiscountCount: 0, businessDiscountCount: 0 };
    
    // Increment expert discount count by 2
    const newRewards = {
      ...currentRewards,
      expertDiscountCount: (currentRewards.expertDiscountCount || 0) + 2
    };

    // Update referrer rewards
    await prisma.user.update({
      where: { id: referrer.id },
      data: { referralRewards: newRewards }
    });

    // Mark referral as completed
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCompletedAt: new Date() }
    });

    // Notify the referrer
    await prisma.notification.create({
      data: {
        userId: referrer.id,
        title: "You earned a referral reward!",
        message: "An expert you referred just met the requirements. You've been credited 2 × 5% platform fee discounts — they'll auto-apply on your next two sales.",
        type: "success",
        actionUrl: "/dashboard",
      },
    });

  } catch (error) {
    log.error("referral.check_expert_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
  }
}

export async function checkBusinessReferralCondition(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.referredBy || user.referralCompletedAt) return;

    // Condition: User is buying something. This function should be called AFTER a successful purchase.
    // We assume the purchase logic calls this.

    // Find referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode: user.referredBy },
    });

    if (!referrer) return;

    // Grant Reward: Business owner gets 5% on next buy.
    // We store this as "businessDiscountCount: 1" (or increment)
    const currentRewards = (referrer.referralRewards as unknown as ReferralRewards) || { expertDiscountCount: 0, businessDiscountCount: 0 };
    
    // Increment business discount count by 1
    const newRewards = {
      ...currentRewards,
      businessDiscountCount: (currentRewards.businessDiscountCount || 0) + 1
    };

    // Update referrer rewards
    await prisma.user.update({
      where: { id: referrer.id },
      data: { referralRewards: newRewards }
    });

    // Mark referral as completed
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCompletedAt: new Date() }
    });

    // Notify the referrer
    await prisma.notification.create({
      data: {
        userId: referrer.id,
        title: "You earned a referral reward!",
        message: "A business you referred just made their first purchase. You've been credited a 5% discount on your next purchase — auto-applied at checkout.",
        type: "success",
        actionUrl: "/business",
      },
    });

  } catch (error) {
    log.error("referral.check_business_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
  }
}
