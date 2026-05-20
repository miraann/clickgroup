'use client'

import { motion } from 'framer-motion'
import { Zap, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react'
import { defaultSettings, type SiteSettings } from '@/lib/siteSettings'

const FOOTER_BINARY_COLUMNS = [
  { x: '1%',  chars: ['0','1','0','1','1','0','1','0'], delay: 0.10, dur: 2.2 },
  { x: '5%',  chars: ['1','0','0','1','0','1','0','1'], delay: 0.50, dur: 1.8 },
  { x: '9%',  chars: ['0','1','1','0','1','1','0','0'], delay: 0.25, dur: 2.5 },
  { x: '13%', chars: ['1','1','0','1','0','0','1','1'], delay: 0.70, dur: 1.6 },
  { x: '17%', chars: ['0','0','1','0','1','0','1','0'], delay: 0.35, dur: 2.0 },
  { x: '21%', chars: ['1','0','1','1','0','1','0','0'], delay: 0.60, dur: 1.9 },
  { x: '25%', chars: ['0','1','0','0','1','1','1','0'], delay: 0.15, dur: 2.3 },
  { x: '29%', chars: ['1','1','1','0','0','0','1','1'], delay: 0.80, dur: 1.7 },
  { x: '33%', chars: ['0','0','1','1','0','1','1','0'], delay: 0.40, dur: 2.1 },
  { x: '37%', chars: ['1','0','0','0','1','0','0','1'], delay: 0.05, dur: 2.4 },
  { x: '41%', chars: ['0','1','1','0','1','0','1','0'], delay: 0.55, dur: 1.8 },
  { x: '45%', chars: ['1','0','1','0','0','1','0','1'], delay: 0.30, dur: 2.0 },
  { x: '49%', chars: ['0','1','0','1','1','0','1','1'], delay: 0.65, dur: 1.6 },
  { x: '53%', chars: ['1','1','0','0','1','1','0','0'], delay: 0.20, dur: 2.2 },
  { x: '57%', chars: ['0','0','1','1','0','0','1','0'], delay: 0.45, dur: 1.9 },
  { x: '61%', chars: ['1','0','0','1','1','0','1','0'], delay: 0.12, dur: 2.3 },
  { x: '65%', chars: ['0','1','1','0','0','1','0','1'], delay: 0.58, dur: 1.7 },
  { x: '69%', chars: ['1','1','0','1','0','1','1','0'], delay: 0.33, dur: 2.0 },
  { x: '73%', chars: ['0','0','1','0','1','0','0','1'], delay: 0.72, dur: 1.8 },
  { x: '77%', chars: ['1','0','0','1','0','1','0','0'], delay: 0.22, dur: 2.4 },
  { x: '81%', chars: ['0','1','1','1','0','1','1','0'], delay: 0.48, dur: 1.6 },
  { x: '85%', chars: ['1','0','1','0','1','0','1','1'], delay: 0.08, dur: 2.1 },
  { x: '89%', chars: ['0','1','0','0','1','0','0','1'], delay: 0.62, dur: 1.9 },
  { x: '93%', chars: ['1','1','0','1','1','0','0','1'], delay: 0.38, dur: 2.2 },
  { x: '97%', chars: ['0','0','1','0','0','1','1','0'], delay: 0.75, dur: 1.7 },
]

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function Footer({ settings = defaultSettings }: { settings?: SiteSettings }) {
  const s = settings

  const ALL_SOCIAL = [
    { Icon: Facebook,    href: s.facebook_url,  label: 'Facebook'  },
    { Icon: Instagram,   href: s.instagram_url, label: 'Instagram' },
    { Icon: Linkedin,    href: s.linkedin_url,  label: 'LinkedIn'  },
    { Icon: TikTokIcon,  href: s.tiktok_url,   label: 'TikTok'   },
    { Icon: WhatsAppIcon, href: s.whatsapp_url, label: 'WhatsApp' },
  ]
  const SOCIAL = ALL_SOCIAL.filter(({ href }) => href && href !== '#')

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: '#f8fafc' }}
    >
      {/* Top divider */}
      <div
        className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.3), transparent)' }}
      />

      {/* Binary rain — bounded container like hero */}
      <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none overflow-hidden">
        {FOOTER_BINARY_COLUMNS.map((col, ci) => (
          <div
            key={ci}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: col.x }}
          >
            {col.chars.map((ch, chi) => (
              <motion.span
                key={chi}
                className="block text-[13px] font-mono leading-[17px] font-black select-none"
                style={{ color: ch === '1' ? '#facc15' : '#ca8a04' }}
                animate={{
                  opacity: [0, ch === '1' ? 1 : 0.45, 0],
                  textShadow: ch === '1'
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
                {ch}
              </motion.span>
            ))}
          </div>
        ))}
        {/* Fade into footer content */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #f8fafc)' }}
        />
      </div>

      {/* Subtle ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom, rgba(250,204,21,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-14">

          {/* ── Brand ── */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              {s.logo_url ? (
                <img
                  src={s.logo_url}
                  alt={`${s.brand_en_part1}${s.brand_en_part2} logo`}
                  className="object-contain"
                  style={{ width: 60, height: 60 }}
                />
              ) : (
                <div
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #facc15, #eab308)',
                    boxShadow: '0 4px 20px rgba(250,204,21,0.4)',
                  }}
                >
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="font-black text-xl" style={{ color: '#1e3a8a' }}>
                  {s.brand_en_part1}<span className="text-yellow-500">{s.brand_en_part2}</span>
                </span>
                <span className="text-[9px] font-semibold tracking-[0.22em] uppercase text-yellow-600/70">
                  {s.logo_tagline}
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              <span className="font-ku text-slate-500">{s.footer_desc_ku}</span>
              <br />
              {s.footer_desc_en}
            </p>

            {/* Social */}
            <div className="flex items-center gap-2.5">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-yellow-500 transition-all duration-200"
                  style={{
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(250,204,21,0.08)'
                    e.currentTarget.style.border = '1px solid rgba(250,204,21,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                    e.currentTarget.style.border = '1px solid rgba(0,0,0,0.08)'
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Contact ── */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.18em]">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${s.phone.replace(/\s/g, '')}`}
                  className="group flex items-center gap-3"
                >
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 transition-all duration-200 group-hover:scale-105"
                    style={{
                      background: 'rgba(250,204,21,0.1)',
                      border: '1px solid rgba(250,204,21,0.2)',
                    }}
                  >
                    <Phone className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 group-hover:text-yellow-600 transition-colors font-medium">
                      {s.phone}
                    </p>
                    <p className="text-xs text-slate-400 font-ku">ژمارەی تەلەفۆن</p>
                  </div>
                </a>
              </li>

              <li>
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(250,204,21,0.1)',
                      border: '1px solid rgba(250,204,21,0.2)',
                    }}
                  >
                    <MapPin className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 leading-snug">{s.address_en}</p>
                    <p className="text-xs text-slate-400 font-ku mt-0.5">{s.address_ku}</p>
                  </div>
                </div>
              </li>

            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left"
          style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
        >
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {s.brand_en_part1} {s.brand_en_part2} —{' '}
            <span className="font-ku">{s.brand_ku}</span>. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 font-ku">
            {s.footer_desc_ku}
          </p>
        </div>
      </div>
    </footer>
  )
}
