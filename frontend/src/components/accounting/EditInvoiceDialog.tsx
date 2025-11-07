'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InvoiceForm } from '@/components/accounting/InvoiceForm'

interface EditInvoiceDialogProps {
  invoice: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditInvoiceDialog({ invoice, open, onOpenChange, onSuccess }: EditInvoiceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Update invoice:', data)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error updating invoice:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!invoice) return null

  // Convert invoice data to form format
  const initialData = {
    patientId: invoice.patientId,
    patientName: invoice.patientName,
    date: new Date(invoice.date),
    dueDate: new Date(invoice.dueDate),
    items: [
      {
        id: '1',
        description: 'Servicio dental',
        quantity: 1,
        unitPrice: invoice.subtotal,
        total: invoice.subtotal,
      },
    ],
    notes: '',
    paymentMethod: 'cash' as any,
    status: invoice.status,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Factura - {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Modifique la información de la factura. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <InvoiceForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
