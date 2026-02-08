-- Create saved_solutions table
create table if not exists saved_solutions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  solution_id text not null, -- Assuming solution IDs are text based on current schema
  created_at timestamp with time zone default now(),
  unique(user_id, solution_id)
);

-- Enable RLS
alter table saved_solutions enable row level security;

-- Create policies
create policy "Users can view their own saved solutions"
  on saved_solutions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved solutions"
  on saved_solutions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved solutions"
  on saved_solutions for delete
  using (auth.uid() = user_id);
