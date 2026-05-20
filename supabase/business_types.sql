-- ============================================================
-- Click Group — Business Types table
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.business_types (
  id          serial primary key,
  label_en    text not null,
  label_ku    text not null,
  order_index int  not null default 0,
  active      boolean not null default true,
  created_at  timestamptz default now()
);

alter table public.business_types enable row level security;

-- Anon can read active types (used by the public lead form)
create policy "Public read business_types"
  on public.business_types for select
  using (active = true);

-- Authenticated can manage all rows
create policy "Auth manage business_types"
  on public.business_types for all
  to authenticated
  using (true)
  with check (true);

-- Seed default types
insert into public.business_types (label_en, label_ku, order_index) values
  ('Restaurant',   'مەخمەر',   1),
  ('Clinic',       'کلینیک',   2),
  ('Hotel',        'ئوتێل',    3),
  ('Retail Shop',  'فرۆشگا',   4),
  ('Corporate',    'کۆمپانیا', 5),
  ('Other',        'تر',       6)
on conflict do nothing;
