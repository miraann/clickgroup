import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Click Group',
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
