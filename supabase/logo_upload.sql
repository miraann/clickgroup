-- ============================================================
-- Click Group — Add logo_url to site_settings + storage bucket
-- Run this in the Supabase SQL Editor
-- ============================================================

alter table public.site_settings
  add column if not exists logo_url text default null;

-- Storage bucket for site-wide assets (logo, favicon, etc.)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets', 'site-assets', true, 2097152,
  array['image/jpeg','image/png','image/webp','image/svg+xml','image/gif']
)
on conflict (id) do nothing;

create policy "Public read site-assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "Auth upload site-assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-assets');

create policy "Auth update site-assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-assets');

create policy "Auth delete site-assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-assets');
