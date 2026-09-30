import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import HeroSlider from '@/components/HeroSlider'
import ProductShowcase, { type DBProduct } from '@/components/ProductShowcase'
import LeadForm from '@/components/LeadForm'
import Footer from '@/components/Footer'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import { createClient } from '@/lib/supabase/server'
import { defaultSettings, type SiteSettings } from '@/lib/siteSettings'
import type { Slide } from '@/components/HeroSlider'

type BizType      = { label_en: string; label_ku: string }
type SystemOption = { label_en: string; label_ku: string }

async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single()
    return (data as SiteSettings) ?? defaultSettings
  } catch {
    return defaultSettings
  }
}

async function getSlides(): Promise<Slide[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('slides')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })
    return (data as Slide[]) ?? []
  } catch {
    return []
  }
}

// null = query failed (showcase uses its built-in fallback); [] = admin removed all products
async function getProducts(): Promise<DBProduct[] | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })
    if (error || !data) return null
    return data as DBProduct[]
  } catch {
    return null
  }
}

async function getBusinessTypes(): Promise<BizType[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('business_types')
      .select('label_en, label_ku')
      .eq('active', true)
      .order('order_index', { ascending: true })
    return (data as BizType[]) ?? []
  } catch {
    return []
  }
}

async function getSystems(): Promise<SystemOption[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('systems')
      .select('label_en, label_ku')
      .eq('active', true)
      .order('order_index', { ascending: true })
    return (data as SystemOption[]) ?? []
  } catch {
    return []
  }
}

export default async function Home() {
  const [settings, slides, products, businessTypes, systems] = await Promise.all([
    getSiteSettings(),
    getSlides(),
    getProducts(),
    getBusinessTypes(),
    getSystems(),
  ])
  return (
    <>
      <RealtimeRefresher />
      <Navbar settings={settings} />
      <main>
        <HeroSection settings={settings} />
        <HeroSlider slides={slides} />
        {products?.length !== 0 && <ProductShowcase products={products ?? undefined} />}
        <LeadForm businessTypes={businessTypes} systems={systems} />
      </main>
      <Footer settings={settings} />
    </>
  )
}
