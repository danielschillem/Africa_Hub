import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import Providers from '@/components/layout/Providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AFRIHUB — Gérez vos réseaux sociaux depuis un seul endroit',
  description: 'Plateforme africaine de gestion sociale — Facebook, TikTok, WhatsApp, Instagram',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" toastOptions={{
            success: { style: { background: '#1A6B3C', color: '#fff' } },
            error:   { style: { background: '#DC2626', color: '#fff' } },
          }} />
        </Providers>
      </body>
    </html>
  )
}
