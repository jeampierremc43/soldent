'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { InvoiceStatus } from '@/types'

interface ViewInvoiceDialogProps {
  invoice: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

const invoiceStatusConfig = {
  [InvoiceStatus.DRAFT]: {
    label: 'Borrador',
    className: 'bg-gray-100 text-gray-800',
  },
  [InvoiceStatus.PENDING]: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800',
  },
  [InvoiceStatus.PAID]: {
    label: 'Pagada',
    className: 'bg-green-100 text-green-800',
  },
  [InvoiceStatus.PARTIALLY_PAID]: {
    label: 'Pago Parcial',
    className: 'bg-blue-100 text-blue-800',
  },
  [InvoiceStatus.OVERDUE]: {
    label: 'Vencida',
    className: 'bg-red-100 text-red-800',
  },
  [InvoiceStatus.CANCELLED]: {
    label: 'Cancelada',
    className: 'bg-gray-100 text-gray-800',
  },
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange }: ViewInvoiceDialogProps) {
  if (!invoice) return null

  const statusConfig = invoiceStatusConfig[invoice.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">Factura {invoice.invoiceNumber}</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Detalles completos de la factura
              </p>
            </div>
            <Badge className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Información del Paciente</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-lg">{invoice.patientName}</p>
              <p className="text-sm text-gray-600">ID: {invoice.patientId}</p>
            </div>
          </div>

          <Separator />

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Fecha de Emisión</h3>
              <p className="text-gray-700">
                {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: es })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Fecha de Vencimiento</h3>
              <p className="text-gray-700">
                {format(new Date(invoice.dueDate), 'dd MMMM yyyy', { locale: es })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Service Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Servicios</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                      Descripción
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                      Cantidad
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm">Servicio dental</td>
                    <td className="px-4 py-3 text-sm text-right">1</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IVA (12%):</span>
              <span className="font-medium">{formatCurrency(invoice.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
            {invoice.amountPaid > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Pagado:</span>
                  <span className="font-medium">{formatCurrency(invoice.amountPaid)}</span>
                </div>
                {invoice.amountPaid < invoice.total && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Pendiente:</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.total - invoice.amountPaid)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Payment Information */}
          {invoice.status === InvoiceStatus.PAID && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Información de Pago</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Factura pagada completamente el{' '}
                  {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: es })}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
