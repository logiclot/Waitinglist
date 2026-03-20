import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production" && !process.env.SENTRY_DSN) {
  console.warn("[LogicLot] SENTRY_DSN is not set — error monitoring is disabled in production.");
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: !!process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
});
