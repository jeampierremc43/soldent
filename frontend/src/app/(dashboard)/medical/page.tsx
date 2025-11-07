/**
 * Medical records page
 * Medical records and patient history management
 * To be implemented
 */
export default function MedicalRecordsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registros Médicos
          </h1>
          <p className="text-gray-600">
            Historiales médicos y diagnósticos
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Nuevo Registro
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500 text-center py-16">
            Medical records list and details - To be implemented
          </p>
        </div>
      </div>
    </div>
  )
}
