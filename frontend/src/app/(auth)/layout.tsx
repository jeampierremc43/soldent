import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticación - Soldent',
  description: 'Iniciar sesión o registrarse en Soldent',
}

/**
 * Authentication layout
 * Centered layout for login, register, and password recovery pages
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 via-white to-medical-green-50">
      {children}
    </div>
  )
}
