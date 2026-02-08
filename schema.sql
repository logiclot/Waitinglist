-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- EXPERTS TABLE
create table experts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid unique, -- Link to auth.users
  slug text unique, -- URL friendly ID
  name text not null,
  bio text,
  response_time text, -- e.g. "Usually replies within 2 hours"
  verified boolean default false,
  business_verified boolean default false,
  founding boolean default false,
  founding_rank integer, -- 1..20
  completed_sales_count integer default 0,
  commission_override_percent numeric(5,2),
  tools text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure rank is unique if set
  constraint unique_founding_rank unique (founding_rank)
);

-- SOLUTIONS TABLE
create table solutions (
  id uuid default uuid_generate_v4() primary key,
  expert_id uuid references experts(id),
  slug text unique not null,
  title text not null,
  short_summary text, -- Max 140 chars
  description text not null,
  category text not null,
  integrations text[] default '{}', -- Tools used
  
  -- Prices stored in CENTS
  implementation_price_cents integer not null,
  monthly_cost_min_cents integer,
  monthly_cost_max_cents integer,
  
  delivery_days integer not null,
  estimated_implementation_time text, -- Enum-like string
  implementation_type text, -- Enum-like string
  
  included text[] default '{}',
  excluded text[] default '{}',
  prerequisites text[] default '{}',
  faq jsonb default '[]',
  status text check (status in ('draft', 'published', 'paused')) default 'draft',
  
  -- Extra content
  what_it_does text,
  
  -- Demo Video
  demo_video_url text,
  demo_video_status text check (demo_video_status in ('none', 'pending', 'approved', 'rejected')) default 'none',
  demo_video_reviewed_at timestamp with time zone,
  demo_video_review_notes text,
  demo_video_start_seconds integer,
  demo_video_id text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS TABLE
create table orders (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid not null, -- Reference to auth.users if using Supabase Auth
  seller_id uuid references experts(id) not null,
  solution_id uuid references solutions(id) not null,
  
  price_cents integer not null,
  status text check (status in ('draft', 'paid_pending_implementation', 'in_progress', 'delivered', 'approved', 'refunded', 'disputed')) default 'draft',
  
  delivery_note text,
  
  approved_at timestamp with time zone,
  refunded_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONVERSATIONS (THREADS) TABLE
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid not null,
  seller_id uuid references experts(id) not null,
  solution_id uuid references solutions(id),
  order_id uuid references orders(id),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES TABLE
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations(id) not null,
  sender_id uuid not null, -- User ID or Expert ID
  body text not null,
  type text check (type in ('user', 'system')) default 'user',
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Row Level Security)
alter table solutions enable row level security;
alter table experts enable row level security;
alter table orders enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Policies
create policy "Public solutions are viewable by everyone"
  on solutions for select
  using (status = 'published');

create policy "Experts are viewable by everyone"
  on experts for select
  using (true);

-- Note: Complex RLS for orders/conversations depends on auth setup
