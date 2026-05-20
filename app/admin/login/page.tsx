'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Zap, Loader2, AlertCircle } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/products')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md px-4">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #facc15, #eab308)', boxShadow: '0 4px 20px rgba(250,204,21,0.4)' }}
          >
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-xl" style={{ color: '#1e3a8a' }}>
              Click<span className="text-yellow-500">Group</span>
            </span>
            <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-slate-400">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
          <p className="text-slate-500 text-sm mb-6">Access the Click Group admin dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-yellow-400 focus:bg-white transition-all placeholder-slate-400"
                placeholder="admin@clickgroup.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:border-yellow-400 focus:bg-white transition-all placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-70 mt-2"
              style={{
                background: 'linear-gradient(135deg, #facc15, #eab308)',
                color: '#1e3a8a',
                boxShadow: '0 4px 18px rgba(250,204,21,0.3)',
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Click Group · Admin Portal
        </p>
      </div>
    </div>
  )
}
