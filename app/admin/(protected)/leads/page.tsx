'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Inbox, Phone, Building2, MapPin, Monitor, Clock, CheckCircle2, XCircle, RefreshCw, Trash2, MessageSquare } from 'lucide-react'

type Lead = {
  id: number
  full_name: string
  phone: string
  business_name: string
  location: string
  business_type: string
  system: string
  note: string | null
  status: 'new' | 'contacted' | 'closed'
  created_at: string
}

const STATUS_OPTIONS: { value: Lead['status']; label: string; color: string; bg: string }[] = [
  { value: 'new',       label: 'New',       color: '#3b82f6', bg: '#eff6ff' },
  { value: 'contacted', label: 'Contacted', color: '#d97706', bg: '#fffbeb' },
  { value: 'closed',    label: 'Closed',    color: '#10b981', bg: '#f0fdf4' },
]

const SYSTEM_LABELS: Record<string, string> = {
  menu:       'Digital Menu System',
  restaurant: 'Restaurant POS System',
  clinic:     'Clinic Management System',
  mobile:     'Mobile Applications',
  web:        'Web Development',
}

function StatusBadge({ status, onChange }: { status: Lead['status']; onChange: (s: Lead['status']) => void }) {
  const [open, setOpen] = useState(false)
  const current = STATUS_OPTIONS.find(s => s.value === status)!
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
        style={{ color: current.color, background: current.bg, borderColor: `${current.color}40` }}
      >
        {current.label}
        <RefreshCw className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[130px]">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors text-left"
              style={{ color: opt.color }}
            >
              {opt.value === 'new'       && <Clock className="w-3.5 h-3.5" />}
              {opt.value === 'contacted' && <Phone className="w-3.5 h-3.5" />}
              {opt.value === 'closed'    && <CheckCircle2 className="w-3.5 h-3.5" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | Lead['status']>('all')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads((data as Lead[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('admin-leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateStatus(id: number, status: Lead['status']) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    await supabase.from('leads').update({ status }).eq('id', id)
  }

  async function deleteLead(id: number) {
    setDeletingId(id)
    await supabase.from('leads').delete().eq('id', id)
    setLeads(prev => prev.filter(l => l.id !== id))
    setDeletingId(null)
  }

  const visible = filter === 'all' ? leads : leads.filter(l => l.status === filter)
  const counts = {
    all:       leads.length,
    new:       leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    closed:    leads.filter(l => l.status === 'closed').length,
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500 mt-0.5">Form submissions from the homepage</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'new', 'contacted', 'closed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
            style={filter === f
              ? { background: '#1e3a8a', color: '#fff', borderColor: '#1e3a8a' }
              : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }
            }
          >
            {f === 'all' ? 'All' : STATUS_OPTIONS.find(s => s.value === f)!.label}
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={filter === f ? { background: 'rgba(255,255,255,0.2)' } : { background: '#f1f5f9' }}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Inbox className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No {filter === 'all' ? '' : filter} leads yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(lead => (
            <div
              key={lead.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Left: person info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">{lead.full_name}</h3>
                    <StatusBadge status={lead.status} onChange={s => updateStatus(lead.id, s)} />
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {lead.business_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {lead.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {lead.business_type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-slate-400" />
                      {SYSTEM_LABELS[lead.system] ?? lead.system}
                    </span>
                  </div>
                  {lead.note && (
                    <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-relaxed">{lead.note}</p>
                    </div>
                  )}
                </div>

                {/* Right: date + delete */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {new Date(lead.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteLead(lead.id)}
                    disabled={deletingId === lead.id}
                    className="p-2 rounded-xl text-slate-300 hover:text-red-400 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all disabled:opacity-40"
                  >
                    {deletingId === lead.id
                      ? <RefreshCw className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
