/**
 * Structured logger for server-side code.
 *
 * Outputs JSON in production (machine-readable, works with Vercel/Supabase log drains
 * and tools like Datadog, BetterStack, or Logtail).
 * Outputs pretty-printed text in development for readability.
 *
 * Usage:
 *   import { log } from "@/lib/logger";
 *   log.info("checkout.started", { userId, solutionId, priceCents });
 *   log.error("stripe.transfer.failed", { orderId, error: err.message });
 */

type Level = "debug" | "info" | "warn" | "error";
type Context = Record<string, unknown>;

const IS_PROD = process.env.NODE_ENV === "production";
const MIN_LEVEL: Level = (process.env.LOG_LEVEL as Level) ?? (IS_PROD ? "info" : "debug");

const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: Level): boolean {
  return LEVELS[level] >= LEVELS[MIN_LEVEL];
}

function write(level: Level, event: string, context?: Context) {
  if (!shouldLog(level)) return;

  if (IS_PROD) {
    // JSON output for log-drain ingestion
    const entry = {
      ts: new Date().toISOString(),
      level,
      event,
      ...context,
    };
    // eslint-disable-next-line no-console
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      JSON.stringify(entry)
    );
  } else {
    // Human-readable for local dev
    const color: Record<Level, string> = {
      debug: "\x1b[36m",
      info: "\x1b[32m",
      warn: "\x1b[33m",
      error: "\x1b[31m",
    };
    const reset = "\x1b[0m";
    const prefix = `${color[level]}[${level.toUpperCase()}]${reset}`;
    const ctxStr = context ? ` ${JSON.stringify(context)}` : "";
    // eslint-disable-next-line no-console
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      `${prefix} ${event}${ctxStr}`
    );
  }
}

export const log = {
  debug: (event: string, context?: Context) => write("debug", event, context),
  info: (event: string, context?: Context) => write("info", event, context),
  warn: (event: string, context?: Context) => write("warn", event, context),
  error: (event: string, context?: Context) => write("error", event, context),
};
