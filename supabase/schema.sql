-- ============================================================
-- Click Group Website — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================
-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- ── Products table ──────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name_en text not null,
  name_ku text not null default '',
  tag_en text not null default '',
  tag_ku text not null default '',
  desc_en text not null default '',
  desc_ku text not null default '',
  -- features: [{icon_name, text_en, text_ku}]
  features jsonb not null default '[]'::jsonb,
  icon_name text not null default 'Monitor',
  accent text not null default '#EAB308',
  cta_en text not null default 'Request a Demo',
  cta_ku text not null default 'داواکردنی تاقیکاری',
  href text not null default '#contact',
  order_index integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- ── Row Level Security ───────────────────────────────────────
alter table public.products enable row level security;
-- Public (anon) can only read active products
create policy "Public read active products" on public.products for
select to anon using (active = true);
-- Authenticated users have full CRUD
create policy "Authenticated full access" on public.products for all to authenticated using (true) with check (true);
-- ── updated_at trigger ───────────────────────────────────────
create or replace function public.handle_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now();
return new;
end;
$$;
create trigger products_updated_at before
update on public.products for each row execute function public.handle_updated_at();
-- ── Seed: default 5 products ─────────────────────────────────
insert into public.products (
    name_en,
    name_ku,
    tag_en,
    tag_ku,
    desc_en,
    desc_ku,
    icon_name,
    accent,
    order_index,
    features
  )
values (
    'Digital Menu System',
    'دێسکتاپ مینو',
    'For Restaurants & Cafés',
    'بۆ ڕێستۆران و کافێ',
    'Transform your restaurant with a modern digital menu. Customers browse, order, and pay — all from their table.',
    'ڕێستۆرانەکەت بە مینۆی دیجیتاڵی نوێ بگۆڕە. کڕیارەکان دەکرێن بچێرن، داوا بکەن و پارەی بدەن لە سەر میزەکەیانەوە.',
    'Monitor',
    '#EAB308',
    0,
    '[{"icon_name":"RefreshCw","text_en":"Real-Time Menu Updates","text_ku":"نوێکردنەوەی مینۆ بە کاتی ڕاستەقینە"},{"icon_name":"QrCode","text_en":"QR Code Ordering","text_ku":"داواکاری بە QR کۆد"},{"icon_name":"Globe","text_en":"Multi-Language Support","text_ku":"پشتگیری زمانە جۆراوجۆرەکان"},{"icon_name":"BarChart2","text_en":"Sales Analytics","text_ku":"شیکاری فرۆشتن"}]'::jsonb
  ),
  (
    'Restaurant POS System',
    'سیستەمی ڕێستۆرانت',
    'Complete Operations Suite',
    'سیستەمی تەواوی کارپێکردن',
    'All-in-one POS solution with order management, KDS integration, and real-time inventory tracking.',
    'چارەسەری POS ی تەواو بە بەڕێوەبردنی داواکاری، یەکاگرتن بە KDS، و شوێنکەوتنی کۆگا بە کاتی ڕاستەقینە.',
    'Utensils',
    '#1e3a8a',
    1,
    '[{"icon_name":"ClipboardList","text_en":"Order Management","text_ku":"بەڕێوەبردنی داواکاری"},{"icon_name":"MonitorSmartphone","text_en":"KDS Integration","text_ku":"یەکاگرتن بە KDS"},{"icon_name":"Package","text_en":"Inventory Tracking","text_ku":"شوێنکەوتنی کۆگا"},{"icon_name":"Printer","text_en":"Receipt Printing","text_ku":"چاپکردنی وەصڵ"}]'::jsonb
  ),
  (
    'Clinic Management',
    'سیستەمی بەڕێوبەردنی کلینیک',
    'Healthcare Solutions',
    'چارەسەری تەندروستی',
    'Streamline your clinic with patient records, appointment scheduling, and billing all in one place.',
    'کلینیکەکەت ئاسان بکە بە تۆماری نەخۆش، داڕشتنی ئامانجدانان، و هیساب لەک شوێندا.',
    'Stethoscope',
    '#10b981',
    2,
    '[{"icon_name":"Users","text_en":"Patient Records","text_ku":"تۆماری نەخۆشان"},{"icon_name":"CalendarCheck","text_en":"Appointment Scheduling","text_ku":"داڕشتنی ئامانجدانان"},{"icon_name":"FileText","text_en":"Medical Reports","text_ku":"ڕاپۆرتی پزیشکی"},{"icon_name":"CreditCard","text_en":"Billing & Payments","text_ku":"هیساب و پارەدان"}]'::jsonb
  ),
  (
    'Mobile Applications',
    'مۆبایل ئەپڵیکەیشن',
    'iOS & Android',
    'ئایۆس و ئەندرۆید',
    'Custom mobile applications built for your business needs, with intuitive UX and seamless performance.',
    'ئەپڵیکەیشنی مۆبایلی تایبەت بۆ پێداویستیەکانی بزنسەکەت، بە UX ئاسان و ئەدا بێ کێشە.',
    'Smartphone',
    '#8b5cf6',
    3,
    '[{"icon_name":"Layers","text_en":"Cross-Platform Development","text_ku":"گەشەپێدانی کراس-پلاتفۆرم"},{"icon_name":"Zap","text_en":"Fast Performance","text_ku":"ئەدای خێرا"},{"icon_name":"Bell","text_en":"Push Notifications","text_ku":"ئاگادارکردنەوەی پووش"},{"icon_name":"Shield","text_en":"Secure & Reliable","text_ku":"پارێزراو و متمانەپێکراو"}]'::jsonb
  ),
  (
    'Web Development',
    'وێب سایت',
    'Modern Web Solutions',
    'چارەسەری وێبی نوێ',
    'Professional websites and web applications that drive results and represent your brand perfectly.',
    'ماڵپەڕ و ئەپڵیکەیشنی وێبی پرۆفیشناڵ کە ئەنجام دەدات و براندەکەت بە تەواوی نوێنەرایەتی دەکات.',
    'Globe',
    '#3b82f6',
    4,
    '[{"icon_name":"Code2","text_en":"Modern Tech Stack","text_ku":"تەکنەلۆژیای نوێ"},{"icon_name":"Search","text_en":"SEO Optimized","text_ku":"بەهێزکراوی SEO"},{"icon_name":"Gauge","text_en":"High Performance","text_ku":"ئەدای بەرز"},{"icon_name":"Palette","text_en":"Custom UI/UX Design","text_ku":"دیزاینی UI/UX تایبەت"}]'::jsonb
  );