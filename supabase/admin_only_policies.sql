-- ============================================================
-- Admin-only policies
-- Run this ONCE in the Supabase SQL Editor.
--
-- Before: every logged-in Supabase account had full admin rights.
-- After:  only accounts listed in public.admins do.
--
-- BEFORE RUNNING: replace the e-mail below with your admin login e-mail.
-- If no account matches, the script stops before changing any policy.
-- ============================================================

-- ── 1. Admin allow-list ──────────────────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- RLS on, no policies: nobody can read or change this table through the API.
-- Manage it from the SQL Editor only.
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── 2. Register the admin account ────────────────────────────
insert into public.admins (user_id)
select id from auth.users
where lower(email) = lower('CHANGE-ME@example.com')   -- <-- your admin e-mail
on conflict (user_id) do nothing;

do $$
begin
  if not exists (select 1 from public.admins) then
    raise exception 'No admin registered: edit the e-mail in step 2 and run again. Nothing was changed.';
  end if;
end $$;

-- ── 3. Tables ────────────────────────────────────────────────
-- products
drop policy if exists "Authenticated full access" on public.products;
drop policy if exists "Admin full access products" on public.products;
create policy "Admin full access products" on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- site_settings
drop policy if exists "Authenticated update site settings" on public.site_settings;
drop policy if exists "Admin full access site settings" on public.site_settings;
create policy "Admin full access site settings" on public.site_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- slides
drop policy if exists "Authenticated full access slides" on public.slides;
drop policy if exists "Admin full access slides" on public.slides;
create policy "Admin full access slides" on public.slides
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- business_types
drop policy if exists "Auth manage business_types" on public.business_types;
drop policy if exists "Admin manage business_types" on public.business_types;
create policy "Admin manage business_types" on public.business_types
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- systems (public read policy "systems_anon_select" is left as is)
drop policy if exists "systems_auth_insert" on public.systems;
drop policy if exists "systems_auth_update" on public.systems;
drop policy if exists "systems_auth_delete" on public.systems;
drop policy if exists "systems_admin_insert" on public.systems;
drop policy if exists "systems_admin_update" on public.systems;
drop policy if exists "systems_admin_delete" on public.systems;
create policy "systems_admin_insert" on public.systems
  for insert to authenticated with check (public.is_admin());
create policy "systems_admin_update" on public.systems
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "systems_admin_delete" on public.systems
  for delete to authenticated using (public.is_admin());

-- leads (public insert policy "leads_anon_insert" is left as is)
drop policy if exists "leads_auth_select" on public.leads;
drop policy if exists "leads_auth_update" on public.leads;
drop policy if exists "leads_auth_delete" on public.leads;
drop policy if exists "leads_admin_select" on public.leads;
drop policy if exists "leads_admin_update" on public.leads;
drop policy if exists "leads_admin_delete" on public.leads;
create policy "leads_admin_select" on public.leads
  for select to authenticated using (public.is_admin());
create policy "leads_admin_update" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "leads_admin_delete" on public.leads
  for delete to authenticated using (public.is_admin());

-- ── 4. Storage buckets (public read policies are left as is) ─
drop policy if exists "Auth upload site-assets" on storage.objects;
drop policy if exists "Auth update site-assets" on storage.objects;
drop policy if exists "Auth delete site-assets" on storage.objects;
drop policy if exists "Auth upload slides images" on storage.objects;
drop policy if exists "Auth update slides images" on storage.objects;
drop policy if exists "Auth delete slides images" on storage.objects;
drop policy if exists "Admin upload site images" on storage.objects;
drop policy if exists "Admin update site images" on storage.objects;
drop policy if exists "Admin delete site images" on storage.objects;

create policy "Admin upload site images" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('site-assets', 'slides') and public.is_admin());
create policy "Admin update site images" on storage.objects
  for update to authenticated
  using (bucket_id in ('site-assets', 'slides') and public.is_admin())
  with check (bucket_id in ('site-assets', 'slides') and public.is_admin());
create policy "Admin delete site images" on storage.objects
  for delete to authenticated
  using (bucket_id in ('site-assets', 'slides') and public.is_admin());
