'use client'

import { motion } from 'framer-motion'
import { ArrowDown, ChevronRight, Sparkles, Cpu, Wifi, Database, Code2, Shield } from 'lucide-react'
import { defaultSettings, type SiteSettings } from '@/lib/siteSettings'

const BINARY_COLUMNS = [
  { x: '2%',  chars: ['1','0','1','0','1','0','1','0'], delay: 0.00, dur: 1.5 },
  { x: '8%',  chars: ['0','1','1','0','1','0','0','1'], delay: 0.30, dur: 2.1 },
  { x: '14%', chars: ['1','1','0','1','0','1','1','0'], delay: 0.10, dur: 1.7 },
  { x: '20%', chars: ['0','0','1','0','1','1','0','1'], delay: 0.55, dur: 1.9 },
  { x: '26%', chars: ['1','0','0','1','1','0','1','0'], delay: 0.20, dur: 1.4 },
  { x: '32%', chars: ['0','1','0','0','1','0','1','1'], delay: 0.70, dur: 2.3 },
  { x: '38%', chars: ['1','1','1','0','0','1','0','0'], delay: 0.40, dur: 1.6 },
  { x: '44%', chars: ['0','0','0','1','1','0','1','1'], delay: 0.65, dur: 2.0 },
  { x: '50%', chars: ['1','0','1','1','0','0','1','0'], delay: 0.05, dur: 1.8 },
  { x: '56%', chars: ['0','1','0','1','1','1','0','0'], delay: 0.45, dur: 1.5 },
  { x: '62%', chars: ['1','1','0','0','0','1','1','0'], delay: 0.25, dur: 2.2 },
  { x: '68%', chars: ['0','0','1','1','0','1','0','1'], delay: 0.60, dur: 1.7 },
  { x: '74%', chars: ['1','0','0','0','1','0','1','1'], delay: 0.35, dur: 1.9 },
  { x: '80%', chars: ['0','1','1','1','0','1','0','0'], delay: 0.50, dur: 2.4 },
  { x: '86%', chars: ['1','1','0','1','1','0','1','0'], delay: 0.15, dur: 1.6 },
  { x: '92%', chars: ['0','0','1','0','0','1','1','1'], delay: 0.75, dur: 2.0 },
]

const ORBS = [
  { w: 700, h: 700, l: '55%',  t: '-15%', color: 'rgba(250,204,21,0.12)',  dur: 10, delay: 0   },
  { w: 500, h: 500, l: '-8%',  t: '20%',  color: 'rgba(59,130,246,0.08)',  dur: 12, delay: 1.5 },
  { w: 350, h: 350, l: '40%',  t: '55%',  color: 'rgba(250,204,21,0.09)',  dur: 9,  delay: 0.8 },
  { w: 280, h: 280, l: '15%',  t: '-5%',  color: 'rgba(139,92,246,0.08)', dur: 11, delay: 2   },
]

const FLOATING_ICONS = [
  { Icon: Cpu,      x: '8%',  y: '22%', delay: 0,   size: 28 },
  { Icon: Wifi,     x: '88%', y: '18%', delay: 0.4, size: 26 },
  { Icon: Database, x: '82%', y: '62%', delay: 0.8, size: 28 },
  { Icon: Code2,    x: '5%',  y: '70%', delay: 1.2, size: 26 },
  { Icon: Shield,   x: '50%', y: '88%', delay: 1.6, size: 24 },
]

