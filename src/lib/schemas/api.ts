import { z } from "zod";

// ── Checkout ──────────────────────────────────────────────────────────────────
export const CheckoutBodySchema = z.object({
  solutionId: z.string().uuid("Invalid solution ID"),
  isUpgrade: z.boolean().optional().default(false),
  type: z.enum(["demo_booking", "milestone_funding", "version_upgrade"]).optional(),
  milestoneIndex: z.number().int().min(0).optional(),
  orderId: z.string().uuid().optional(),
});
export type CheckoutBody = z.infer<typeof CheckoutBodySchema>;

// ── Milestone release ─────────────────────────────────────────────────────────
export const ReleaseMilestoneSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  milestoneIndex: z.number().int().min(0),
});
export type ReleaseMilestoneBody = z.infer<typeof ReleaseMilestoneSchema>;

// ── Waitlist signup ───────────────────────────────────────────────────────────
export const WaitlistSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["business", "expert"]),
  source: z.string().max(50).optional(),
  consent: z.boolean(),
});
export type WaitlistBody = z.infer<typeof WaitlistSchema>;

// ── Message send ──────────────────────────────────────────────────────────────
export const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(5000),
});
export type SendMessageBody = z.infer<typeof SendMessageSchema>;

// ── Job post ──────────────────────────────────────────────────────────────────
export const JobPostSchema = z.object({
  title: z.string().min(5).max(200),
  goal: z.string().min(10).max(5000),
  category: z.string().min(1).max(100),
  tools: z.array(z.string()).max(20),
  budgetRange: z.string().min(1),
  timeline: z.string().min(1),
});
export type JobPostBody = z.infer<typeof JobPostSchema>;
