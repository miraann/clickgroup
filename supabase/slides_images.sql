-- ============================================================
-- Click Group — Add image columns to slides table
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Add image columns to existing slides table
alter table public.slides
  add column if not exists bg_image_url  text default null,
  add column if not exists char_image_url text default null;

-- ── Supabase Storage bucket for slide images ──────────────────
-- Create the bucket (public so images are readable without auth)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('slides', 'slides', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- Public read access
create policy "Public read slides images"
  on storage.objects for select
  using (bucket_id = 'slides');

-- Authenticated upload
create policy "Auth upload slides images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'slides');

-- Authenticated update (upsert/replace)
create policy "Auth update slides images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'slides');

-- Authenticated delete
create policy "Auth delete slides images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'slides');
