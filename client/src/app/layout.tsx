// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'ROTASI - Repositori Online untuk Pelatihan dan Informasi',
  description: 'Platform pembelajaran yang komprehensif dengan akses ke kursus berkualitas tinggi dan fitur pembelajaran interaktif',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}