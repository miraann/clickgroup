-- ============================================================
-- Click Group — Site Settings Table
-- Run this in the Supabase SQL Editor (after schema.sql)
-- ============================================================

create table if not exists public.site_settings (
  id int primary key default 1,
  constraint site_settings_single_row check (id = 1),

  -- Brand / Logo
  brand_en_part1   text not null default 'Click',
  brand_en_part2   text not null default 'Group',
  brand_ku         text not null default 'کلیک گروپ',
  logo_tagline     text not null default 'Technology',

  -- Hero badge
  badge_ku         text not null default 'شیرکەتی تەکنەلۆژیای زانیاری',
  badge_en         text not null default 'Information Technology',

  -- Hero body
  hero_location    text not null default 'Kurdistan Region · Iraq',
  hero_tagline_en  text not null default 'Empowering businesses with cutting-edge digital solutions — built for the modern era.',

  -- Hero CTAs
  cta_primary_ku   text not null default 'سیستەمەکانمان',
  cta_primary_en   text not null default 'Our Systems',
  cta_secondary_en text not null default 'Get in Touch',

  -- Navbar floating CTA
  nav_cta_ku       text not null default 'داواکردنی تاقیکاری',

  -- Stats
  stat1_value      text not null default '5+',
  stat1_label_en   text not null default 'Products & Systems',
  stat1_label_ku   text not null default 'سیستەم',

  stat2_value      text not null default '100+',
  stat2_label_en   text not null default 'Happy Clients',
  stat2_label_ku   text not null default 'کڕیار',

  stat3_value      text not null default '3+',
  stat3_label_en   text not null default 'Years of Experience',
  stat3_label_ku   text not null default 'ساڵ',

  -- Contact
  phone            text not null default '+964 770 146 6787',
  address_en       text not null default 'Kurdistan Region, Iraq',
  address_ku       text not null default 'هەرێمی کوردستان، عێراق',

  -- Footer
  footer_desc_en   text not null default 'Premium digital solutions tailored for modern businesses across Kurdistan and beyond.',
  footer_desc_ku   text not null default 'شیرکەتی تەکنەلۆژیای زانیاری',

  -- Social
  facebook_url     text not null default '#',
  instagram_url    text not null default '#',
  linkedin_url     text not null default '#',

  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.site_settings enable row level security;

create policy "Public read site settings"
  on public.site_settings for select to anon using (true);

create policy "Authenticated update site settings"
  on public.site_settings for all to authenticated using (true) with check (true);

-- Auto-update updated_at (reuses the function from schema.sql)
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.handle_updated_at();

-- Seed the single default row
insert into public.site_settings (id) values (1) on conflict (id) do nothing;
