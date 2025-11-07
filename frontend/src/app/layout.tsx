import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster as SonnerToaster } from 'sonner'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Soldent - Sistema de Gestión Médica Dental',
  description: 'Sistema integral de gestión para clínicas dentales',
  keywords: 'dental, clínica, gestión, pacientes, citas, odontología',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
        {/* Sonner Toast Notifications */}
        <SonnerToaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
        {/* Radix UI Toast Notifications */}
        <Toaster />
      </body>
    </html>
  )
}
