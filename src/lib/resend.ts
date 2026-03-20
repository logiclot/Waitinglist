import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey && process.env.NODE_ENV === "production") {
  throw new Error("RESEND_API_KEY environment variable is required in production");
}

if (!apiKey) {
  console.warn("RESEND_API_KEY not set -- emails will not be delivered in development");
}

export const resend = new Resend(apiKey || 're_placeholder_dev_key');

/**
 * Formatted sender address: "LogicLot <address>"
 * Falls back to raw RESEND_FROM_EMAIL if not set.
 */
export function getFromEmail(): string | undefined {
  const raw = process.env.RESEND_FROM_EMAIL;
  if (!raw) return undefined;
  // Already has a display name (e.g. "Name <email>")
  if (raw.includes("<")) return raw;
  return `LogicLot <${raw}>`;
}
