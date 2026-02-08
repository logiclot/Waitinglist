import { Resend } from 'resend';

// Use environment variable or default to a placeholder if missing (to avoid crash in build/dev without env)
// Ideally, RESEND_API_KEY should be set.
const apiKey = process.env.RESEND_API_KEY || 're_123456789'; 

export const resend = new Resend(apiKey);
