'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Pencil, Trash2,
  Loader2, Save, X, Layers, ToggleLeft, ToggleRight,
  ImagePlus, Image as ImageIcon, GripVertical,
} from 'lucide-react'
import type { Slide } from '@/components/HeroSlider'
import {
  DndContext, PointerSensor, useSensor, useSensors,
  DragOverlay, closestCenter,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const GRADIENTS = [
  { label: 'Deep Blue',    value: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 75%, #1e40af 100%)' },
  { label: 'Midnight',     value: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)' },
  { label: 'Ocean',        value: 'linear-gradient(135deg, #0c4a6e 0%, #082f49 50%, #0f172a 100%)' },
  { label: 'Purple Night', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #0f172a 100%)' },
  { label: 'Forest Dark',  value: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #0f172a 100%)' },
  { label: 'Crimson',      value: 'linear-gradient(135deg, #450a0a 0%, #3f0000 50%, #0f172a 100%)' },
  { label: 'Amber Dusk',   value: 'linear-gradient(135deg, #451a03 0%, #292524 50%, #0f172a 100%)' },
  { label: 'Teal Night',   value: 'linear-gradient(135deg, #134e4a 0%, #042f2e 50%, #0f172a 100%)' },
]

type SlideRow = Slide & { active: boolean; created_at: string }
type Draft = Omit<SlideRow, 'id' | 'created_at'>

const blankDraft = (): Draft => ({
  title_en: '', title_ku: '', subtitle_en: '', subtitle_ku: '',
  cta_text_ku: 'زیاتر بزانە', cta_text_en: 'Learn More', cta_href: '#systems',
  gradient: GRADIENTS[0].value, bg_image_url: null, char_image_url: null,
  order_index: 0, active: true,
})

type Toast = { type: 'success' | 'error'; msg: string }
type UploadKey = 'bg' | 'char'

function Field({ label, value, onChange, rtl, textarea, placeholder }: {
  label: string; value: string; onChange: (v: string) => void
  rtl?: boolean; textarea?: boolean; placeholder?: string
}) {
  const cls = `w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-all`
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} dir={rtl ? 'rtl' : undefined} rows={2} placeholder={placeholder} className={cls} />
        : <input value={value} onChange={e => onChange(e.target.value)} dir={rtl ? 'rtl' : undefined} placeholder={placeholder} className={cls} />
      }
    </div>
  )
}

function ImageUploadZone({ label, hint, value, onUpload, onRemove, uploading }: {
  label: string; hint: string; value: string | null
  onUpload: (file: File) => void; onRemove: () => void; uploading: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
        {label}<span className="ml-1.5 font-normal text-slate-400">{hint}</span>
      </label>
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer group border-2 border-dashed transition-all duration-200"
        style={{ height: '120px', borderColor: value ? 'transparent' : 'rgba(0,0,0,0.1)', background: value ? 'transparent' : 'rgba(0,0,0,0.02)' }}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-2 text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-full">
                <ImagePlus className="w-3.5 h-3.5" /> Replace
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-yellow-500 transition-colors">
            <ImageIcon className="w-7 h-7" />
            <p className="text-xs font-medium">Click to upload</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f) }} />
      </div>
      {value && (
        <button onClick={onRemove} className="mt-1.5 text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
          × Remove image
        </button>
      )}
    </div>
  )
}

