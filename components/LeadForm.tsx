'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Building2, MapPin, Monitor, ChevronDown, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FormData {
  name: string
  phone: string
  businessName: string
  location: string
  businessType: string
  system: string
  note: string
}

type BizTypeOption = { label_en: string; label_ku: string }
type SystemOption  = { label_en: string; label_ku: string }

const DEFAULT_SYSTEMS: SystemOption[] = [
  { label_en: 'Digital Menu System',      label_ku: 'دێسکتاپ مینو'               },
  { label_en: 'Restaurant POS System',    label_ku: 'سیستەمی ڕێستۆرانت'          },
  { label_en: 'Clinic Management System', label_ku: 'سیستەمی بەڕێوبەردنی کلینیک' },
  { label_en: 'Mobile Applications',      label_ku: 'مۆبایل ئەپڵیکەیشن'          },
  { label_en: 'Web Development',          label_ku: 'وێب سایت'                    },
]

const DEFAULT_BUSINESS_TYPES: BizTypeOption[] = [
  { label_en: 'Restaurant',  label_ku: 'مەخمەر'   },
  { label_en: 'Clinic',      label_ku: 'کلینیک'   },
  { label_en: 'Hotel',       label_ku: 'ئوتێل'    },
  { label_en: 'Retail Shop', label_ku: 'فرۆشگا'   },
  { label_en: 'Corporate',   label_ku: 'کۆمپانیا' },
  { label_en: 'Other',       label_ku: 'تر'       },
]

const EMPTY: FormData = { name: '', phone: '', businessName: '', location: '', businessType: '', system: '', note: '' }

