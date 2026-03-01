import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests under the limit", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    expect(limiter.check("user-1").success).toBe(true);
    expect(limiter.check("user-1").success).toBe(true);
    expect(limiter.check("user-1").success).toBe(true);
  });

  it("blocks the request when limit is exceeded", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });
    limiter.check("user-2");
    limiter.check("user-2");
    const result = limiter.check("user-2");
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the window expires", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 5_000 });
    limiter.check("user-3"); // uses up the quota

    const beforeReset = limiter.check("user-3");
    expect(beforeReset.success).toBe(false);

    vi.advanceTimersByTime(6_000); // advance past the window

    const afterReset = limiter.check("user-3");
    expect(afterReset.success).toBe(true);
  });

  it("tracks different identifiers independently", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    limiter.check("user-a");

    expect(limiter.check("user-a").success).toBe(false); // exhausted
    expect(limiter.check("user-b").success).toBe(true);  // fresh
  });

  it("remaining count decrements correctly", () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });
    const r1 = limiter.check("user-x");
    expect(r1.remaining).toBe(4);
    const r2 = limiter.check("user-x");
    expect(r2.remaining).toBe(3);
  });
});
