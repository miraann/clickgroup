'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, X, Loader2, Check,
  AlertCircle, Package, Upload, ImageIcon, GripVertical,
} from 'lucide-react'
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

// ── Types ────────────────────────────────────────────────────

type Feature = {
  icon_name: string
  text_en: string
  text_ku: string
}

type Product = {
  id: string
  name_en: string
  name_ku: string
  tag_en: string
  tag_ku: string
  desc_en: string
  desc_ku: string
  features: Feature[]
  icon_name: string
  image_url: string | null
  accent: string
  cta_en: string
  cta_ku: string
  href: string
  order_index: number
  active: boolean
  created_at: string
}

type ProductDraft = Omit<Product, 'id' | 'created_at'> & { id?: string }

// ── Constants ────────────────────────────────────────────────

const ICON_OPTIONS = [
  'Monitor', 'Utensils', 'Stethoscope', 'Smartphone', 'Globe',
  'ShoppingCart', 'BarChart2', 'Users', 'Settings', 'Code2',
  'Database', 'Cloud', 'Shield', 'Zap', 'Package', 'ClipboardList',
  'Layers', 'Bell', 'Gauge', 'Palette', 'Search', 'Printer',
]

const BLANK: ProductDraft = {
  name_en: '', name_ku: '',
  tag_en: '', tag_ku: '',
  desc_en: '', desc_ku: '',
  features: [],
  icon_name: 'Monitor',
  image_url: null,
  accent: '#EAB308',
  cta_en: 'Request a Demo',
  cta_ku: 'داواکردنی تاقیکاری',
  href: '#contact',
  order_index: 0,
  active: true,
}

// ── Image upload ─────────────────────────────────────────────

