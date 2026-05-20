export type SiteSettings = {
  id: number
  logo_url: string | null
  brand_en_part1: string
  brand_en_part2: string
  brand_ku: string
  logo_tagline: string
  badge_ku: string
  badge_en: string
  hero_location: string
  hero_tagline_en: string
  cta_primary_ku: string
  cta_primary_en: string
  cta_secondary_en: string
  nav_cta_ku: string
  stat1_value: string
  stat1_label_en: string
  stat1_label_ku: string
  stat2_value: string
  stat2_label_en: string
  stat2_label_ku: string
  stat3_value: string
  stat3_label_en: string
  stat3_label_ku: string
  phone: string
  address_en: string
  address_ku: string
  footer_desc_en: string
  footer_desc_ku: string
  facebook_url: string
  instagram_url: string
  linkedin_url: string
  tiktok_url: string
  whatsapp_url: string
}

export const defaultSettings: SiteSettings = {
  id: 1,
  logo_url: null,
  brand_en_part1: 'Click',
  brand_en_part2: 'Group',
  brand_ku: 'کلیک گروپ',
  logo_tagline: 'Technology',
  badge_ku: 'شیرکەتی تەکنەلۆژیای زانیاری',
  badge_en: 'Information Technology',
  hero_location: 'Kurdistan Region · Iraq',
  hero_tagline_en: 'Empowering businesses with cutting-edge digital solutions — built for the modern era.',
  cta_primary_ku: 'سیستەمەکانمان',
  cta_primary_en: 'Our Systems',
  cta_secondary_en: 'Get in Touch',
  nav_cta_ku: 'داواکردنی تاقیکاری',
  stat1_value: '5+',
  stat1_label_en: 'Products & Systems',
  stat1_label_ku: 'سیستەم',
  stat2_value: '100+',
  stat2_label_en: 'Happy Clients',
  stat2_label_ku: 'کڕیار',
  stat3_value: '3+',
  stat3_label_en: 'Years of Experience',
  stat3_label_ku: 'ساڵ',
  phone: '+964 770 146 6787',
  address_en: 'Kurdistan Region, Iraq',
  address_ku: 'هەرێمی کوردستان، عێراق',
  footer_desc_en: 'Premium digital solutions tailored for modern businesses across Kurdistan and beyond.',
  footer_desc_ku: 'شیرکەتی تەکنەلۆژیای زانیاری',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  tiktok_url: '',
  whatsapp_url: '',
}
