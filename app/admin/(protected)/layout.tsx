import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap, Package, Home, Layers, Tag, Inbox } from 'lucide-react'
import SignOutButton from '../_components/SignOutButton'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-200 flex flex-col z-40">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <Link href="/admin/products" className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #facc15, #eab308)', boxShadow: '0 2px 10px rgba(250,204,21,0.35)' }}
            >
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-base" style={{ color: '#1e3a8a' }}>
                Click<span className="text-yellow-500">Group</span>
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-slate-400">
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] px-3 mb-2">
            Content
          </p>
          <Link
            href="/admin/home"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors group"
          >
            <Home className="w-4 h-4 text-slate-400 group-hover:text-yellow-500 transition-colors" />
            Home
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors group"
          >
            <Package className="w-4 h-4 text-slate-400 group-hover:text-yellow-500 transition-colors" />
            Products
          </Link>
          <Link
            href="/admin/slides"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors group"
          >
            <Layers className="w-4 h-4 text-slate-400 group-hover:text-yellow-500 transition-colors" />
            Slides
          </Link>
          <Link
            href="/admin/business-types"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors group"
          >
            <Tag className="w-4 h-4 text-slate-400 group-hover:text-yellow-500 transition-colors" />
            Business Types
          </Link>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] px-3 mb-2 mt-4">
            CRM
          </p>
          <Link
            href="/admin/leads"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors group"
          >
            <Inbox className="w-4 h-4 text-slate-400 group-hover:text-yellow-500 transition-colors" />
            Leads
          </Link>
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Administrator</p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 ml-60 p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
