-- Add TikTok and WhatsApp columns to site_settings
-- Run this in the Supabase SQL Editor

alter table public.site_settings
  add column if not exists tiktok_url   text not null default '',
  add column if not exists whatsapp_url text not null default '';
