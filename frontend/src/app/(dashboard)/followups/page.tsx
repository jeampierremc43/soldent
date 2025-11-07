/**
 * Follow-ups page
 * Patient follow-up tasks and reminders management
 * To be implemented
 */
export default function FollowUpsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Seguimientos
          </h1>
          <p className="text-gray-600">
            Gestiona las tareas de seguimiento de pacientes
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Nuevo Seguimiento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-2">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-2">En Progreso</p>
          <p className="text-3xl font-bold text-blue-600">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-2">Completados Hoy</p>
          <p className="text-3xl font-bold text-green-600">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-2">Urgentes</p>
          <p className="text-3xl font-bold text-red-600">--</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500 text-center py-16">
            Follow-ups list and management - To be implemented
          </p>
        </div>
      </div>
    </div>
  )
}
