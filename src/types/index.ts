// ── Canonical action result type — use across all server actions ──────────────
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// ── Milestone (JSON stored in Order.milestones) ──────────────────────────────
export interface Milestone {
  title: string;
  description?: string;
  priceCents?: number;
  price?: number;
  status: 'pending_payment' | 'waiting_for_funds' | 'in_escrow' | 'releasing' | 'released';
  fundedAt?: string | null;
  releasedAt?: string | null;
  stripePaymentIntentId?: string | null;
}

// ── Referral rewards (JSON stored in BusinessProfile.referralRewards) ─────────
export interface ReferralRewards {
  businessDiscountCount?: number;
  expertDiscountCount?: number;
  [key: string]: unknown;
}

export interface Expert {
  id: string;
  user_id?: string;
  slug?: string;
  name: string;
  profile_image_url?: string;
  bio?: string;
  response_time?: string;
  verified: boolean;
  business_verified?: boolean;
  founding: boolean;
  founding_rank?: number | null;
  completed_sales_count: number;
  commission_override_percent?: number | null;
  tools: string[];
  calendarUrl?: string;
  tier?: string; // STANDARD | PROVEN | ELITE
}

export type DemoVideoStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type SolutionStatus = 'draft' | 'published' | 'paused' | 'archived';
export type ModerationStatus = 'auto_approved' | 'pending' | 'approved' | 'rejected';

export type ImplementationTime = "Same day" | "1–3 days" | "4–7 days" | "1–2 weeks" | "2+ weeks";
export type ImplementationType = "Done-for-you implementation" | "Guided setup" | "Audit & optimization";

export interface Solution {
  id: string;
  slug: string;
  title: string;
  short_summary?: string;
  outcome?: string; // One sentence outcome line
  description: string;
  longDescription?: string; // Add this mapping explicitly
  category: string;

  // Pricing — cents are source of truth (from DB), euros are derived for display
  implementation_price_cents: number;
  monthly_cost_min_cents?: number;
  monthly_cost_max_cents?: number;

  // Derived euro values (always = cents / 100, set at fetch time)
  implementation_price: number;
  monthly_cost_min: number;
  monthly_cost_max: number;

  delivery_days: number;
  support_days?: number;
  estimated_implementation_time?: ImplementationTime;
  implementation_type?: ImplementationType;

  integrations: string[]; // "Tools used"
  status: SolutionStatus;
  moderationStatus?: ModerationStatus; // New field

  // Detailed fields
  included?: string[];
  excluded?: string[];
  prerequisites?: string[];
  faq?: { question: string; answer: string }[];

  // Requirements & Access
  requiredInputs?: string[];

  // Content Fields
  outline?: string[];
  lastStep?: number;

  // Proof & Trust
  proofType?: string;
  proofContent?: string;

  // Trust & Stats
  adoption_count?: number;
  avg_roi?: number;
  delivery_days_range?: string;
  roi_months?: number;
  is_vetted?: boolean;
  requires_nda?: boolean;
  is_founding_expert?: boolean;

  // Filter Fields
  businessGoals?: string[];
  industries?: string[];
  paybackPeriod?: string;
  trustSignals?: string[];
  complexity?: string;

  // Solution structure
  structureConsistent?: string[];
  structureCustom?: string[];
  measurableOutcome?: string;

  // Skills — discrete capabilities the automation delivers
  skills?: { name: string; description: string }[];

  // Versioning & Maintenance
  version?: number;
  changelog?: string;
  upgradePriceCents?: number;

  // Filter Fields (expert-derived)
  expertTier?: string;

  // Demo Video
  demoVideoUrl?: string;
  demo_video_url?: string; // legacy alias used by admin ListingEditor
  demoVideoStatus?: DemoVideoStatus;
  demo_video_status?: DemoVideoStatus; // legacy alias used by older components
  demoVideoId?: string;
  demoVideoStartSeconds?: number;
  demoVideoReviewedAt?: string;

  // Demo Booking
  demoPriceCents?: number;

  // Relationship
  expert?: Expert;
  expert_id?: string;
  
  // Ecosystems
  ecosystemIds?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type OrderStatus = 'draft' | 'paid_pending_implementation' | 'in_progress' | 'delivered' | 'revision_requested' | 'approved' | 'refunded' | 'disputed';

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  solution_id: string;
  price_cents: number;
  status: OrderStatus;
  delivery_note?: string;
  approved_at?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;

  // Relationships (optional/hydrated)
  solution?: Solution;
  seller?: Expert;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  solution_id?: string;
  order_id?: string;
  job_post_id?: string;
  created_at: string;
  updated_at?: string;

  // Hydrated
  messages?: Message[];
  solution?: Solution;
  order?: Order;
  seller?: Expert;
  buyer_name?: string; // resolved name of the buyer for seller-side display
  buyer_image?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  type: 'user' | 'system' | 'bid_card' | 'order_card';
  created_at: string;
}

export interface BidCardData {
  projectTitle: string;
  automationTitle?: string;
  excerpt: string;
  price: string;
  timeline: string;
  jobId: string;
  bidId: string;
  expertCalendarUrl?: string;
  expertName: string;
}

export interface OrderCardData {
  type: "milestone_funded" | "order_accepted" | "delivery_submitted" | "milestone_released" | "revision_requested" | "revision_accepted";
  milestoneTitle: string;
  milestoneIndex: number;
  priceCents: number;
  projectTitle: string;
  orderId: string;
  expertName?: string;
  deliveryNote?: string;
  revisionNote?: string;
  revisionCount?: number;
}

// ── Suite / Ecosystem card data (from getPublishedEcosystemsFull) ────────────

export interface SuiteExpert {
  id: string;
  displayName: string;
  slug: string;
  isFoundingExpert: boolean;
  tier: string;
  user?: { profileImageUrl: string | null } | null;
}

export interface SuiteCardSolution {
  id: string;
  slug: string;
  title: string;
  shortSummary: string | null;
  outcome: string | null;
  category: string;
  implementationPriceCents: number;
  monthlyCostMinCents: number | null;
  monthlyCostMaxCents: number | null;
  deliveryDays: number;
  supportDays: number;
  integrations: string[];
  businessGoals: string[];
  expertId: string;
  expert: SuiteExpert;
}

export interface SuiteCardData {
  id: string;
  slug: string;
  title: string;
  shortPitch: string;
  expertId: string;
  expert: SuiteExpert;
  // Bundle discount
  bundlePriceCents: number | null;
  // Extended support packages
  extSupport6mCents: number | null;
  extSupport12mCents: number | null;
  extSupportDescription: string | null;
  items: Array<{
    id: string;
    position: number;
    solution: SuiteCardSolution;
  }>;
}
