'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Loader2, Save, X, Tag, ToggleLeft, ToggleRight, Monitor, GripVertical } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type BizType = {
  id: number
  label_en: string
  label_ku: string
  order_index: number
  active: boolean
}

type SystemOption = {
  id: number
  label_en: string
  label_ku: string
  order_index: number
  active: boolean
}

type Toast = { type: 'success' | 'error'; msg: string }

/* ── Shared editable row (used by both sections) ── */
function EditableRow({
  item,
  table,
  onDelete,
  onUpdate,
  dragHandle,
}: {
  item: BizType | SystemOption
  table: 'business_types' | 'systems'
  onDelete: (id: number) => void
  onUpdate: (updated: BizType | SystemOption) => void
  dragHandle?: React.ReactNode
}) {
  const [draft, setDraft] = useState(item)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  const changed = draft.label_en !== item.label_en || draft.label_ku !== item.label_ku

  async function save() {
    setSaving(true)
    await supabase
      .from(table)
      .update({ label_en: draft.label_en, label_ku: draft.label_ku })
      .eq('id', item.id)
    onUpdate({ ...item, label_en: draft.label_en, label_ku: draft.label_ku })
    setSaving(false)
  }

  async function toggle() {
    const next = !item.active
    await supabase.from(table).update({ active: next }).eq('id', item.id)
    onUpdate({ ...item, active: next })
  }

  async function remove() {
    setDeleting(true)
    await supabase.from(table).delete().eq('id', item.id)
    onDelete(item.id)
  }

  const inputCls =
    'flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-all text-slate-800'

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        item.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
      }`}
    >
      {dragHandle}

      <span className="text-xs font-mono text-slate-400 w-5 flex-shrink-0">{item.order_index}</span>

      <input
        value={draft.label_en}
        onChange={e => setDraft(d => ({ ...d, label_en: e.target.value }))}
        placeholder="English label"
        className={inputCls}
      />

      <input
        value={draft.label_ku}
        onChange={e => setDraft(d => ({ ...d, label_ku: e.target.value }))}
        placeholder="Kurdish label"
        dir="rtl"
        className={`${inputCls} font-ku`}
      />

      {changed && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-400 hover:bg-yellow-300 text-blue-900 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </button>
          <button
            onClick={() => setDraft(item)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <button
        onClick={toggle}
        title={item.active ? 'Deactivate' : 'Activate'}
        className="flex-shrink-0 text-slate-400 hover:text-yellow-500 transition-colors"
      >
        {item.active
          ? <ToggleRight className="w-6 h-6 text-yellow-500" />
          : <ToggleLeft className="w-6 h-6" />}
      </button>

      <button
        onClick={remove}
        disabled={deleting}
        className="flex-shrink-0 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-40"
      >
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  )
}

/* ── Shared sortable row wrapper ── */
function SortableRow({
  item,
  table,
  onDelete,
  onUpdate,
}: {
  item: BizType | SystemOption
  table: 'business_types' | 'systems'
  onDelete: (id: number) => void
  onUpdate: (updated: BizType | SystemOption) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const handle = (
    <button
      {...attributes}
      {...listeners}
      className="flex-shrink-0 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors touch-none"
      tabIndex={-1}
    >
      <GripVertical className="w-4 h-4" />
    </button>
  )

  return (
    <div ref={setNodeRef} style={style}>
      <EditableRow item={item} table={table} onDelete={onDelete} onUpdate={onUpdate} dragHandle={handle} />
    </div>
  )
}

/* ── Add form ── */
function AddForm({ onAdd, onCancel }: { onAdd: (en: string, ku: string) => Promise<void>; onCancel: () => void }) {
  const [en, setEn] = useState('')
  const [ku, setKu] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!en.trim() || !ku.trim()) return
    setSaving(true)
    await onAdd(en.trim(), ku.trim())
    setSaving(false)
  }

  const inputCls = 'flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-all'

  return (
    <div className="bg-white rounded-2xl border border-yellow-300 p-5 space-y-4" style={{ boxShadow: '0 0 0 3px rgba(250,204,21,0.12)' }}>
      <div className="flex gap-3">
        <input value={en} onChange={e => setEn(e.target.value)} placeholder="English label" className={inputCls} autoFocus onKeyDown={e => e.key === 'Enter' && submit()} />
        <input value={ku} onChange={e => setKu(e.target.value)} placeholder="Kurdish label" dir="rtl" className={`${inputCls} font-ku`} onKeyDown={e => e.key === 'Enter' && submit()} />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all">Cancel</button>
        <button onClick={submit} disabled={saving || !en.trim() || !ku.trim()} className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg text-blue-900 transition-all disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#facc15,#eab308)' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </div>
    </div>
  )
}

/* ── Page ── */
export default function BusinessTypesPage() {
  const [types, setTypes] = useState<BizType[]>([])
  const [systems, setSystems] = useState<SystemOption[]>([])
  const [loading, setLoading] = useState(true)
  const [addingType, setAddingType] = useState(false)
  const [addingSystem, setAddingSystem] = useState(false)
  const [activeDragId, setActiveDragId] = useState<number | null>(null)
  const [activeDragTable, setActiveDragTable] = useState<'business_types' | 'systems' | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  useEffect(() => {
    load()
    const channel = supabase
      .channel('admin-biztypes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'business_types' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'systems' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function load() {
    const [{ data: t }, { data: s }] = await Promise.all([
      supabase.from('business_types').select('*').order('order_index', { ascending: true }),
      supabase.from('systems').select('*').order('order_index', { ascending: true }),
    ])
    setTypes((t as BizType[]) ?? [])
    setSystems((s as SystemOption[]) ?? [])
    setLoading(false)
  }

  function showToast(t: Toast) {
    setToast(t)
    setTimeout(() => setToast(null), 3000)
  }

  async function addType(en: string, ku: string) {
    const maxOrder = types.length ? Math.max(...types.map(t => t.order_index)) : 0
    const { error } = await supabase.from('business_types').insert({ label_en: en, label_ku: ku, order_index: maxOrder + 1, active: true })
    if (error) { showToast({ type: 'error', msg: error.message }); return }
    setAddingType(false)
    showToast({ type: 'success', msg: 'Business type added!' })
    load()
  }

  async function addSystem(en: string, ku: string) {
    const maxOrder = systems.length ? Math.max(...systems.map(s => s.order_index)) : 0
    const { error } = await supabase.from('systems').insert({ label_en: en, label_ku: ku, order_index: maxOrder + 1, active: true })
    if (error) { showToast({ type: 'error', msg: error.message }); return }
    setAddingSystem(false)
    showToast({ type: 'success', msg: 'System added!' })
    load()
  }

  /* ── DnD helpers ── */
  function makeDragHandlers(table: 'business_types' | 'systems') {
    function onDragStart(event: DragStartEvent) {
      setActiveDragId(event.active.id as number)
      setActiveDragTable(table)
    }

    async function onDragEnd(event: DragEndEvent) {
      setActiveDragId(null)
      setActiveDragTable(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      if (table === 'business_types') {
        const oldIdx = types.findIndex(t => t.id === active.id)
        const newIdx = types.findIndex(t => t.id === over.id)
        const reordered = arrayMove(types, oldIdx, newIdx).map((t, i) => ({ ...t, order_index: i + 1 }))
        setTypes(reordered)
        await Promise.all(reordered.map(t => supabase.from('business_types').update({ order_index: t.order_index }).eq('id', t.id)))
      } else {
        const oldIdx = systems.findIndex(s => s.id === active.id)
        const newIdx = systems.findIndex(s => s.id === over.id)
        const reordered = arrayMove(systems, oldIdx, newIdx).map((s, i) => ({ ...s, order_index: i + 1 }))
        setSystems(reordered)
        await Promise.all(reordered.map(s => supabase.from('systems').update({ order_index: s.order_index }).eq('id', s.id)))
      }
    }

    return { onDragStart, onDragEnd }
  }

  const bizHandlers = makeDragHandlers('business_types')
  const sysHandlers = makeDragHandlers('systems')

  const activeDragItem =
    activeDragId !== null
      ? (activeDragTable === 'business_types' ? types : systems).find(x => x.id === activeDragId)
      : null

  return (
    <div className="max-w-2xl mx-auto space-y-10">

      {/* ── Business Types ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Business Types</h1>
            <p className="text-sm text-slate-500 mt-0.5">Options shown in the lead form dropdown</p>
          </div>
          <button onClick={() => setAddingType(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-blue-900 transition-all" style={{ background: 'linear-gradient(135deg,#facc15,#eab308)', boxShadow: '0 4px 16px rgba(250,204,21,0.4)' }}>
            <Plus className="w-4 h-4" /> Add Type
          </button>
        </div>

        {addingType && <AddForm onAdd={addType} onCancel={() => setAddingType(false)} />}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 border border-yellow-200">
              <Tag className="w-4 h-4 text-yellow-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">All Business Types</h2>
            <span className="ml-auto text-xs text-slate-400">{types.filter(t => t.active).length} active</span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <GripVertical className="w-3.5 h-3.5" /> drag to reorder
            </span>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-yellow-400 animate-spin" /></div>
            ) : types.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-10">No business types yet.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={bizHandlers.onDragStart} onDragEnd={bizHandlers.onDragEnd}>
                <SortableContext items={types.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {types.map(t => (
                      <SortableRow
                        key={t.id}
                        item={t}
                        table="business_types"
                        onDelete={id => setTypes(prev => prev.filter(x => x.id !== id))}
                        onUpdate={u => setTypes(prev => prev.map(x => x.id === u.id ? u as BizType : x))}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeDragItem && activeDragTable === 'business_types' && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-white border-yellow-300" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)', opacity: 0.96 }}>
                      <GripVertical className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-xs font-mono text-slate-400 w-5">{activeDragItem.order_index}</span>
                      <span className="flex-1 text-sm text-slate-700">{activeDragItem.label_en}</span>
                      <span className="flex-1 text-sm text-slate-700 font-ku text-right">{activeDragItem.label_ku}</span>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>
      </section>

      {/* ── Systems of Interest (with DnD) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">System of Interest</h2>
            <p className="text-sm text-slate-500 mt-0.5 font-ku">سیستەمی داواکراو — options shown in the lead form</p>
          </div>
          <button onClick={() => setAddingSystem(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-blue-900 transition-all" style={{ background: 'linear-gradient(135deg,#facc15,#eab308)', boxShadow: '0 4px 16px rgba(250,204,21,0.4)' }}>
            <Plus className="w-4 h-4" /> Add System
          </button>
        </div>

        {addingSystem && <AddForm onAdd={addSystem} onCancel={() => setAddingSystem(false)} />}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 border border-yellow-200">
              <Monitor className="w-4 h-4 text-yellow-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">All Systems</h3>
            <span className="ml-auto text-xs text-slate-400">{systems.filter(s => s.active).length} active</span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <GripVertical className="w-3.5 h-3.5" /> drag to reorder
            </span>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-yellow-400 animate-spin" /></div>
            ) : systems.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-10">No systems yet. Add one above.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={sysHandlers.onDragStart} onDragEnd={sysHandlers.onDragEnd}>
                <SortableContext items={systems.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {systems.map(s => (
                      <SortableRow
                        key={s.id}
                        item={s}
                        table="systems"
                        onDelete={id => setSystems(prev => prev.filter(x => x.id !== id))}
                        onUpdate={u => setSystems(prev => prev.map(x => x.id === u.id ? u as SystemOption : x))}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeDragItem && activeDragTable === 'systems' && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-white border-yellow-300" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)', opacity: 0.96 }}>
                      <GripVertical className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-xs font-mono text-slate-400 w-5">{activeDragItem.order_index}</span>
                      <span className="flex-1 text-sm text-slate-700">{activeDragItem.label_en}</span>
                      <span className="flex-1 text-sm text-slate-700 font-ku text-right">{activeDragItem.label_ku}</span>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>
      </section>

      <p className="text-xs text-slate-400 text-center">
        Toggle the switch to show/hide an entry without deleting it. Drag <GripVertical className="inline w-3 h-3" /> to reorder.
      </p>

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
