import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Project Dashboard',
  description: 'Live project timeline dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
