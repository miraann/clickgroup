'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UtensilsCrossed, ChefHat, Stethoscope, Smartphone, Globe,
  Monitor, Package, BarChart2, Users, Settings, Code2,
  Database, Cloud, Shield, Zap, ClipboardList, Layers,
  Bell, Gauge, Palette, Search, Printer, RefreshCw,
  CheckCircle2, MonitorSmartphone, CalendarCheck, FileText,
  CreditCard, QrCode, ArrowRight, ImageIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ── DB product type (exported so page.tsx can use it) ──────────
export type DBProduct = {
  id: string
  name_en: string
  name_ku: string
  tag_en: string
  tag_ku: string
  desc_en: string
  desc_ku: string
  features: Array<{ icon_name: string; text_en: string; text_ku: string }>
  icon_name: string
  image_url: string | null
  accent: string
  cta_en: string
  cta_ku: string
  href: string
  order_index: number
  active: boolean
}

// ── Icon map ───────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, ChefHat, Stethoscope, Smartphone, Globe,
  Monitor, Package, BarChart2, Users, Settings, Code2,
  Database, Cloud, Shield, Zap, ClipboardList, Layers,
  Bell, Gauge, Palette, Search, Printer, RefreshCw,
  CheckCircle2, MonitorSmartphone, CalendarCheck, FileText,
  CreditCard, QrCode, ImageIcon,
}

function DynamicIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Icon = ICON_MAP[name] ?? Package
  return <Icon className={className} style={style} />
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Hardcoded fallback products ───────────────────────────────
const FALLBACK: DBProduct[] = [
  {
    id: 'menu', icon_name: 'UtensilsCrossed', image_url: null,
    name_en: 'Digital Menu System', name_ku: 'دێسکتاپ مینو',
    tag_en: 'Elevate Your Dining Experience', tag_ku: 'ئەزموونی خواردنی خۆشبکە',
    desc_en: "Transform how customers browse your offerings with a stunning digital display. Update items in real-time, embed videos, and track what's popular — all from one sleek dashboard.",
    desc_ku: 'شێوازی گەڕانی کڕیاران لە مینوکەت بگۆڕە. نرخ و بابەتەکان بە کاتی ڕاستەوخۆ نوێ بکەرەوە.',
    features: [
      { icon_name: 'CheckCircle2', text_en: 'Real-time menu content updates',           text_ku: 'نوێکردنەوەی مینو بە کاتی ڕاستەوخۆ' },
      { icon_name: 'CheckCircle2', text_en: 'Multi-language: Kurdish, Arabic, English', text_ku: 'پشتگیری زمان: کوردی، عەرەبی، ئینگلیزی' },
      { icon_name: 'CheckCircle2', text_en: 'QR code table-ordering integration',       text_ku: 'یەکخستنی داواکاری QR کۆد' },
      { icon_name: 'CheckCircle2', text_en: 'Custom branding & theme engine',           text_ku: 'بڕاندی تایبەت و مۆتۆری تیم' },
      { icon_name: 'CheckCircle2', text_en: 'Analytics & viewer insights dashboard',    text_ku: 'داشبۆردی ئامارەکان' },
      { icon_name: 'CheckCircle2', text_en: 'Offline-capable fallback mode',            text_ku: 'دەستکردی بەبێ ئینتەرنێت' },
      { icon_name: 'CheckCircle2', text_en: 'HD media, image & video support',          text_ku: 'پشتگیری ڤیدیۆ و وێنەی HD' },
    ],
    accent: '#EAB308', cta_en: 'Request Demo', cta_ku: 'داواکردنی تاقیکاری', href: '#contact', order_index: 0, active: true,
  },
  {
    id: 'restaurant', icon_name: 'ChefHat', image_url: null,
    name_en: 'Restaurant POS System', name_ku: 'سیستەمی ڕێستۆرانت',
    tag_en: 'Complete Restaurant Control', tag_ku: 'کۆنترۆڵی تەواوی ڕێستۆرانت',
    desc_en: 'A full-featured point-of-sale platform built for modern restaurants. Manage orders, tables, staff, and inventory from a single intuitive interface.',
    desc_ku: 'پلاتفۆرمی كاملی فرۆشگا بۆ ڕێستۆرانتە مۆدەرنەکان. داواکاری، مێز، کارمەند و کۆگا بەڕێوەبکە.',
    features: [
      { icon_name: 'CheckCircle2', text_en: 'Smart order management & routing',        text_ku: 'بەڕێوەبردنی داواکاری بە زیرەکی' },
      { icon_name: 'CheckCircle2', text_en: 'Interactive table map & reservations',    text_ku: 'نەخشەی مێز و حجز' },
      { icon_name: 'CheckCircle2', text_en: 'Kitchen Display System (KDS)',            text_ku: 'سیستەمی نیشاندانی چێشتخانە' },
      { icon_name: 'CheckCircle2', text_en: 'Real-time inventory tracking',            text_ku: 'ئامادەکردنی کۆگا بە کاتی ڕاستەوخۆ' },
      { icon_name: 'CheckCircle2', text_en: 'Staff scheduling & permissions',          text_ku: 'پلانی کارمەند و مۆڵەتەکان' },
      { icon_name: 'CheckCircle2', text_en: 'Comprehensive sales reports & analytics', text_ku: 'ڕاپۆرتی فرۆشتنی تەواو' },
      { icon_name: 'CheckCircle2', text_en: 'Multi-branch management support',         text_ku: 'پشتگیری بەڕێوەبردنی لق' },
    ],
    accent: '#3B82F6', cta_en: 'Request Demo', cta_ku: 'داواکردنی تاقیکاری', href: '#contact', order_index: 1, active: true,
  },
  {
    id: 'clinic', icon_name: 'Stethoscope', image_url: null,
    name_en: 'Clinic Management System', name_ku: 'سیستەمی بەڕێوبەردنی کلینیک',
    tag_en: 'Modern Healthcare Management', tag_ku: 'بەڕێوەبردنی نوێی كلینیک',
    desc_en: 'Streamline your entire clinic workflow from patient check-in to billing. Reduce paperwork, eliminate scheduling conflicts, and deliver a smoother experience.',
    desc_ku: 'هەموو پرۆسەی كلینیكەكەت ئاسان بكە لە تۆمارکردنی نەخۆش تا پارە وەرگرتن.',
    features: [
      { icon_name: 'CheckCircle2', text_en: 'Patient registration & digital records',  text_ku: 'تۆمارکردنی نەخۆش و پەرتووکی دیجیتاڵ' },
      { icon_name: 'CheckCircle2', text_en: 'Smart appointment scheduling',            text_ku: 'خشتەی چاوپێكەوتنی زیرەک' },
      { icon_name: 'CheckCircle2', text_en: 'Doctor & staff management portal',        text_ku: 'پۆرتاڵی بەڕێوەبردنی دكتۆر و كارمەند' },
      { icon_name: 'CheckCircle2', text_en: 'Billing, invoicing & insurance claims',   text_ku: 'فاتوورە و داواکاری بیمە' },
      { icon_name: 'CheckCircle2', text_en: 'Complete medical history tracking',       text_ku: 'شوێنكەوتنی مێژووی پزیشکی' },
      { icon_name: 'CheckCircle2', text_en: 'Automated SMS & push reminders',          text_ku: 'یادخستنەوەی SMS و پوش ئۆتۆماتیک' },
      { icon_name: 'CheckCircle2', text_en: 'Lab results & reporting module',          text_ku: 'مۆدیوڵی ئەنجامی تاقیگە' },
    ],
    accent: '#10B981', cta_en: 'Request Demo', cta_ku: 'داواکردنی تاقیکاری', href: '#contact', order_index: 2, active: true,
  },
  {
    id: 'mobile', icon_name: 'Smartphone', image_url: null,
    name_en: 'Mobile Applications', name_ku: 'مۆبایل ئەپڵیکەیشن',
    tag_en: 'Apps That Users Love', tag_ku: 'ئەپڵیکەیشنی باشتر بۆ کاربەران',
    desc_en: 'Native-quality iOS and Android apps built with the latest cross-platform technologies. From concept to App Store — we handle design, development, and deployment.',
    desc_ku: 'ئەپڵیکەیشنی iOS و Android بە تەكنەلۆژیای نوێ. لە کۆنسێپت تا App Store یەکسەر بەرپرسین.',
    features: [
      { icon_name: 'CheckCircle2', text_en: 'iOS & Android development',               text_ku: 'دروستکردنی iOS و Android' },
      { icon_name: 'CheckCircle2', text_en: 'Cross-platform with React Native',        text_ku: 'کراس-پلاتفۆرم بە React Native' },
      { icon_name: 'CheckCircle2', text_en: 'Complete UI/UX design included',          text_ku: 'دیزاینی UI/UX تەواو' },
      { icon_name: 'CheckCircle2', text_en: 'Backend API & database integration',      text_ku: 'یەکخستنی API و بنکەی داتا' },
      { icon_name: 'CheckCircle2', text_en: 'Push notifications & deep linking',       text_ku: 'ئاگادارکردنەوەی پوش و دیپ لینک' },
      { icon_name: 'CheckCircle2', text_en: 'App Store & Play Store publishing',       text_ku: 'بڵاوکردنەوە لە App Store و Play Store' },
      { icon_name: 'CheckCircle2', text_en: 'Post-launch support & updates',           text_ku: 'پشتگیری پاش ئەرخستنەوە' },
    ],
    accent: '#8B5CF6', cta_en: 'Request Demo', cta_ku: 'داواکردنی تاقیکاری', href: '#contact', order_index: 3, active: true,
  },
  {
    id: 'web', icon_name: 'Globe', image_url: null,
    name_en: 'Web Development', name_ku: 'وێب سایت',
    tag_en: 'Digital Presence Perfected', tag_ku: 'ئامادەکردنی بووجەی دیجیتاڵ',
    desc_en: 'Bespoke websites and powerful web applications engineered for performance, scalability, and conversion. Crafted to represent your brand at its absolute finest.',
    desc_ku: 'وێبسایت و ئەپڵیکەیشنی وێب بە توانایی بەرز. بۆ نوێنەری بڕاندەکەت لە باشترین ئاستدا.',
    features: [
      { icon_name: 'CheckCircle2', text_en: 'Custom design & brand identity',          text_ku: 'دیزاینی تایبەت و ناسنامەی بڕاند' },
      { icon_name: 'CheckCircle2', text_en: 'Fully responsive & mobile-first',         text_ku: 'ڕێسپۆنسیڤ و مۆبایل-فێرست' },
      { icon_name: 'CheckCircle2', text_en: 'SEO optimisation & Core Web Vitals',      text_ku: 'بەهێزکردنی SEO و Core Web Vitals' },
      { icon_name: 'CheckCircle2', text_en: 'E-commerce & payment integration',        text_ku: 'فرۆشگای ئەلیکترۆنی و پارەدان' },
      { icon_name: 'CheckCircle2', text_en: 'CMS & content management',                text_ku: 'بەڕێوەبردنی ناوەڕۆک (CMS)' },
      { icon_name: 'CheckCircle2', text_en: 'Security hardening & SSL setup',          text_ku: 'پاراستن و SSL' },
      { icon_name: 'CheckCircle2', text_en: 'Analytics & conversion tracking',         text_ku: 'ئامار و شوێنکەوتنی گۆڕانکاری' },
    ],
    accent: '#06B6D4', cta_en: 'Request Demo', cta_ku: 'داواکردنی تاقیکاری', href: '#contact', order_index: 4, active: true,
  },
]

