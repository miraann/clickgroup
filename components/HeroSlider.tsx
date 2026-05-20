'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type Slide = {
  id: string
  title_en: string
  title_ku: string
  subtitle_en: string
  subtitle_ku: string
  cta_text_ku: string
  cta_text_en: string
  cta_href: string
  gradient: string
  bg_image_url: string | null
  char_image_url: string | null
  order_index: number
}

const SLIDE_DURATION = 6000

/* ── Ambient orbs for gradient-only slides ── */
const ORBS = [
  { w: 700, h: 700, l: '55%', t: '-20%', color: 'rgba(250,204,21,0.09)', dur: 12 },
  { w: 450, h: 450, l: '-5%', t: '25%',  color: 'rgba(59,130,246,0.07)', dur: 10 },
  { w: 320, h: 320, l: '30%', t: '60%',  color: 'rgba(250,204,21,0.07)', dur: 14 },
]

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchX = useRef(0)

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir)
    setCurrent(idx)
  }, [])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(prev => (prev + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent(prev => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (paused || slides.length <= 1) return
    timerRef.current = setTimeout(next, SLIDE_DURATION)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current, paused, next, slides.length])

  if (!slides.length) return null

  const slide = slides[current]
  const hasChar = !!slide.char_image_url
  const hasBg   = !!slide.bg_image_url

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(480px, 90vh, 900px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        const delta = touchX.current - e.changedTouches[0].clientX
        if (Math.abs(delta) > 48) delta > 0 ? next() : prev()
      }}
    >

      {/* ════════════════════════════════════════
          LAYER 1 — Background (crossfade)
      ════════════════════════════════════════ */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${current}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          {hasBg ? (
            <>
              {/* Ken Burns zoom */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.img
                  src={slide.bg_image_url!}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: 'blur(3px) saturate(1.15)', willChange: 'transform' }}
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.1 }}
                  transition={{ duration: SLIDE_DURATION / 1000 + 1, ease: 'linear' }}
                />
              </div>
              {/* Mobile: uniform dark overlay for centered text readability */}
              <div className="lg:hidden absolute inset-0" style={{ background: 'rgba(4,9,28,0.78)' }} />
              {/* Desktop: left-heavy when character is present */}
              <div
                className="hidden lg:block absolute inset-0"
                style={{
                  background: hasChar
                    ? 'linear-gradient(110deg, rgba(4,9,28,0.92) 35%, rgba(4,9,28,0.55) 65%, rgba(4,9,28,0.20) 100%)'
                    : 'linear-gradient(180deg, rgba(4,9,28,0.78) 0%, rgba(4,9,28,0.60) 100%)',
                }}
              />
              {/* Subtle gradient tint */}
              <div className="absolute inset-0 opacity-20" style={{ background: slide.gradient }} />
            </>
          ) : (
            <>
              {/* Fallback: pure gradient */}
              <div className="absolute inset-0" style={{ background: slide.gradient }} />
              {/* Orbs for gradient-only slides */}
              {ORBS.map((orb, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: orb.w, height: orb.h, left: orb.l, top: orb.t,
                    background: `radial-gradient(circle at center,${orb.color} 0%,transparent 70%)`,
                  }}
                  animate={{ y: [0, -18, 4, 0], x: [0, 10, -5, 0] }}
                  transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
                />
              ))}
            </>
          )}

          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(250,204,21,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(250,204,21,0.04) 1px,transparent 1px)`,
              backgroundSize: '64px 64px',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gold top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
        style={{ background: 'linear-gradient(90deg,transparent,#facc15 40%,#eab308 60%,transparent)' }} />

      {/* ════════════════════════════════════════
          LAYER 2 — Slide content
      ════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${current}`}
          className="absolute inset-0 z-10 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* ── Mobile character — TOP of column (above text) ── */}
          {hasChar && (
            <motion.div
              className="lg:hidden flex-shrink-0 flex justify-end pr-4 pt-3"
              style={{ height: '42%' }}
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 0.95, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <img
                src={slide.char_image_url!}
                alt=""
                className="h-full w-auto object-contain object-bottom pointer-events-none select-none"
                style={{ filter: 'drop-shadow(0 0 30px rgba(250,204,21,0.28)) drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
                draggable={false}
              />
            </motion.div>
          )}

          {/* ── Desktop character — absolute right side ── */}
          {hasChar && (
            <motion.div
              className="hidden lg:flex absolute right-0 top-0 bottom-0 w-[48%] xl:w-[44%] items-end justify-center z-10"
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Glow aura */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(250,204,21,0.22) 0%, rgba(30,58,138,0.12) 50%, transparent 75%)',
                  filter: 'blur(50px)',
                }}
              />
              <motion.img
                src={slide.char_image_url!}
                alt=""
                className="relative w-auto object-contain object-bottom select-none pointer-events-none"
                style={{
                  height: '88%',
                  maxHeight: '88%',
                  filter: 'drop-shadow(0 0 80px rgba(250,204,21,0.28)) drop-shadow(0 40px 60px rgba(0,0,0,0.6))',
                }}
                animate={{ y: [0, -16, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                draggable={false}
              />
            </motion.div>
          )}

          {/* ── Text block — fills remaining space on mobile, centered on desktop ── */}
          <div className="flex-1 lg:absolute lg:inset-0 flex items-center w-full">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
              <div className={`flex flex-col ${hasChar ? 'w-full lg:w-[52%] text-center lg:text-left items-center lg:items-start' : 'w-full text-center items-center'}`}>

                {/* Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-bold tracking-widest uppercase"
                  style={{
                    background: 'rgba(250,204,21,0.12)',
                    border: '1px solid rgba(250,204,21,0.35)',
                    color: '#facc15',
                  }}
                  initial={{ opacity: 0, y: 16, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.45 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  ClickGroup
                </motion.div>

                {/* English title */}
                <motion.h2
                  className="font-black text-white leading-[1.05] tracking-tight mb-2 max-w-2xl"
                  style={{ fontSize: 'clamp(1.7rem, 7vw, 4.2rem)' }}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {slide.title_en.split(' ').map((word, i, arr) => {
                    const mid = Math.floor(arr.length / 2)
                    return i === mid ? (
                      <span key={i} style={{
                        backgroundImage: 'linear-gradient(135deg,#facc15,#eab308)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        {' '}{word}{' '}
                      </span>
                    ) : `${i === 0 ? '' : ' '}${word}`
                  })}
                </motion.h2>

                {/* Kurdish title */}
                <motion.p
                  className="font-ku font-bold text-yellow-400 mb-3"
                  style={{ fontSize: 'clamp(1rem, 4vw, 1.7rem)', direction: 'rtl' }}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {slide.title_ku}
                </motion.p>

                {/* Divider */}
                <motion.div
                  className="w-14 h-[2px] mb-3"
                  style={{ background: 'linear-gradient(90deg,#facc15,transparent)' }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.38, duration: 0.45 }}
                />

                {/* Subtitle */}
                <motion.p
                  className="text-white/55 max-w-lg leading-relaxed mb-5"
                  style={{ fontSize: 'clamp(0.875rem, 3vw, 1.05rem)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.42, duration: 0.5 }}
                >
                  {slide.subtitle_en}
                </motion.p>

                {/* CTA */}
                <motion.a
                  href={slide.cta_href}
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl font-bold transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg,#facc15,#eab308)',
                    color: '#0f172a',
                    boxShadow: '0 8px 32px rgba(250,204,21,0.4)',
                    fontSize: 'clamp(0.9rem,2.5vw,1rem)',
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.52, duration: 0.5 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 14px 42px rgba(250,204,21,0.55)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="font-ku">{slide.cta_text_ku}</span>
                  <span className="text-sm font-medium opacity-60">/ {slide.cta_text_en}</span>
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ════════════════════════════════════════
          LAYER 3 — Controls
      ════════════════════════════════════════ */}

      {/* Arrow buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={next}
            className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`Slide ${i + 1}`}
              className="flex items-center justify-center p-1"
            >
              <motion.div
                animate={{ width: i === current ? 28 : 6, opacity: i === current ? 1 : 0.38 }}
                transition={{ duration: 0.35 }}
                className="h-[5px] rounded-full"
                style={{ background: i === current ? '#facc15' : 'rgba(255,255,255,0.7)' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {slides.length > 1 && !paused && (
        <motion.div
          key={`progress-${current}`}
          className="absolute bottom-0 left-0 h-[3px] z-20"
          style={{ background: 'linear-gradient(90deg,#facc15,#eab308)', originX: 0, width: '100%' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
        />
      )}

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(2,6,23,0.45))' }} />
    </section>
  )
}