function ProductImageUpload({ url, productName, onChange }: {
  url: string | null
  productName: string
  onChange: (v: string | null) => void
}) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'png'
    const slug = (productName || 'product').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const path = `products/${slug}-${Date.now()}.${ext}`
    await supabase.storage.from('site-assets').upload(path, file, { upsert: true })
    const { data } = supabase.storage.from('site-assets').getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Product Image</label>
      <div className="flex items-start gap-3">
        {/* Preview */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 hover:border-yellow-400 hover:bg-yellow-50 transition-all flex-shrink-0 group"
        >
          {url ? (
            <img src={url} alt="Product" className="w-full h-full object-contain p-1" />
          ) : (
            <ImageIcon className="w-7 h-7 text-slate-300 group-hover:text-yellow-400 transition-colors" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
            </div>
          )}
        </button>

        <div className="flex flex-col gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-yellow-50 text-slate-700 hover:text-yellow-700 border border-slate-200 hover:border-yellow-300 transition-all disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />
            {uploading ? 'Uploading…' : url ? 'Replace' : 'Upload Image'}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          )}
          <p className="text-[10px] text-slate-400">PNG, JPG, WebP · shown on homepage</p>
          <p className="text-[10px] text-slate-400">Recommended: <span className="font-medium text-slate-500">800 × 500 px</span> — fills the full left panel</p>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState<ProductDraft | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const supabase = createClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('order_index', { ascending: true })
    if (!error && data) setProducts(data as Product[])
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProducts()
    const channel = supabase
      .channel('admin-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchProducts]) // eslint-disable-line

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  function openAdd() {
    setDraft({ ...BLANK, order_index: products.length })
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setDraft({ ...p })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setDraft(null)
  }

  async function handleSave() {
    if (!draft) return
    setSaving(true)

    const { id, ...data } = draft as Product

    if (id) {
      const { error } = await supabase
        .from('products')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) showToast('Failed to update: ' + error.message, false)
      else { showToast('Product saved!'); await fetchProducts(); closeModal() }
    } else {
      const { error } = await supabase.from('products').insert(data)
      if (error) showToast('Failed to add: ' + error.message, false)
      else { showToast('Product added!'); await fetchProducts(); closeModal() }
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) showToast('Failed to delete', false)
    else { showToast('Deleted'); await fetchProducts() }
    setDeleteId(null)
  }

  async function toggleActive(p: Product) {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    await fetchProducts()
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = products.findIndex(p => p.id === active.id)
    const newIdx = products.findIndex(p => p.id === over.id)
    const reordered = arrayMove(products, oldIdx, newIdx).map((p, i) => ({ ...p, order_index: i + 1 }))
    setProducts(reordered)
    await Promise.all(reordered.map(p => supabase.from('products').update({ order_index: p.order_index }).eq('id', p.id)))
  }

  function addFeature() {
    if (!draft) return
    setDraft({ ...draft, features: [...draft.features, { icon_name: 'Check', text_en: '', text_ku: '' }] })
  }

  function removeFeature(i: number) {
    if (!draft) return
    setDraft({ ...draft, features: draft.features.filter((_, idx) => idx !== i) })
  }

  function updateFeature(i: number, field: keyof Feature, val: string) {
    if (!draft) return
    const features = draft.features.map((f, idx) => idx === i ? { ...f, [field]: val } : f)
    setDraft({ ...draft, features })
  }

  return (
    <div>

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} products · drag to reorder</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-yellow-400/20"
          style={{ background: 'linear-gradient(135deg, #facc15, #eab308)', color: '#1e3a8a' }}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16"></th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-28">Icon</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-24">Features</th>
                  <th className="text-left px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-28">Status</th>
                  <th className="text-right px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-40">Actions</th>
                </tr>
              </thead>
              <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {products.map((product, i) => (
                    <SortableProductRow
                      key={product.id}
                      product={product}
                      index={i}
                      deleteId={deleteId}
                      onEdit={openEdit}
                      onDelete={setDeleteId}
                      onDeleteConfirm={handleDelete}
                      onDeleteCancel={() => setDeleteId(null)}
                      onToggle={toggleActive}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
            {products.length === 0 && (
              <div className="text-center py-20">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No products yet</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Product" to get started</p>
              </div>
            )}
          </div>
          <DragOverlay>
            {activeDragId && (() => {
              const p = products.find(x => x.id === activeDragId)
              if (!p) return null
              return (
                <table className="w-full" style={{ tableLayout: 'fixed' }}>
                  <tbody>
                    <tr className="bg-white border border-yellow-300 rounded-2xl shadow-xl">
                      <td className="px-4 py-4 w-16">
                        <GripVertical className="w-4 h-4 text-yellow-400" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                            style={{ background: p.accent + '22', border: `1px solid ${p.accent}44` }}>
                            {p.image_url
                              ? <img src={p.image_url} alt="" className="w-full h-full object-contain p-0.5" />
                              : <span className="text-[10px] font-mono" style={{ color: p.accent }}>{p.icon_name.slice(0,2)}</span>
                            }
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{p.name_en}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{p.tag_en}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )
            })()}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── Edit / Add slide-over ── */}
      {modalOpen && draft && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900">{draft.id ? 'Edit Product' : 'Add Product'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{draft.id ? 'Update product details' : 'Fill in the fields below'}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              <Section title="Names">
                <Field label="Name (English)"><Input value={draft.name_en} onChange={v => setDraft({ ...draft, name_en: v })} placeholder="Digital Menu System" /></Field>
                <Field label="Name (Kurdish)"><Input value={draft.name_ku} onChange={v => setDraft({ ...draft, name_ku: v })} placeholder="دێسکتاپ مینو" rtl /></Field>
              </Section>

              <Section title="Tags">
                <Field label="Tag (English)"><Input value={draft.tag_en} onChange={v => setDraft({ ...draft, tag_en: v })} placeholder="For Restaurants & Cafés" /></Field>
                <Field label="Tag (Kurdish)"><Input value={draft.tag_ku} onChange={v => setDraft({ ...draft, tag_ku: v })} placeholder="بۆ ڕێستۆران و کافێ" rtl /></Field>
              </Section>

              <Section title="Description">
                <Field label="Description (English)"><Textarea value={draft.desc_en} onChange={v => setDraft({ ...draft, desc_en: v })} placeholder="Describe your product…" /></Field>
                <Field label="Description (Kurdish)"><Textarea value={draft.desc_ku} onChange={v => setDraft({ ...draft, desc_ku: v })} placeholder="وەسفی بەرهەم بە کوردی…" rtl /></Field>
              </Section>

              <Section title="Appearance">
                <ProductImageUpload
                  url={draft.image_url ?? null}
                  productName={draft.name_en}
                  onChange={v => setDraft({ ...draft, image_url: v })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Icon name">
                    <select value={draft.icon_name} onChange={e => setDraft({ ...draft, icon_name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-yellow-400 transition-all text-slate-900">
                      {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </Field>
                  <Field label="Accent color">
                    <div className="flex gap-2">
                      <input type="color" value={draft.accent} onChange={e => setDraft({ ...draft, accent: e.target.value })}
                        className="w-11 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5" />
                      <Input value={draft.accent} onChange={v => setDraft({ ...draft, accent: v })} placeholder="#EAB308" mono />
                    </div>
                  </Field>
                </div>
                <div className="mt-1 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{ background: draft.accent + '22', color: draft.accent, border: `1px solid ${draft.accent}44` }}>
                  Preview — {draft.icon_name}
                </div>
              </Section>

              <Section title="Call-to-action">
                <Field label="Button text (English)"><Input value={draft.cta_en} onChange={v => setDraft({ ...draft, cta_en: v })} placeholder="Request a Demo" /></Field>
                <Field label="Button text (Kurdish)"><Input value={draft.cta_ku} onChange={v => setDraft({ ...draft, cta_ku: v })} placeholder="داواکردنی تاقیکاری" rtl /></Field>
                <Field label="Button link (href)"><Input value={draft.href} onChange={v => setDraft({ ...draft, href: v })} placeholder="#contact" mono /></Field>
              </Section>

              <Section title="Features" action={
                <button onClick={addFeature} className="flex items-center gap-1 text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add feature
                </button>
              }>
                {draft.features.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-3">No features yet — click "Add feature"</p>
                )}
                {draft.features.map((feat, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input value={feat.icon_name} onChange={e => updateFeature(i, 'icon_name', e.target.value)}
                        className="w-28 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white border border-slate-200 focus:outline-none focus:border-yellow-400 text-slate-700"
                        placeholder="Icon name" list="icon-list" />
                      <span className="text-xs text-slate-400 flex-1">lucide icon</span>
                      <button onClick={() => removeFeature(i)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input value={feat.text_en} onChange={e => updateFeature(i, 'text_en', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 focus:outline-none focus:border-yellow-400 text-slate-700 placeholder-slate-400"
                      placeholder="Feature text in English" />
                    <input value={feat.text_ku} onChange={e => updateFeature(i, 'text_ku', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 focus:outline-none focus:border-yellow-400 text-slate-700 placeholder-slate-400 font-ku"
                      dir="rtl" placeholder="تێکست بە کوردی" />
                  </div>
                ))}
                <datalist id="icon-list">{ICON_OPTIONS.map(o => <option key={o} value={o} />)}</datalist>
              </Section>

              <Section title="Settings">
                <div className="flex items-center gap-4">
                  <Field label="Display order" className="flex-1">
                    <input type="number" min={0} value={draft.order_index} onChange={e => setDraft({ ...draft, order_index: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-yellow-400 transition-all text-slate-900" />
                  </Field>
                  <Field label="Visibility">
                    <button onClick={() => setDraft({ ...draft, active: !draft.active })}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                        draft.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                      {draft.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {draft.active ? 'Active' : 'Hidden'}
                    </button>
                  </Field>
                </div>
              </Section>
            </div>

            <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 flex gap-3 bg-white">
              <button onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !draft.name_en}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #facc15, #eab308)', color: '#1e3a8a' }}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save product</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl z-[200] ${
          toast.ok ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────

function SortableProductRow({
  product, index, deleteId, onEdit, onDelete, onDeleteConfirm, onDeleteCancel, onToggle,
}: {
  product: Product
  index: number
  deleteId: string | null
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
  onDeleteConfirm: (id: string) => void
  onDeleteCancel: () => void
  onToggle: (p: Product) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors last:border-0">
      <td className="px-4 py-4 w-16">
        <div className="flex items-center gap-1.5">
          <button {...attributes} {...listeners}
            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors touch-none p-0.5"
            tabIndex={-1}>
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 font-mono">{index + 1}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ background: product.accent + '22', border: `1px solid ${product.accent}44` }}>
            {product.image_url
              ? <img src={product.image_url} alt="" className="w-full h-full object-contain p-0.5" />
              : <span className="text-[10px] font-mono" style={{ color: product.accent }}>{product.icon_name.slice(0,2)}</span>
            }
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm leading-tight">{product.name_en}</div>
            <div className="text-xs text-slate-400 font-ku mt-0.5" style={{ direction: 'rtl', textAlign: 'right' }}>{product.name_ku}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{product.tag_en}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-medium"
          style={{ background: product.accent + '18', color: product.accent }}>
          {product.icon_name}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-slate-600">{product.features?.length ?? 0}</span>
        <span className="text-xs text-slate-400 ml-1">items</span>
      </td>
      <td className="px-4 py-4">
        <button onClick={() => onToggle(product)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            product.active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
          }`}>
          {product.active ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
        </button>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(product)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all">
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          {deleteId === product.id ? (
            <div className="flex items-center gap-1">
              <button onClick={() => onDeleteConfirm(product.id)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-all">
                Confirm
              </button>
              <button onClick={onDeleteCancel}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => onDelete(product.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, rtl = false, mono = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rtl?: boolean; mono?: boolean
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} dir={rtl ? 'rtl' : undefined} placeholder={placeholder}
      className={`w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-yellow-400 focus:bg-white transition-all placeholder-slate-400 text-slate-900 ${rtl ? 'font-ku text-right' : ''} ${mono ? 'font-mono' : ''}`} />
  )
}

function Textarea({ value, onChange, placeholder, rtl = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rtl?: boolean
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} dir={rtl ? 'rtl' : undefined} placeholder={placeholder} rows={3}
      className={`w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-yellow-400 focus:bg-white transition-all resize-none placeholder-slate-400 text-slate-900 ${rtl ? 'font-ku text-right' : ''}`} />
  )
}
