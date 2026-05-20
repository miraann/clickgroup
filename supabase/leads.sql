-- ============================================================
-- Click Group — Leads table
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.leads (
  id            bigserial primary key,
  full_name     text        not null,
  phone         text        not null,
  business_name text        not null,
  location      text        not null,
  business_type text        not null,
  system        text        not null,
  status        text        not null default 'new',  -- new | contacted | closed
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx     on public.leads (status);

-- RLS
alter table public.leads enable row level security;

-- Anyone can insert (public form)
create policy "leads_anon_insert" on public.leads
  for insert to anon, authenticated
  with check (true);

-- Only authenticated (admin) can read / update / delete
create policy "leads_auth_select" on public.leads
  for select to authenticated
  using (true);

create policy "leads_auth_update" on public.leads
  for update to authenticated
  using (true);

create policy "leads_auth_delete" on public.leads
  for delete to authenticated
  using (true);
