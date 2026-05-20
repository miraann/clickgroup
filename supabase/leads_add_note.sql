-- Add note column to leads table
-- Run this in the Supabase SQL Editor

alter table public.leads
  add column if not exists note text default null;
