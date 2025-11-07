'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, DollarSign } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { PaymentMethod, InvoiceStatus } from '@/types'

interface MarkAsPaidDialogProps {
  invoice: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function MarkAsPaidDialog({ invoice, open, onOpenChange, onSuccess }: MarkAsPaidDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [amount, setAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH)
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invoice) return

    const paymentAmount = parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert('Por favor ingrese un monto válido')
      return
    }

    const remainingAmount = invoice.total - invoice.amountPaid
    if (paymentAmount > remainingAmount) {
      alert(`El monto no puede ser mayor al saldo pendiente (${formatCurrency(remainingAmount)})`)
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Register payment:', {
        invoiceId: invoice.id,
        amount: paymentAmount,
        method: paymentMethod,
        transactionId,
        date: paymentDate,
        notes,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error registering payment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!invoice) return null

  const remainingAmount = invoice.total - invoice.amountPaid
  const isFullPayment = parseFloat(amount) === remainingAmount

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setAmount(remainingAmount.toFixed(2))
      setPaymentDate(new Date())
      setPaymentMethod(PaymentMethod.CASH)
      setTransactionId('')
      setNotes('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registre el pago recibido para la factura {invoice.invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invoice Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Paciente:</span>
              <span className="font-medium">{invoice.patientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Factura:</span>
              <span className="font-medium">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pagado:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(invoice.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-2">
              <span className="text-red-600">Saldo Pendiente:</span>
              <span className="text-red-600">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto a Pagar *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                placeholder="0.00"
                required
              />
            </div>
            {isFullPayment && (
              <p className="text-xs text-green-600">
                Este pago liquidará completamente la factura
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label>Fecha de Pago *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !paymentDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? (
                    format(paymentDate, 'PPP', { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(d) => d && setPaymentDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pago *</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PaymentMethod.CASH}>Efectivo</SelectItem>
                <SelectItem value={PaymentMethod.CREDIT_CARD}>Tarjeta de Crédito</SelectItem>
                <SelectItem value={PaymentMethod.DEBIT_CARD}>Tarjeta de Débito</SelectItem>
                <SelectItem value={PaymentMethod.BANK_TRANSFER}>Transferencia Bancaria</SelectItem>
                <SelectItem value={PaymentMethod.CHECK}>Cheque</SelectItem>
                <SelectItem value={PaymentMethod.INSURANCE}>Seguro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <Label htmlFor="transactionId">ID de Transacción</Label>
            <Input
              id="transactionId"
              placeholder="Opcional - Número de referencia"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Información adicional sobre el pago..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Form Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
