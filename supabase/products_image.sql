-- ============================================================
-- Click Group — Add image_url to products table
-- Run this in the Supabase SQL Editor
-- ============================================================

alter table public.products
  add column if not exists image_url text default null;
