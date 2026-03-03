/**
 * In-process sliding-window rate limiter.
 *
 * Suitable for a single-server Node.js deployment.
 * For multi-server / serverless, swap the Map for an Upstash Redis store
 * (drop-in: replace `store` with `new Redis(...)` and use @upstash/ratelimit).
 *
 * Usage (in middleware or route handler):
 *   const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });
 *   const result = limiter.check(ip);
 *   if (!result.success) return new Response("Too Many Requests", { status: 429 });
 */

interface RateWindow {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window length in milliseconds */
  windowMs: number;
}

interface CheckResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function createRateLimiter(opts: RateLimiterOptions) {
  const store = new Map<string, RateWindow>();

  // Periodically clean up expired windows so the Map doesn't grow forever
  const cleanup = () => {
    const now = Date.now();
    store.forEach((window, key) => {
      if (now > window.resetAt) store.delete(key);
    });
  };
  // Run cleanup every 5 minutes (only on server side)
  if (typeof setInterval !== "undefined") {
    setInterval(cleanup, 5 * 60 * 1000);
  }

  return {
    check(identifier: string): CheckResult {
      const now = Date.now();
      const existing = store.get(identifier);

      if (!existing || now > existing.resetAt) {
        // Start a new window
        const resetAt = now + opts.windowMs;
        store.set(identifier, { count: 1, resetAt });
        return { success: true, remaining: opts.limit - 1, resetAt };
      }

      if (existing.count >= opts.limit) {
        return { success: false, remaining: 0, resetAt: existing.resetAt };
      }

      existing.count += 1;
      return { success: true, remaining: opts.limit - existing.count, resetAt: existing.resetAt };
    },
  };
}

// ── Pre-built limiters for common routes ──────────────────────────────────────

/** Auth routes: 10 attempts per IP per minute */
export const authLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

/** Checkout: 20 sessions per user per minute (prevents cart-stuffing) */
export const checkoutLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

/** Waitlist / public forms: 5 submissions per IP per 10 minutes */
export const publicFormLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

/** API writes: 60 per user per minute (general protection) */
export const apiWriteLimiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

/** Audit tracking: 20 events per IP per 10 minutes (full quiz = ~7 events) */
export const auditTrackLimiter = createRateLimiter({ limit: 20, windowMs: 10 * 60_000 });

/** Page view tracking: 120 views per IP per minute (generous, covers fast navigation) */
export const pageViewLimiter = createRateLimiter({ limit: 120, windowMs: 60_000 });
