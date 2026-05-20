'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeRefresher() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('homepage-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slides' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'business_types' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'systems' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => router.refresh())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
