import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
  console.warn("[LogicLot] NEXT_PUBLIC_SENTRY_DSN is not set — client error monitoring is disabled.");
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,          // 20% of transactions for performance
  replaysSessionSampleRate: 0.1,  // 10% of sessions (increased from 5% for better coverage at B2B scale)
  replaysOnErrorSampleRate: 1.0,  // 100% when errors occur
});
