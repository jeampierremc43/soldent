import Link from 'next/link'

/**
 * Landing page / Home page
 * This is a placeholder - to be implemented with actual landing page design
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Soldent
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Sistema Integral de Gestión Médica Dental
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          Optimiza la gestión de tu clínica dental con nuestro sistema completo
          de pacientes, citas, historiales médicos, contabilidad y seguimientos.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Registrarse
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Gestión de Pacientes</h3>
            <p className="text-gray-600">
              Administra información completa de pacientes, historiales y documentos.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-green-600 text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Agenda de Citas</h3>
            <p className="text-gray-600">
              Programa y gestiona citas con calendario intuitivo y notificaciones.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-purple-600 text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Contabilidad</h3>
            <p className="text-gray-600">
              Control de facturación, pagos y reportes financieros detallados.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
