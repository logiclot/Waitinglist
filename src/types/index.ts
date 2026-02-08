export interface Expert {
  id: string;
  user_id?: string;
  slug?: string;
  name: string;
  bio?: string;
  response_time?: string;
  verified: boolean;
  business_verified?: boolean;
  founding: boolean;
  founding_rank?: number | null;
  completed_sales_count: number;
  commission_override_percent?: number | null;
  tools: string[];
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
  
  // New pricing fields (source of truth)
  implementation_price_cents: number;
  monthly_cost_min_cents?: number;
  monthly_cost_max_cents?: number;
  maintenancePriceCents?: number;
  maintenanceDescription?: string;
  
  // Legacy fields (kept for compatibility with existing components for now)
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
  what_it_does?: string;
  included?: string[];
  excluded?: string[];
  prerequisites?: string[];
  faq?: { question: string; answer: string }[];

  // Requirements & Access
  accessRequired?: string;
  requiredInputs?: string[];
  questions?: string[];

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
  expertTier?: string;
  complexity?: string;

  // Demo Video
  demo_video_url?: string;
  demo_video_status?: DemoVideoStatus;
  demo_video_reviewed_at?: string;
  demo_video_review_notes?: string;
  demo_video_start_seconds?: number;
  demo_video_id?: string;
  
  // Relationship
  expert?: Expert;
  expert_id?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type OrderStatus = 'draft' | 'paid_pending_implementation' | 'in_progress' | 'delivered' | 'approved' | 'refunded' | 'disputed';

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
  created_at: string;
  updated_at?: string;
  
  // Hydrated
  messages?: Message[];
  solution?: Solution;
  order?: Order;
  seller?: Expert;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  type: 'user' | 'system';
  created_at: string;
}
