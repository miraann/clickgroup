-- ============================================================
-- Enable Supabase Realtime for all tables
-- Run this ONCE in the Supabase SQL Editor
-- ============================================================

alter publication supabase_realtime add table public.site_settings;
alter publication supabase_realtime add table public.slides;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.business_types;
alter publication supabase_realtime add table public.systems;
alter publication supabase_realtime add table public.leads;
