-- Run this in your Supabase SQL editor
-- Go to: supabase.com → your project → SQL Editor → New query

-- Tasks table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  text text not null,
  done boolean default false,
  created_at timestamptz default now()
);

-- Sessions table
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  focus_mins integer default 0,
  journal text,
  created_at timestamptz default now()
);

-- Row Level Security (users only see their own data)
alter table tasks enable row level security;
alter table sessions enable row level security;

create policy "users own tasks" on tasks
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users own sessions" on sessions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