// ── Main component ────────────────────────────────────────────
export default function ProductShowcase({ products }: { products?: DBProduct[] }) {
  const list = products?.length ? products : FALLBACK
  const [active, setActive] = useState(0)
  const [showKu, setShowKu] = useState(true)
  const product = list[active]
  const glow     = hexToRgba(product.accent, 0.18)
  const iconGlow = hexToRgba(product.accent, 0.25)

  return (
    <section
      id="systems"
      className="relative py-20 lg:py-36 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)' }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.4), transparent)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-1.5 rounded-full text-sm font-medium text-yellow-500 mb-6"
            style={{ background: 'rgba(250,204,21,0.09)', border: '1px solid rgba(250,204,21,0.22)' }}
          >
            <span className="font-ku">سیستەمەکانمان</span>
            <span className="text-amber-500/40">·</span>
            <span>Our Systems</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight" style={{ color: '#1e3a8a' }}>
            <span className="block sm:inline">Premium </span>
            <span style={{ backgroundImage: 'linear-gradient(135deg, #facc15, #eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Technology Solutions
            </span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Five powerful systems designed to transform how businesses operate — built with precision and engineered to scale.
          </p>
        </motion.div>

        {/* ── Tab navigation ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8 justify-start sm:justify-center"
        >
          {list.map((p, i) => {
            const isActive = i === active
            return (
              <motion.button
                key={p.id}
                onClick={() => setActive(i)}
                whileTap={{ scale: 0.93 }}
                aria-label={`${p.name_en} — ${p.name_ku}`}
                className="relative flex items-center gap-0 sm:gap-2.5 justify-center
                           w-12 sm:w-auto sm:px-4 h-12 sm:h-auto sm:py-3
                           rounded-xl font-medium whitespace-nowrap
                           transition-all duration-300 flex-shrink-0"
                style={{
                  background: isActive ? `${hexToRgba(p.accent, 0.12)}` : 'rgba(0,0,0,0.03)',
                  border: isActive ? `1px solid ${p.accent}80` : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isActive ? `0 0 22px ${hexToRgba(p.accent, 0.18)}` : 'none',
                }}
              >
                {/* Icon / thumbnail */}
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-300 overflow-hidden"
                  style={{ background: isActive ? `${p.accent}25` : 'rgba(0,0,0,0.05)' }}
                >
                  <DynamicIcon name={p.icon_name} className="w-4 h-4" style={{ color: isActive ? p.accent : '#475569' }} />
                </div>

                {/* Text — hidden on mobile */}
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-sm font-semibold" style={{ color: isActive ? '#0f172a' : '#64748b' }}>
                    {p.name_en}
                  </span>
                  {showKu && (
                    <span className="text-[10px] font-ku mt-0.5" style={{ color: isActive ? `${p.accent}bb` : '#334155', direction: 'rtl' }}>
                      {p.name_ku}
                    </span>
                  )}
                </div>

                {/* Active dot on mobile */}
                {isActive && (
                  <motion.div
                    layoutId="mobileTabDot"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full sm:hidden"
                    style={{ background: p.accent }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Active product name on mobile */}
        <motion.div
          key={`label-${active}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:hidden flex items-center justify-center gap-3 mb-6"
        >
          <span className="text-sm font-semibold text-slate-700">{product.name_en}</span>
          {showKu && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-sm font-bold font-ku" style={{ color: product.accent, direction: 'rtl' }}>
                {product.name_ku}
              </span>
            </>
          )}
        </motion.div>

        {/* ── Language toggle ── */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex justify-end mb-4">
          <button
            onClick={() => setShowKu(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: showKu ? 'rgba(250,204,21,0.1)' : 'rgba(0,0,0,0.04)',
              border: showKu ? '1px solid rgba(250,204,21,0.35)' : '1px solid rgba(0,0,0,0.08)',
              color: showKu ? '#d97706' : '#64748b',
            }}
          >
            <span className="font-ku">کوردی</span>
            <span className="text-slate-700">|</span>
            <span>English</span>
          </button>
        </motion.div>

        {/* ── Content panel ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${active}-${showKu}`}
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
              border: `1px solid ${product.accent}30`,
              boxShadow: `0 0 70px ${glow}, 0 25px 50px rgba(0,0,0,0.08)`,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Corner glow */}
            <div
              className="absolute top-0 right-0 w-64 sm:w-80 h-64 sm:h-80 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle at top right, ${product.accent}10 0%, transparent 70%)` }}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">

              {/* ── Left panel ── */}
              {product.image_url ? (
                /* Full-bleed image layout */
                <div className="relative min-h-[340px] sm:min-h-[420px] lg:min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-black/5">
                  <img
                    src={product.image_url}
                    alt={product.name_en}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.04) 100%)' }} />
                  {/* Text overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8" style={showKu ? { direction: 'rtl' } : {}}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                      {!showKu && (
                        <h3 className="text-2xl sm:text-3xl font-black mb-0.5 leading-tight text-white">
                          {product.name_en}
                        </h3>
                      )}
                      {showKu && (
                        <p className="font-ku font-bold mb-1" style={{ color: product.accent, direction: 'rtl', fontSize: 'clamp(1.3rem, 3.5vw, 1.8rem)' }}>
                          {product.name_ku}
                        </p>
                      )}
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                      className={`text-sm font-medium mb-4 tracking-wide${showKu ? ' font-ku' : ''}`}
                      style={{ color: 'rgba(255,255,255,0.85)' }}
                    >
                      {showKu ? product.tag_ku : product.tag_en}
                    </motion.p>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className="group inline-flex items-center gap-2.5 px-5 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-sm font-bold transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${product.accent} 0%, ${product.accent}cc 100%)`,
                        boxShadow: `0 10px 35px ${glow}`,
                        color: product.accent.toLowerCase() === '#eab308' || product.accent.toLowerCase() === '#facc15' ? '#1e3a8a' : '#ffffff',
                      }}
                    >
                      <span className="font-ku">{product.cta_ku}</span>
                      <span className="opacity-65 text-xs hidden sm:inline">/ {product.cta_en}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Default icon + text layout */
                <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-black/5">
                  <div>
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05, type: 'spring', stiffness: 180 }}
                      className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mb-5 sm:mb-6"
                      style={{
                        background: `${product.accent}15`,
                        border: `1px solid ${product.accent}35`,
                        boxShadow: `0 0 30px ${iconGlow}`,
                      }}
                    >
                      <DynamicIcon name={product.icon_name} className="w-9 h-9 sm:w-11 sm:h-11" style={{ color: product.accent }} />
                    </motion.div>

                    {/* Tagline */}
                    <motion.p
                      initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                      className={`text-sm font-medium text-slate-500 mb-1.5 tracking-wide${showKu ? ' font-ku' : ''}`}
                    >
                      {showKu ? product.tag_ku : product.tag_en}
                    </motion.p>

                    {/* Title */}
                    <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}>
                      {!showKu && (
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-1 leading-tight" style={{ color: '#1e3a8a' }}>
                          {product.name_en}
                        </h3>
                      )}
                      {showKu && (
                        <p
                          className="font-ku font-bold mb-5"
                          style={{ color: product.accent, direction: 'rtl', fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}
                        >
                          {product.name_ku}
                        </p>
                      )}
                    </motion.div>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                      className={`text-slate-600 leading-relaxed text-sm sm:text-[0.95rem]${showKu ? ' font-ku' : ''}`}
                      style={showKu ? { direction: 'rtl', lineHeight: '2' } : {}}
                    >
                      {showKu ? product.desc_ku : product.desc_en}
                    </motion.p>
                  </div>

                  {/* CTA */}
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-8 sm:mt-10">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className="group inline-flex items-center gap-2.5 px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl text-sm font-bold transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${product.accent} 0%, ${product.accent}cc 100%)`,
                        boxShadow: `0 10px 35px ${glow}`,
                        color: product.accent.toLowerCase() === '#eab308' || product.accent.toLowerCase() === '#facc15' ? '#1e3a8a' : '#ffffff',
                      }}
                    >
                      <span className="font-ku">{product.cta_ku}</span>
                      <span className="opacity-65 text-xs hidden sm:inline">/ {product.cta_en}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </motion.button>
                  </motion.div>
                </div>
              )}

              {/* ── Right panel — features ── */}
              <div className={`p-6 sm:p-8 lg:p-12${showKu ? ' text-right' : ''}`} style={showKu ? { direction: 'rtl' } : {}}>
                <p className={`text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-6${showKu ? ' font-ku' : ''}`}>
                  {showKu ? 'تایبەتمەندییە سەرەکیەکان' : 'Key Features'}
                </p>
                <ul className="space-y-3 sm:space-y-4">
                  {product.features.map((feat, i) => (
                    <motion.li
                      key={`${active}-${i}`}
                      initial={{ opacity: 0, x: showKu ? -18 : 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.07 + i * 0.05 }}
                      className="flex items-start gap-3 group"
                    >
                      <div
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                        style={{ background: `${product.accent}18`, boxShadow: `0 0 8px ${glow}` }}
                      >
                        <CheckCircle2 className="w-4 h-4" style={{ color: product.accent }} />
                      </div>
                      <span
                        className={`text-slate-700 group-hover:text-slate-900 transition-colors duration-200 text-sm leading-relaxed${showKu ? ' font-ku' : ''}`}
                      >
                        {showKu ? feat.text_ku : feat.text_en}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Bottom note */}
                <div className={`mt-8 sm:mt-10 pt-6 sm:pt-7 flex items-center gap-3${showKu ? ' flex-row-reverse' : ''}`} style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                  <MonitorSmartphone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className={`text-xs text-slate-500${showKu ? ' font-ku' : ''}`}>
                    {showKu ? 'بەردەستە لە دێسکتۆپ، تابلێت و مۆبایل' : 'Available on Desktop, Tablet & Mobile'}
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
