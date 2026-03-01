/**
 * Thin Sentry wrapper.
 *
 * Call `captureException(err, context)` anywhere on the server to report
 * unexpected errors.  If SENTRY_DSN is not configured (e.g. local dev),
 * the call is a no-op so there are no runtime failures.
 *
 * To enable: add SENTRY_DSN to your .env  (get it from sentry.io → Project Settings → DSN)
 */

import * as Sentry from "@sentry/nextjs";

export function captureException(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (!process.env.SENTRY_DSN) return; // Silently skip in dev / if not configured

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Sentry.withScope((scope: any) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

export function setUser(id: string, email?: string): void {
  if (!process.env.SENTRY_DSN) return;
  Sentry.setUser({ id, email });
}

export function clearUser(): void {
  Sentry.setUser(null);
}
