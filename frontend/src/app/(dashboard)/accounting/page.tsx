/**
 * Accounting page
 * Invoicing, payments, and financial management
 * To be implemented
 */
export default function AccountingPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contabilidad
          </h1>
          <p className="text-gray-600">
            Facturación, pagos y reportes financieros
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Nueva Factura
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-2">Ingresos del Mes</p>
          <p className="text-3xl font-bold text-green-600">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-2">Facturas Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-2">Facturas Vencidas</p>
          <p className="text-3xl font-bold text-red-600">--</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500 text-center py-16">
            Invoices and payments management - To be implemented
          </p>
        </div>
      </div>
    </div>
  )
}
