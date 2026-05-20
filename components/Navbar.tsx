'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap } from 'lucide-react'
import { defaultSettings, type SiteSettings } from '@/lib/siteSettings'

const NAV_LINKS = [
  { label: 'Home', labelKu: 'سەرەکی', href: 'home' },
  { label: 'Systems', labelKu: 'سیستەمەکان', href: 'systems' },
  { label: 'Contact', labelKu: 'پەیوەندی', href: 'contact' },
]

export default function Navbar({ settings = defaultSettings }: { settings?: SiteSettings }) {
  const s = settings
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setActiveLink(id)
    setMobileOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'backdrop-blur-2xl border-b border-yellow-400/20 shadow-lg shadow-slate-200/60'
          : 'bg-transparent'
      }`}
      style={scrolled ? { background: 'rgba(255,255,255,0.92)' } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ── */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollTo('home')}
            className="flex items-center gap-2.5 focus:outline-none"
          >
            {s.logo_url ? (
              <img
                src={s.logo_url}
                alt={`${s.brand_en_part1}${s.brand_en_part2} logo`}
                className="object-contain"
                style={{ width: 60, height: 60 }}
              />
            ) : (
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-400/40">
                <Zap className="w-5 h-5 text-white fill-white" />
                <div className="absolute inset-0 rounded-xl ring-1 ring-amber-300/30" />
              </div>
            )}
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg tracking-tight" style={{ color: '#1e3a8a' }}>
                {s.brand_en_part1}<span className="text-yellow-400">{s.brand_en_part2}</span>
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#1e3a8a99' }}>
                {s.logo_tagline}
              </span>
            </div>
          </motion.button>

          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeLink === link.href
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive ? 'text-yellow-500' : 'text-slate-600 hover:text-[#1e3a8a]'
                  } font-bold`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute inset-0 rounded-lg bg-yellow-400/10 border border-yellow-400/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </button>
              )
            })}
          </div>

          {/* ── Desktop CTA ── */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(250,204,21,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollTo('contact')}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg shadow-yellow-400/30 transition-shadow duration-300"
            style={{ color: '#1e3a8a', fontFamily: 'var(--font-ku)' }}
          >
            <span>{s.nav_cta_ku}</span>
          </motion.button>

          {/* ── Mobile Burger ── */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-black/5 transition-all duration-200"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-b border-yellow-400/20 backdrop-blur-2xl"
            style={{ background: 'rgba(255,255,255,0.97)' }}
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => scrollTo(link.href)}
                  className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-sm font-medium text-slate-700 hover:text-yellow-600 hover:bg-yellow-400/10 transition-all duration-200"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-slate-400 font-ku">{link.labelKu}</span>
                </motion.button>
              ))}
              <div className="pt-2">
                <button
                  onClick={() => scrollTo('contact')}
                  className="w-full py-3.5 text-sm font-bold text-[#020817] bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl"
                  style={{ fontFamily: 'var(--font-ku)' }}
                >
                  {s.nav_cta_ku}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