/* ── Sortable slide row ── */
function SortableSlideRow({
  slide,
  onEdit,
  onDelete,
  onToggle,
}: {
  slide: SlideRow
  onEdit: (s: SlideRow) => void
  onDelete: (id: string) => void
  onToggle: (s: SlideRow) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-3 transition-all hover:shadow-sm">

      {/* Drag handle */}
      <button {...attributes} {...listeners}
        className="flex-shrink-0 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors touch-none p-1"
        tabIndex={-1}>
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Preview thumbnail */}
      <div className="flex-shrink-0 w-20 h-12 rounded-xl overflow-hidden relative" style={{ background: slide.gradient }}>
        {slide.bg_image_url && <img src={slide.bg_image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
        {slide.char_image_url && <img src={slide.char_image_url} alt="" className="absolute bottom-0 right-0 h-full w-auto object-contain" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm truncate">
          {slide.title_en || <span className="text-slate-400 italic">Untitled</span>}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {slide.bg_image_url && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">BG image</span>}
          {slide.char_image_url && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Character</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onToggle(slide)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${slide.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {slide.active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
          {slide.active ? 'Live' : 'Off'}
        </button>
        <button onClick={() => onEdit(slide)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-yellow-50 hover:text-yellow-600 transition-colors ml-1">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(slide.id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function AdminSlidesPage() {
  const [slides, setSlides] = useState<SlideRow[]>([])
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(blankDraft())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<Record<UploadKey, boolean>>({ bg: false, char: false })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const supabase = createClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const showToast = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3500) }

  async function load() {
    const { data } = await supabase.from('slides').select('*').order('order_index')
    setSlides((data as SlideRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('admin-slides-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slides' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  async function uploadImage(file: File, type: UploadKey) {
    setUploading(prev => ({ ...prev, [type]: true }))
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('slides').upload(path, file)
      if (error) { showToast({ type: 'error', msg: `Upload failed: ${error.message}` }); return }
      const { data: { publicUrl } } = supabase.storage.from('slides').getPublicUrl(path)
      setField(type === 'bg' ? 'bg_image_url' : 'char_image_url', publicUrl)
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  function openNew() {
    setDraft({ ...blankDraft(), order_index: slides.length })
    setEditId(null)
    setPanelOpen(true)
  }

  function openEdit(slide: SlideRow) {
    setDraft({
      title_en: slide.title_en, title_ku: slide.title_ku,
      subtitle_en: slide.subtitle_en, subtitle_ku: slide.subtitle_ku,
      cta_text_ku: slide.cta_text_ku, cta_text_en: slide.cta_text_en,
      cta_href: slide.cta_href, gradient: slide.gradient,
      bg_image_url: slide.bg_image_url, char_image_url: slide.char_image_url,
      order_index: slide.order_index, active: slide.active,
    })
    setEditId(slide.id)
    setPanelOpen(true)
  }

  async function save() {
    setSaving(true)
    let error
    if (editId) {
      ({ error } = await supabase.from('slides').update(draft).eq('id', editId))
    } else {
      ({ error } = await supabase.from('slides').insert(draft))
    }
    setSaving(false)
    if (error) { showToast({ type: 'error', msg: error.message }); return }
    showToast({ type: 'success', msg: editId ? 'Slide updated!' : 'Slide added!' })
    setPanelOpen(false)
    load()
  }

  async function toggleActive(slide: SlideRow) {
    await supabase.from('slides').update({ active: !slide.active }).eq('id', slide.id)
    load()
  }

  async function confirmDelete() {
    if (!deleteId) return
    await supabase.from('slides').delete().eq('id', deleteId)
    setDeleteId(null)
    showToast({ type: 'success', msg: 'Slide deleted.' })
    load()
  }

  /* ── DnD ── */
  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = slides.findIndex(s => s.id === active.id)
    const newIdx = slides.findIndex(s => s.id === over.id)
    const reordered = arrayMove(slides, oldIdx, newIdx).map((s, i) => ({ ...s, order_index: i + 1 }))

    setSlides(reordered)
    await Promise.all(reordered.map(s => supabase.from('slides').update({ order_index: s.order_index }).eq('id', s.id)))
  }

  const activeDragSlide = activeDragId ? slides.find(s => s.id === activeDragId) : null

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Slides</h1>
          <p className="text-sm text-slate-500 mt-0.5">{slides.length} slide{slides.length !== 1 ? 's' : ''} · displayed on the homepage</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-blue-900"
          style={{ background: 'linear-gradient(135deg,#facc15,#eab308)', boxShadow: '0 4px 16px rgba(250,204,21,0.35)' }}>
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      {/* List */}
      {slides.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No slides yet</p>
          <p className="text-sm mt-1">Click "Add Slide" to get started</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {slides.map(slide => (
                <SortableSlideRow
                  key={slide.id}
                  slide={slide}
                  onEdit={openEdit}
                  onDelete={setDeleteId}
                  onToggle={toggleActive}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeDragSlide && (
              <div className="flex items-center gap-4 bg-white rounded-2xl border border-yellow-300 p-3"
                style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)', opacity: 0.96 }}>
                <GripVertical className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <div className="flex-shrink-0 w-20 h-12 rounded-xl overflow-hidden relative" style={{ background: activeDragSlide.gradient }}>
                  {activeDragSlide.bg_image_url && <img src={activeDragSlide.bg_image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                </div>
                <p className="font-semibold text-slate-800 text-sm">{activeDragSlide.title_en}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── Edit / Add Panel ── */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setPanelOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">{editId ? 'Edit Slide' : 'New Slide'}</h2>
              <button onClick={() => setPanelOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Live preview strip */}
              <div className="w-full h-20 rounded-2xl overflow-hidden relative transition-all duration-500" style={{ background: draft.gradient }}>
                {draft.bg_image_url && <img src={draft.bg_image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                {draft.char_image_url && <img src={draft.char_image_url} alt="" className="absolute bottom-0 right-4 h-full w-auto object-contain" />}
                <div className="absolute inset-0 flex items-center px-4">
                  <p className="text-white font-bold text-sm drop-shadow truncate">{draft.title_en || 'Slide title preview'}</p>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Images</p>
                <ImageUploadZone label="Background Image" hint="fills the full slide (will be blurred + zoomed)"
                  value={draft.bg_image_url} onUpload={f => uploadImage(f, 'bg')} onRemove={() => setField('bg_image_url', null)} uploading={uploading.bg} />
                <ImageUploadZone label="Character / Product Image" hint="displayed floating on the right (desktop)"
                  value={draft.char_image_url} onUpload={f => uploadImage(f, 'char')} onRemove={() => setField('char_image_url', null)} uploading={uploading.char} />
              </div>

              {/* Gradient theme */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Background Theme</p>
                <div className="grid grid-cols-4 gap-2">
                  {GRADIENTS.map(g => (
                    <button key={g.value} onClick={() => setField('gradient', g.value)} className="group">
                      <div className="w-full h-10 rounded-xl transition-all" style={{ background: g.value, outline: draft.gradient === g.value ? '2px solid #facc15' : '2px solid transparent', outlineOffset: '2px' }} />
                      <p className="text-[10px] text-center text-slate-400 mt-1 leading-tight">{g.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Titles */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</p>
                <Field label="English" value={draft.title_en} onChange={v => setField('title_en', v)} placeholder="Smart Restaurant Technology" />
                <Field label="Kurdish" value={draft.title_ku} onChange={v => setField('title_ku', v)} rtl placeholder="تەکنەلۆژیای زیرەکی ڕێستۆران" />
              </div>

              {/* Subtitles */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subtitle</p>
                <Field label="English" value={draft.subtitle_en} onChange={v => setField('subtitle_en', v)} textarea placeholder="Short description of this slide…" />
                <Field label="Kurdish" value={draft.subtitle_ku} onChange={v => setField('subtitle_ku', v)} textarea rtl />
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">CTA Button</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Text (Kurdish)" value={draft.cta_text_ku} onChange={v => setField('cta_text_ku', v)} rtl />
                  <Field label="Text (English)" value={draft.cta_text_en} onChange={v => setField('cta_text_en', v)} />
                </div>
                <Field label="Link (href)" value={draft.cta_href} onChange={v => setField('cta_href', v)} placeholder="#systems" />
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Visible on site</p>
                  <p className="text-xs text-slate-400 mt-0.5">Toggle off to hide this slide</p>
                </div>
                <button onClick={() => setField('active', !draft.active)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${draft.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${draft.active ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100">
              <button onClick={save} disabled={saving || !draft.title_en || uploading.bg || uploading.char}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-blue-900 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#facc15,#eab308)' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : editId ? 'Update Slide' : 'Add Slide'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" />
          <div className="fixed z-50 inset-0 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-slate-900 text-lg mb-1">Delete slide?</h3>
              <p className="text-sm text-slate-500 mb-5">This will remove it from the homepage permanently.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-xl ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}
    </div>
  )
}
