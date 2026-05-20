'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Home, Globe, BarChart2, Phone, Share2, Type, Upload, X, Zap } from 'lucide-react'
import { defaultSettings, type SiteSettings } from '@/lib/siteSettings'

type Toast = { type: 'success' | 'error'; msg: string }

function SectionCard({ icon: Icon, title, children }: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 border border-yellow-200">
          <Icon className="w-4 h-4 text-yellow-600" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, hint, value, onChange, wide, rtl, textarea }: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  wide?: boolean
  rtl?: boolean
  textarea?: boolean
}) {
  const cls = `w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300
    focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-all`
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
        {label}
        {hint && <span className="ml-1.5 font-normal text-slate-400">{hint}</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          dir={rtl ? 'rtl' : undefined}
          className={cls}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          dir={rtl ? 'rtl' : undefined}
          className={cls}
        />
      )}
    </div>
  )
}

function LogoUpload({ url, onChange }: { url: string | null; onChange: (v: string | null) => void }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'png'
    const path = `logo/logo.${ext}`
    await supabase.storage.from('site-assets').upload(path, file, { upsert: true })
    const { data } = supabase.storage.from('site-assets').getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="md:col-span-2">
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Logo Image</label>
      <div className="flex items-center gap-4">
        {/* Preview box */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 hover:border-yellow-400 hover:bg-yellow-50 transition-all group flex-shrink-0"
        >
          {url ? (
            <img src={url} alt="Logo preview" className="w-full h-full object-contain p-1.5" />
          ) : (
            <Zap className="w-6 h-6 text-slate-300 group-hover:text-yellow-400 transition-colors" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
            </div>
          )}
        </button>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-yellow-50 text-slate-700 hover:text-yellow-700 border border-slate-200 hover:border-yellow-300 transition-all disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading…' : url ? 'Replace Logo' : 'Upload Logo'}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Remove Logo
            </button>
          )}
          <p className="text-[11px] text-slate-400">PNG, JPG, SVG, WebP · max 2 MB · replaces navbar icon</p>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}

export default function AdminHomePage() {
  const [form, setForm] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single()
      if (data) setForm(data as SiteSettings)
      setLoading(false)
    }
    load()
    const channel = supabase
      .channel('admin-home-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = useCallback((key: keyof SiteSettings) => (v: string) =>
    setForm(prev => ({ ...prev, [key]: v })), [])

  const showToast = (t: Toast) => {
    setToast(t)
    setTimeout(() => setToast(null), 3500)
  }

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('site_settings').upsert({ ...form, id: 1 })
    setSaving(false)
    if (error) showToast({ type: 'error', msg: error.message })
    else showToast({ type: 'success', msg: 'Settings saved successfully!' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Home Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Edit content shown on the public homepage</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-blue-900 transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#facc15,#eab308)', boxShadow: '0 4px 16px rgba(250,204,21,0.4)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Brand & Logo */}
      <SectionCard icon={Type} title="Brand & Logo">
        <LogoUpload url={form.logo_url ?? null} onChange={v => setForm(prev => ({ ...prev, logo_url: v }))} />
        <Field label="Company Name (Part 1)" hint="shown in blue" value={form.brand_en_part1} onChange={set('brand_en_part1')} />
        <Field label="Company Name (Part 2)" hint="shown in yellow" value={form.brand_en_part2} onChange={set('brand_en_part2')} />
        <Field label="Company Name (Kurdish)" hint="کوردی" value={form.brand_ku} onChange={set('brand_ku')} rtl />
        <Field label="Logo Tagline" hint="small text under name" value={form.logo_tagline} onChange={set('logo_tagline')} />
      </SectionCard>

      {/* Hero Section */}
      <SectionCard icon={Home} title="Hero Section">
        <Field label="Badge (Kurdish)" value={form.badge_ku} onChange={set('badge_ku')} rtl />
        <Field label="Badge (English)" value={form.badge_en} onChange={set('badge_en')} />
        <Field label="Location / Subtitle" hint="e.g. Kurdistan Region · Iraq" value={form.hero_location} onChange={set('hero_location')} />
        <Field label="Tagline (English)" value={form.hero_tagline_en} onChange={set('hero_tagline_en')} wide textarea />
        <Field label="Primary Button (Kurdish)" value={form.cta_primary_ku} onChange={set('cta_primary_ku')} rtl />
        <Field label="Primary Button (English)" value={form.cta_primary_en} onChange={set('cta_primary_en')} />
        <Field label="Secondary Button (English)" value={form.cta_secondary_en} onChange={set('cta_secondary_en')} />
        <Field label="Navbar CTA Button (Kurdish)" hint="top-right button" value={form.nav_cta_ku} onChange={set('nav_cta_ku')} rtl />
      </SectionCard>

      {/* Stats */}
      <SectionCard icon={BarChart2} title="Stats Row">
        <div className="md:col-span-2 grid grid-cols-3 gap-4">
          {[1, 2, 3].map(n => {
            const nk = n as 1 | 2 | 3
            return (
              <div key={n} className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stat {n}</p>
                <Field label="Value" value={form[`stat${nk}_value`]} onChange={set(`stat${nk}_value`)} />
                <Field label="Label (English)" value={form[`stat${nk}_label_en`]} onChange={set(`stat${nk}_label_en`)} />
                <Field label="Label (Kurdish)" value={form[`stat${nk}_label_ku`]} onChange={set(`stat${nk}_label_ku`)} rtl />
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Contact */}
      <SectionCard icon={Phone} title="Contact Information">
        <Field label="Phone Number" hint='e.g. +964 770 146 6787' value={form.phone} onChange={set('phone')} />
        <div /> {/* spacer */}
        <Field label="Address (English)" value={form.address_en} onChange={set('address_en')} />
        <Field label="Address (Kurdish)" value={form.address_ku} onChange={set('address_ku')} rtl />
      </SectionCard>

      {/* Footer Description */}
      <SectionCard icon={Globe} title="Footer Description">
        <Field label="Description (English)" value={form.footer_desc_en} onChange={set('footer_desc_en')} wide textarea />
        <Field label="Description (Kurdish)" value={form.footer_desc_ku} onChange={set('footer_desc_ku')} wide rtl />
      </SectionCard>

      {/* Social Links */}
      <SectionCard icon={Share2} title="Social Media Links">
        <Field label="Facebook URL" hint="leave blank to hide" value={form.facebook_url} onChange={set('facebook_url')} />
        <Field label="Instagram URL" hint="leave blank to hide" value={form.instagram_url} onChange={set('instagram_url')} />
        <Field label="LinkedIn URL" hint="leave blank to hide" value={form.linkedin_url} onChange={set('linkedin_url')} />
        <Field label="TikTok URL" hint="leave blank to hide" value={form.tiktok_url} onChange={set('tiktok_url')} />
        <Field label="WhatsApp URL" hint="e.g. https://wa.me/9647XXXXXXXX — leave blank to hide" value={form.whatsapp_url} onChange={set('whatsapp_url')} wide />
      </SectionCard>

      {/* Bottom save bar */}
      <div className="flex justify-end pb-8">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-blue-900 transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#facc15,#eab308)', boxShadow: '0 4px 20px rgba(250,204,21,0.4)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-xl transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}
    </div>
  )
}
