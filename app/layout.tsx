import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const kurdishFont = localFont({
  src: './public/font/ku.otf',
  variable: '--font-ku',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Click Group | کلیک گروپ — Technology Solutions',
  description:
    'Premium technology solutions for businesses — Digital Menu, Restaurant POS, Clinic Management, Mobile Apps & Web Development. Based in Kurdistan.',
  keywords: ['Click Group', 'کلیک گروپ', 'Restaurant POS', 'Digital Menu', 'Clinic System', 'Kurdistan Technology'],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Click Group | کلیک گروپ',
    description: 'Premium IT solutions tailored for modern businesses.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head />
      <body className={`${inter.variable} ${kurdishFont.variable} font-sans bg-white text-slate-900 antialiased overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}
