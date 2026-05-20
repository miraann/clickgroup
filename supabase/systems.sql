-- ============================================================
-- Click Group — Systems of Interest table
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.systems (
  id          bigserial primary key,
  label_en    text    not null,
  label_ku    text    not null,
  order_index integer not null default 0,
  active      boolean not null default true
);

-- Indexes
create index if not exists systems_order_idx on public.systems (order_index);

-- RLS
alter table public.systems enable row level security;

-- Anyone can read active systems (public form)
create policy "systems_anon_select" on public.systems
  for select to anon, authenticated
  using (true);

-- Only authenticated (admin) can modify
create policy "systems_auth_insert" on public.systems
  for insert to authenticated
  with check (true);

create policy "systems_auth_update" on public.systems
  for update to authenticated
  using (true);

create policy "systems_auth_delete" on public.systems
  for delete to authenticated
  using (true);

-- Seed with default options
insert into public.systems (label_en, label_ku, order_index, active) values
  ('Digital Menu System',      'دێسکتاپ مینو',               1, true),
  ('Restaurant POS System',    'سیستەمی ڕێستۆرانت',          2, true),
  ('Clinic Management System', 'سیستەمی بەڕێوبەردنی کلینیک', 3, true),
  ('Mobile Applications',      'مۆبایل ئەپڵیکەیشن',          4, true),
  ('Web Development',          'وێب سایت',                    5, true)
on conflict do nothing;
