'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Plus, Trash2, Search } from 'lucide-react'

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

const TAX_RATE = 0.12 // 12% tax rate for Ecuador

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface InvoiceFormData {
  patientId: string
  patientName: string
  date: Date
  dueDate: Date
  items: InvoiceItem[]
  notes: string
  paymentMethod: PaymentMethod
  status: InvoiceStatus
}

// Mock patients data
const mockPatients = [
  { id: '1', name: 'María González', identification: '1234567890' },
  { id: '2', name: 'Juan Pérez', identification: '0987654321' },
  { id: '3', name: 'Ana Martínez', identification: '1122334455' },
  { id: '4', name: 'Carlos Rodríguez', identification: '5544332211' },
  { id: '5', name: 'Laura Sánchez', identification: '6677889900' },
]

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>
  onSubmit: (data: InvoiceFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function InvoiceForm({ initialData, onSubmit, onCancel, isSubmitting }: InvoiceFormProps) {
  // Form state
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(
    initialData?.patientId && initialData?.patientName
      ? { id: initialData.patientId, name: initialData.patientName }
      : null
  )
  const [date, setDate] = useState<Date>(initialData?.date || new Date())
  const [dueDate, setDueDate] = useState<Date>(
    initialData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  )
  const [items, setItems] = useState<InvoiceItem[]>(
    initialData?.items || [
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]
  )
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialData?.paymentMethod || PaymentMethod.CASH
  )
  const [status, setStatus] = useState<InvoiceStatus>(
    initialData?.status || InvoiceStatus.PENDING
  )
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!patientSearch) return mockPatients
    const search = patientSearch.toLowerCase()
    return mockPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.identification.includes(search)
    )
  }, [patientSearch])

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * TAX_RATE
    const total = subtotal + tax

    return {
      subtotal,
      tax,
      total,
    }
  }, [items])

  // Add new item
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  // Remove item
  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  // Update item field
  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }

          // Recalculate total when quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice
          }

          return updated
        }
        return item
      })
    )
  }

  // Select patient
  const handleSelectPatient = (patient: { id: string; name: string }) => {
    setSelectedPatient(patient)
    setPatientSearch(patient.name)
    setShowPatientDropdown(false)
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient) {
      alert('Por favor seleccione un paciente')
      return
    }

    if (items.some((item) => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      alert('Por favor complete todos los items de la factura')
      return
    }

    const formData: InvoiceFormData = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      date,
      dueDate,
      items,
      notes,
      paymentMethod,
      status,
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Selection */}
      <div className="space-y-2">
        <Label htmlFor="patient">Paciente *</Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="patient"
              placeholder="Buscar paciente por nombre o cédula..."
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value)
                setShowPatientDropdown(true)
              }}
              onFocus={() => setShowPatientDropdown(true)}
              className="pl-10"
              required
            />
          </div>
          {showPatientDropdown && filteredPatients.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-gray-500">{patient.identification}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedPatient && (
          <p className="text-sm text-gray-600">
            Paciente seleccionado: <span className="font-medium">{selectedPatient.name}</span>
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Invoice Date */}
        <div className="space-y-2">
          <Label>Fecha de Factura *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label>Fecha de Vencimiento *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dueDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(d) => d && setDueDate(d)}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Servicios / Productos *</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-3">
                  {/* Description */}
                  <div>
                    <Label htmlFor={`description-${item.id}`} className="text-sm">
                      Descripción
                    </Label>
                    <Input
                      id={`description-${item.id}`}
                      placeholder="Ej: Limpieza dental, Extracción, etc."
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateItem(item.id, 'description', e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Quantity, Unit Price, Total */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`quantity-${item.id}`} className="text-sm">
                        Cantidad
                      </Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`unitPrice-${item.id}`} className="text-sm">
                        Precio Unit. (USD)
                      </Label>
                      <Input
                        id={`unitPrice-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`total-${item.id}`} className="text-sm">
                        Subtotal
                      </Label>
                      <Input
                        id={`total-${item.id}`}
                        type="text"
                        value={formatCurrency(item.total)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Summary */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">IVA (12%):</span>
          <span className="font-medium">{formatCurrency(calculations.tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span>{formatCurrency(calculations.total)}</span>
        </div>
      </div>

      {/* Payment Method and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Method */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Método de Pago *</Label>
          <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
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

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado de Pago *</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as InvoiceStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={InvoiceStatus.DRAFT}>Borrador</SelectItem>
              <SelectItem value={InvoiceStatus.PENDING}>Pendiente</SelectItem>
              <SelectItem value={InvoiceStatus.PAID}>Pagada</SelectItem>
              <SelectItem value={InvoiceStatus.PARTIALLY_PAID}>Pago Parcial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas / Observaciones</Label>
        <Textarea
          id="notes"
          placeholder="Información adicional sobre la factura..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Factura' : 'Crear Factura'}
        </Button>
      </div>
    </form>
  )
}
