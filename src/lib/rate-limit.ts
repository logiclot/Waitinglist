/**
 * Sliding-window rate limiter with Upstash Redis support.
 *
 * Uses Upstash Redis in production (stateless, works across serverless instances).
 * Falls back to in-memory Map for local development when Redis is not configured.
 *
 * Usage:
 *   const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });
 *   const result = await limiter.check(identifier);
 *   if (!result.success) return new Response("Too Many Requests", { status: 429 });
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimiterOptions {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window length in milliseconds */
  windowMs: number;
}

export interface CheckResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

// ── Redis client (singleton) ────────────────────────────────────────────────

const UPSTASH_URL = process.env.KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;
const useRedis = !!(UPSTASH_URL && UPSTASH_TOKEN);

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
  }
  return redis;
}

// ── In-memory fallback (for local development without Redis) ────────────────

interface RateWindow {
  count: number;
  resetAt: number;
}

function createInMemoryLimiter(opts: RateLimiterOptions) {
  const store = new Map<string, RateWindow>();

  if (typeof setInterval !== "undefined") {
    setInterval(() => {
      const now = Date.now();
      store.forEach((window, key) => {
        if (now > window.resetAt) store.delete(key);
      });
    }, 5 * 60 * 1000);
  }

  return {
    check(identifier: string): CheckResult {
      const now = Date.now();
      const existing = store.get(identifier);

      if (!existing || now > existing.resetAt) {
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

// ── Upstash Redis limiter ───────────────────────────────────────────────────

function createRedisLimiter(opts: RateLimiterOptions) {
  const windowSec = Math.max(1, Math.ceil(opts.windowMs / 1000));

  const ratelimit = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(opts.limit, `${windowSec} s`),
    analytics: false,
  });

  return {
    check(identifier: string): CheckResult | Promise<CheckResult> {
      return ratelimit.limit(identifier).then(({ success, remaining, reset }) => ({
        success,
        remaining,
        resetAt: reset,
      }));
    },
  };
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createRateLimiter(opts: RateLimiterOptions) {
  if (useRedis) {
    return createRedisLimiter(opts);
  }
  return createInMemoryLimiter(opts);
}

// ── Pre-built limiters for common routes ────────────────────────────────────

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