export default function HeroSection({ settings = defaultSettings }: { settings?: SiteSettings }) {
  const s = settings

  const stats = [
    { value: s.stat1_value, label: s.stat1_label_en, labelKu: s.stat1_label_ku },
    { value: s.stat2_value, label: s.stat2_label_en, labelKu: s.stat2_label_ku },
    { value: s.stat3_value, label: s.stat3_label_en, labelKu: s.stat3_label_ku },
  ]

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 70% 40%, #fefce8 0%, #ffffff 65%)' }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(250,204,21,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,204,21,1) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Glowing orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.w,
            height: orb.h,
            left: orb.l,
            top: orb.t,
            background: `radial-gradient(circle at center, ${orb.color} 0%, transparent 70%)`,
          }}
          animate={{ y: [0, -25, 5, 0], x: [0, 12, -8, 0], scale: [1, 1.04, 0.98, 1] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
        />
      ))}

      {/* Rotating rings */}
      <motion.div
        className="hidden md:block absolute right-[-120px] top-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(250,204,21,0.25)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="hidden md:block absolute right-[-60px] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(250,204,21,0.15)' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating tech icons */}
      {FLOATING_ICONS.map(({ Icon, x, y, delay, size }, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none hidden lg:flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{
            left: x,
            top: y,
            background: 'rgba(250,204,21,0.12)',
            border: '1px solid rgba(250,204,21,0.3)',
            backdropFilter: 'blur(4px)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { delay: delay + 1, duration: 0.5 },
            scale: { delay: delay + 1, duration: 0.5 },
            y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: delay },
          }}
        >
          <Icon style={{ color: '#eab308' }} size={size} />
        </motion.div>
      ))}

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">

        {/* Binary rain */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="relative h-28 w-full max-w-2xl mx-auto mb-0 pointer-events-none overflow-hidden"
        >
          {BINARY_COLUMNS.map((col, ci) => (
            <div key={ci} className="absolute top-0 flex flex-col items-center" style={{ left: col.x }}>
              {col.chars.map((char, chi) => (
                <motion.span
                  key={chi}
                  className="block text-[13px] font-mono leading-[17px] font-black select-none"
                  style={{
                    color: char === '1' ? '#facc15' : '#ca8a04',
                  }}
                  animate={{
                    opacity: [0, char === '1' ? 1 : 0.45, 0],
                    textShadow: char === '1'
                      ? ['0 0 0px rgba(250,204,21,0)', '0 0 14px rgba(250,204,21,1), 0 0 28px rgba(250,204,21,0.5)', '0 0 0px rgba(250,204,21,0)']
                      : ['none', 'none', 'none'],
                  }}
                  transition={{
                    duration: col.dur,
                    repeat: Infinity,
                    delay: col.delay + chi * 0.18,
                    ease: 'easeInOut',
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          ))}
          {/* Fade out toward badge */}
          <div
            className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(254,252,232,1))' }}
          />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 rounded-full mb-10 text-sm font-medium text-center max-w-[95vw]"
          style={{
            background: 'rgba(250,204,21,0.1)',
            border: '1px solid rgba(250,204,21,0.3)',
            color: '#ca8a04',
          }}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span className="font-ku">{s.badge_ku}</span>
          <span className="hidden sm:inline" style={{ color: 'rgba(202,138,4,0.4)' }}>·</span>
          <span className="hidden sm:inline">{s.badge_en}</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-black leading-none tracking-tight mb-4"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}
        >
          <span style={{ color: '#1e3a8a' }}>{s.brand_en_part1}</span>
          <span
            style={{
              backgroundImage: 'linear-gradient(135deg, #facc15 0%, #eab308 60%, #ca8a04 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {s.brand_en_part2}
          </span>
        </motion.h1>

        {/* Kurdish title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mb-7 space-y-1"
        >
          <p
            className="font-ku font-bold tracking-wide"
            style={{ direction: 'rtl', fontSize: 'clamp(1.6rem, 6vw, 2.8rem)', color: '#eab308' }}
          >
            {s.brand_ku}
          </p>
          <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase font-medium">
            {s.hero_location}
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
        >
          {s.hero_tagline_en}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(250,204,21,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollTo('systems')}
            className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
              boxShadow: '0 8px 32px rgba(250,204,21,0.4)',
              color: '#1e3a8a',
            }}
          >
            <span className="font-ku relative z-10">{s.cta_primary_ku}</span>
            <span className="text-sm opacity-60 relative z-10">/ {s.cta_primary_en}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200 relative z-10" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)' }}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollTo('contact')}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
            style={{
              background: 'rgba(30,58,138,0.05)',
              border: '1px solid rgba(30,58,138,0.15)',
              color: '#1e3a8a',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(30,58,138,0.1)'
              e.currentTarget.style.border = '1px solid rgba(30,58,138,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30,58,138,0.05)'
              e.currentTarget.style.border = '1px solid rgba(30,58,138,0.15)'
            }}
          >
            {s.cta_secondary_en}
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-wrap items-center justify-center gap-10 sm:gap-20 mt-20 mb-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group cursor-default">
              <div
                className="text-4xl sm:text-5xl font-black mb-1"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #facc15, #eab308)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.value}
              </div>
              <div className="text-xs font-medium tracking-wide" style={{ color: '#1e3a8a' }}>{stat.label}</div>
              <div className="text-[10px] text-slate-400 font-ku mt-0.5">{stat.labelKu}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        onClick={() => scrollTo('systems')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group"
      >
        <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-slate-400 group-hover:text-slate-600 transition-colors">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 transition-colors"
          style={{ border: '1px solid rgba(0,0,0,0.12)' }}
        >
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.button>
    </section>
  )
}
