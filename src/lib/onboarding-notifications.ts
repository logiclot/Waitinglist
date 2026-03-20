/**
 * Guided onboarding notification flows.
 *
 * Each function is idempotent — it uses wasRecentlyNotified with a very long
 * window so the same notification is never sent twice.
 */
import { createNotification, wasRecentlyNotified } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

// Use a large window (10 years in hours) to make notifications truly one-shot.
const ONCE = 87_600;

// ── Expert onboarding ─────────────────────────────────────────────────────────

export async function fireExpertOnboardingNotifications(userId: string) {
  const checks = await Promise.all([
    wasRecentlyNotified(userId, "💳 Connect Stripe to get paid", ONCE),
    wasRecentlyNotified(userId, "📅 Connect your calendar", ONCE),
    wasRecentlyNotified(userId, "🏅 Publish 3 solutions to unlock your Founding Expert badge", ONCE),
  ]);

  const jobs = [];

  if (!checks[0]) {
    jobs.push(
      createNotification(
        userId,
        "💳 Connect Stripe to get paid",
        "Add your Stripe account so payments are released directly to you when milestones are approved.",
        "alert",
        "/expert/settings"
      )
    );
  }

  if (!checks[1]) {
    jobs.push(
      createNotification(
        userId,
        "📅 Connect your calendar",
        "Let businesses book a demo call straight from your profile — zero back-and-forth.",
        "info",
        "/expert/settings"
      )
    );
  }

  if (!checks[2]) {
    jobs.push(
      createNotification(
        userId,
        "🏅 Publish 3 solutions to unlock your Founding Expert badge",
        "Founding Experts get a reduced platform fee and priority placement. Publish your first 3 solutions to claim it.",
        "info",
        "/expert/solutions/new"
      )
    );
  }

  await Promise.all(jobs);
}

// ── Expert: post-3-solutions ──────────────────────────────────────────────────

export async function checkAndFireSuitesNotification(
  userId: string,
  publishedCount: number
) {
  if (publishedCount < 3) return;
  const already = await wasRecentlyNotified(userId, "🚀 You unlocked Suites", ONCE);
  if (already) return;

  await createNotification(
    userId,
    "🚀 You unlocked Suites",
    "You now have 3 live solutions — bundle them into a Suite. Clients can buy the full stack in one click.",
    "success",
    "/expert/solutions"
  );
}

// ── Expert: post-3-solutions — portfolio customization ────────────────────────

export async function checkAndFirePortfolioNotification(
  userId: string,
  publishedCount: number,
  slug: string | null
) {
  if (publishedCount < 3) return;
  const already = await wasRecentlyNotified(userId, "🎨 Portfolio customization unlocked", ONCE);
  if (already) return;

  await createNotification(
    userId,
    "🎨 Portfolio customization unlocked",
    "You now have 3 published solutions — personalize your portfolio page with custom colors, fonts, cover image, and featured pins.",
    "success",
    slug ? `/p/${slug}` : "/dashboard"
  );
}

// ── Business onboarding ───────────────────────────────────────────────────────

export async function fireBusinessOnboardingNotifications(userId: string) {
  // Check whether this user has a free Discovery Scan (waitlist perk).
  // If so, tailor the Discovery Scan notification to reflect the free credit.
  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { freeDiscoveryScansRemaining: true },
  });
  const hasFreeScan = (profile?.freeDiscoveryScansRemaining ?? 0) > 0;

  const checks = await Promise.all([
    wasRecentlyNotified(userId, "🔍 Browse ready-made solutions", ONCE),
    wasRecentlyNotified(userId, "🧭 Try the Discovery Scan", ONCE),
    wasRecentlyNotified(userId, "✏️ Need something custom?", ONCE),
  ]);

  const jobs = [];

  if (!checks[0]) {
    jobs.push(
      createNotification(
        userId,
        "🔍 Browse ready-made solutions",
        "Explore pre-built automations verified by our team, live in days, not months.",
        "info",
        "/solutions"
      )
    );
  }

  if (!checks[1]) {
    jobs.push(
      createNotification(
        userId,
        "🧭 Try the Discovery Scan",
        hasFreeScan
          ? "You have a free Discovery Scan. Let our experts assess your business and propose where automation can save you the most time and money."
          : "Not sure where to start? Post a Discovery Scan and let an expert map your business and return a custom automation roadmap.",
        "info",
        "/jobs/discovery"
      )
    );
  }

  if (!checks[2]) {
    jobs.push(
      createNotification(
        userId,
        "✏️ Need something custom?",
        "Post a Custom Project brief and get proposals from verified experts, fast.",
        "info",
        "/jobs/new"
      )
    );
  }

  await Promise.all(jobs);
}

// ── Welcome coupon (fires ~24 h after onboarding via cron) ───────────────────

export async function fireWelcomeCoupon(userId: string) {
  const already = await wasRecentlyNotified(userId, "🎁 5% off your first order", ONCE);
  if (already) return;

  await createNotification(
    userId,
    "🎁 5% off your first order",
    'Use code WELCOME5 at checkout for 5% off — available for one week only. Add it in the promo code field on the payment page.',
    "success",
    "/solutions"
  );
}