function KuSelect({ value, options, onChange, borderStyle, onFocus, onBlur, icon: Icon, placeholder }: {
  value: string
  options: { label_en: string; label_ku: string }[]
  onChange: (v: string) => void
  borderStyle: React.CSSProperties
  onFocus: () => void
  onBlur: () => void
  icon: React.ElementType
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.label_en === value)

  useEffect(() => {
    if (!open) return
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        onBlur()
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open, onBlur])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { if (open) { setOpen(false); onBlur() } else { setOpen(true); onFocus() } }}
        className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-300 text-left flex items-center gap-3"
        style={borderStyle}
      >
        <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 pointer-events-none" />
        <span className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
          {selected ? (
            <>
              <span className="text-slate-900 truncate">{selected.label_en}</span>
              <span className="text-slate-300 flex-shrink-0">/</span>
              <span className="text-slate-500 flex-shrink-0 truncate" style={{ fontFamily: 'var(--font-ku)' }}>{selected.label_ku}</span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden border border-slate-200 bg-white z-50"
          style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
        >
          {options.map(opt => {
            const sel = opt.label_en === value
            return (
              <button
                key={opt.label_en}
                type="button"
                onClick={() => { onChange(opt.label_en); setOpen(false); onBlur() }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-yellow-50 border-b border-slate-50 last:border-0"
                style={{ background: sel ? 'rgba(250,204,21,0.06)' : undefined }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors" style={{ background: sel ? '#eab308' : '#e2e8f0' }} />
                <span className="flex-1 text-slate-800 font-medium">{opt.label_en}</span>
                <span className="text-slate-400 text-xs flex-shrink-0" style={{ fontFamily: 'var(--font-ku)' }}>{opt.label_ku}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function LeadForm({ businessTypes, systems }: { businessTypes?: BizTypeOption[]; systems?: SystemOption[] }) {
  const bizOptions = businessTypes?.length ? businessTypes : DEFAULT_BUSINESS_TYPES
  const sysOptions = systems?.length ? systems : DEFAULT_SYSTEMS
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [focused, setFocused] = useState<keyof FormData | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validate = (): boolean => {
    const e: Partial<FormData> = {}
    if (!form.name.trim())         e.name         = 'Full name is required'
    if (!form.phone.trim())        e.phone        = 'Phone number is required'
    if (!form.businessName.trim()) e.businessName = 'Business name is required'
    if (!form.location.trim())     e.location     = 'Location is required'
    if (!form.businessType)        e.businessType = 'Please select your business type'
    if (!form.system)              e.system       = 'Please select a system'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSubmitError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('leads').insert({
        full_name:     form.name,
        phone:         form.phone,
        business_name: form.businessName,
        location:      form.location,
        business_type: form.businessType,
        system:        form.system,
        note:          form.note || null,
      })
      if (error) throw error
      setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fieldBorderStyle = (field: keyof FormData) => {
    if (errors[field])    return { border: '1px solid rgba(239,68,68,0.5)',  background: 'rgba(239,68,68,0.04)',  boxShadow: '0 0 12px rgba(239,68,68,0.08)' }
    if (focused === field) return { border: '1px solid rgba(250,204,21,0.6)', background: 'rgba(250,204,21,0.04)', boxShadow: '0 0 20px rgba(250,204,21,0.12)' }
    return { border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)' }
  }

  const baseInput = 'w-full rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 text-sm outline-none transition-all duration-300'

  return (
    <section
      id="contact"
      className="relative py-16 sm:py-24 lg:py-36 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f1f5f9 0%, #f8fafc 60%, #ffffff 100%)' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(250,204,21,1) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-1.5 rounded-full text-sm font-medium text-yellow-500 mb-6"
            style={{ background: 'rgba(250,204,21,0.09)', border: '1px solid rgba(250,204,21,0.22)' }}
          >
            <span className="font-ku">ئێستا داواکاری پێشکەش بکە</span>
            <span className="text-amber-500/40">·</span>
            <span>Request Now</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4" style={{ color: '#1e3a8a' }}>
            Get Started{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #facc15, #d97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Today
            </span>
          </h2>
          <p className="text-slate-600 text-lg">
            Fill in the form and our team will reach out within 48 hours.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.08), 0 0 40px rgba(250,204,21,0.08)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Gold top line */}
          <div
            className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.55), transparent)' }}
          />

          <div className="p-5 sm:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                  noValidate
                >
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Full Name
                      <span className="ml-2 text-xs text-slate-400 font-ku">/ ناوی تەواو</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((v) => ({ ...v, name: '' })) }}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        className={`${baseInput} pl-11`}
                        style={fieldBorderStyle('name')}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5 text-xs text-red-400 pl-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Phone Number
                      <span className="ml-2 text-xs text-slate-400 font-ku">/ ژمارەی تەلەفۆن</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="+964 7XX XXX XXXX"
                        value={form.phone}
                        onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setErrors((v) => ({ ...v, phone: '' })) }}
                        onFocus={() => setFocused('phone')}
                        onBlur={() => setFocused(null)}
                        className={`${baseInput} pl-11`}
                        style={fieldBorderStyle('phone')}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5 text-xs text-red-400 pl-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Business Name
                      <span className="ml-2 text-xs text-slate-400 font-ku">/ ناوی بازرگانی</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Your business name"
                        value={form.businessName}
                        onChange={(e) => { setForm((f) => ({ ...f, businessName: e.target.value })); setErrors((v) => ({ ...v, businessName: '' })) }}
                        onFocus={() => setFocused('businessName')}
                        onBlur={() => setFocused(null)}
                        className={`${baseInput} pl-11`}
                        style={fieldBorderStyle('businessName')}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.businessName && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5 text-xs text-red-400 pl-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.businessName}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Location
                      <span className="ml-2 text-xs text-slate-400 font-ku">/ شوێن</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="City / Region"
                        value={form.location}
                        onChange={(e) => { setForm((f) => ({ ...f, location: e.target.value })); setErrors((v) => ({ ...v, location: '' })) }}
                        onFocus={() => setFocused('location')}
                        onBlur={() => setFocused(null)}
                        className={`${baseInput} pl-11`}
                        style={fieldBorderStyle('location')}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.location && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5 text-xs text-red-400 pl-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.location}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Business Type */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Business Type
                      <span className="ml-2 text-xs text-slate-400" style={{ fontFamily: 'var(--font-ku)' }}>/ جۆری کار</span>
                    </label>
                    <KuSelect
                      value={form.businessType}
                      options={bizOptions}
                      onChange={(v) => { setForm((f) => ({ ...f, businessType: v })); setErrors((e) => ({ ...e, businessType: '' })) }}
                      borderStyle={fieldBorderStyle('businessType')}
                      onFocus={() => setFocused('businessType')}
                      onBlur={() => setFocused(null)}
                      icon={Building2}
                      placeholder="Select business type…"
                    />
                    <AnimatePresence>
                      {errors.businessType && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5 text-xs text-red-400 pl-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.businessType}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* System Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      System of Interest
                      <span className="ml-2 text-xs text-slate-400" style={{ fontFamily: 'var(--font-ku)' }}>/ سیستەمی داواکراو</span>
                    </label>
                    <KuSelect
                      value={form.system}
                      options={sysOptions}
                      onChange={(v) => { setForm((f) => ({ ...f, system: v })); setErrors((e) => ({ ...e, system: '' })) }}
                      borderStyle={fieldBorderStyle('system')}
                      onFocus={() => setFocused('system')}
                      onBlur={() => setFocused(null)}
                      icon={Monitor}
                      placeholder="Select system of interest…"
                    />
                    <AnimatePresence>
                      {errors.system && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5 text-xs text-red-400 pl-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.system}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Note */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Additional Note
                      <span className="ml-2 text-xs text-slate-400 font-ku">/ تێبینی زیادە</span>
                      <span className="ml-1.5 text-xs text-slate-300">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Any extra details about your request…"
                      value={form.note}
                      onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      onFocus={() => setFocused('note' as keyof FormData)}
                      onBlur={() => setFocused(null)}
                      rows={3}
                      className={`${baseInput} resize-none`}
                      style={focused === ('note' as keyof FormData)
                        ? { border: '1px solid rgba(250,204,21,0.6)', background: 'rgba(250,204,21,0.04)', boxShadow: '0 0 20px rgba(250,204,21,0.12)' }
                        : { border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)' }
                      }
                    />
                  </div>

                  {/* Submit error */}
                  {submitError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
                    </motion.p>
                  )}

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={loading ? {} : { scale: 1.02, boxShadow: '0 0 35px rgba(250,204,21,0.45)' }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                    className="group w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 mt-6 disabled:opacity-70"
                    style={{
                      color: '#1e3a8a',
                      background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                      boxShadow: '0 10px 35px rgba(250,204,21,0.3)',
                    }}
                  >
                    {loading ? (
                      <motion.div
                        className="w-5 h-5 rounded-full border-2 border-[#1e3a8a]/30 border-t-[#1e3a8a]"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <>
                        <span className="font-ku">داواکردنی تاقیکاری</span>
                        <span className="text-sm opacity-60 hidden sm:inline">/ Send Request</span>
                        <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-slate-500 mt-3">
                    We respond within 48 hours
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col items-center justify-center py-10 sm:py-14 text-center"
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
                    className="relative mb-8"
                  >
                    {/* Outer glow ring */}
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 1.2, delay: 0.3, repeat: Infinity, repeatDelay: 1.5 }}
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(250,204,21,0.35)' }}
                    />
                    <div
                      className="relative flex items-center justify-center w-24 h-24 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                        boxShadow: '0 0 0 8px rgba(250,204,21,0.15), 0 20px 50px rgba(250,204,21,0.35)',
                      }}
                    >
                      <CheckCircle2 className="w-12 h-12 text-white" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }} />
                    </div>
                  </motion.div>

                  {/* Kurdish headline */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="font-ku text-3xl sm:text-4xl font-black mb-2"
                    style={{ color: '#1e3a8a' }}
                  >
                    داواکارییەکەت سەرکەتوو بوو
                  </motion.h3>

                  {/* English subline */}
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-lg font-semibold mb-6"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #facc15, #d97706)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Request Sent Successfully!
                  </motion.p>

                  {/* Divider */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="w-16 h-px mb-8"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.6), transparent)' }}
                  />

                  {/* What's next steps */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="w-full max-w-sm space-y-3 mb-8"
                  >
                    {[
                      { step: '01', en: 'We review your request', ku: 'داواکاریەکەت پێداچوونەوەی پێدەکرێت' },
                      { step: '02', en: 'Our team contacts you', ku: 'تیمەکەمان پەیوەندیت پێوە دەکات' },
                      { step: '03', en: 'Your request scheduled', ku: 'داواکاری بەکارهێنانی سیستەم جێگر کرا' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="flex items-start gap-4 px-4 py-3 rounded-2xl text-left"
                        style={{
                          background: 'rgba(250,204,21,0.05)',
                          border: '1px solid rgba(250,204,21,0.15)',
                        }}
                      >
                        <span
                          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                          style={{ background: 'rgba(250,204,21,0.15)', color: '#d97706' }}
                        >
                          {item.step}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{item.en}</p>
                          <p className="text-xs text-slate-400 font-ku mt-0.5">{item.ku}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Response time badge */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.75 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-slate-500 mb-8"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                    We respond within 48 hours
                    <span className="opacity-40">·</span>
                    <span className="font-ku">چاوەڕوان بن بۆ ٤٨ کاتژمێر</span>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.85 }}
                    onClick={() => { setSubmitted(false); setForm(EMPTY); setErrors({}) }}
                    className="text-sm text-slate-400 hover:text-yellow-500 transition-colors underline underline-offset-4"
                  >
                    Submit another request
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
