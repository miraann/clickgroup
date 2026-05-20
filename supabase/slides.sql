-- ============================================================
-- Click Group — Slides Table
-- Run this in the Supabase SQL Editor (after schema.sql)
-- ============================================================

create table if not exists public.slides (
  id          uuid primary key default uuid_generate_v4(),
  title_en    text not null default '',
  title_ku    text not null default '',
  subtitle_en text not null default '',
  subtitle_ku text not null default '',
  cta_text_ku text not null default 'زیاتر بزانە',
  cta_text_en text not null default 'Learn More',
  cta_href    text not null default '#systems',
  gradient    text not null default 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
  order_index integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Row Level Security
alter table public.slides enable row level security;

create policy "Public read active slides"
  on public.slides for select to anon using (active = true);

create policy "Authenticated full access slides"
  on public.slides for all to authenticated using (true) with check (true);

-- Auto-update updated_at
create trigger slides_updated_at
  before update on public.slides
  for each row execute function public.handle_updated_at();

-- Seed: 3 default slides
insert into public.slides (title_en, title_ku, subtitle_en, subtitle_ku, cta_text_ku, cta_text_en, cta_href, gradient, order_index) values
(
  'Digital Solutions for the Modern Era',
  'چارەسەری دیجیتاڵی بۆ سەردەمی نوێ',
  'Empowering businesses with cutting-edge technology across Kurdistan and beyond',
  'توانادانی بزنسەکان بە تەکنەلۆژیای پێشکەوتوو لە سەرتاسەری کوردستان',
  'سیستەمەکانمان',
  'Our Systems',
  '#systems',
  'linear-gradient(135deg, #0f172a 0%, #1e3a8a 75%, #1e40af 100%)',
  0
),
(
  'Smart Restaurant Technology',
  'تەکنەلۆژیای زیرەکی ڕێستۆران',
  'Digital menus, POS systems, and kitchen displays built for modern restaurants',
  'مینۆی دیجیتاڵ، سیستەمی POS، و شاشەی خوانەخانە بۆ ڕێستۆرانی نوێ',
  'زیاتر بزانە',
  'Learn More',
  '#systems',
  'linear-gradient(135deg, #0c4a6e 0%, #082f49 50%, #0f172a 100%)',
  1
),
(
  'Building Tomorrow Together',
  'سبەی دروست دەکەین پێکەوە',
  'From mobile apps to web platforms — we deliver technology that works for you',
  'لە ئەپی مۆبایل تا پلاتفۆرمی وێب — تەکنەلۆژیا دەگەیەنین بۆت',
  'پەیوەندیمان پێوە بکە',
  'Get in Touch',
  '#contact',
  'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #0f172a 100%)',
  2
);
