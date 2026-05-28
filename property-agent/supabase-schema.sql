-- Run this in your Supabase SQL Editor
-- Go to supabase.com → your project → SQL Editor → New Query

-- Table: stores each user's agent preferences
create table if not exists property_agents (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,           -- WhatsApp number with country code e.g. +923001234567
  callmebot_apikey text not null,       -- CallMeBot API key for this user
  prefs jsonb not null default '{}',    -- All property preferences stored as JSON
  active boolean not null default true, -- Whether the agent is running
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table: logs each daily agent run
create table if not exists agent_logs (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  status text not null,     -- 'sent' | 'no_matches' | 'error'
  message text,             -- The WhatsApp message sent (or error message)
  ran_at timestamptz default now()
);

-- Index for faster lookups
create index if not exists idx_property_agents_active on property_agents(active);
create index if not exists idx_agent_logs_phone on agent_logs(user_phone);
create index if not exists idx_agent_logs_ran_at on agent_logs(ran_at desc);

-- Enable Row Level Security (keep data private)
alter table property_agents enable row level security;
alter table agent_logs enable row level security;

-- Allow server-side access via service role (your API routes use anon key with RLS bypassed for now)
-- For production, switch to service role key in API routes
create policy "Allow all for now" on property_agents for all using (true);
create policy "Allow all for now" on agent_logs for all using (true);
