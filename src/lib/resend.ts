import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey && process.env.NODE_ENV === "production") {
  throw new Error("RESEND_API_KEY environment variable is required in production");
}

if (!apiKey) {
  console.warn("RESEND_API_KEY not set — emails will not be delivered in development");
}

export const resend = new Resend(apiKey || 're_placeholder_dev_key');
