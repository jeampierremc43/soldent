'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Patient {
  id: string
  firstName: string
  lastName: string
  identificationNumber: string
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

interface MedicalRecord {
  id: string
  patient: Patient
  patientId: string
  visitDate: string
  chiefComplaint: string
  diagnosis: string
  treatment: string
  prescriptions: Prescription[]
  notes: string
  nextAppointmentDate?: string
  createdAt: string
  updatedAt: string
}

interface EditMedicalRecordDialogProps {
  record: MedicalRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface PrescriptionForm {
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export function EditMedicalRecordDialog({
  record,
  open,
  onOpenChange,
  onSuccess,
}: EditMedicalRecordDialogProps) {
  const [loading, setLoading] = useState(false)
  const [visitDate, setVisitDate] = useState<Date>(new Date())
  const [nextAppointmentDate, setNextAppointmentDate] = useState<Date | undefined>()

  // Form fields
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [notes, setNotes] = useState('')

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<PrescriptionForm[]>([])
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const [currentPrescription, setCurrentPrescription] = useState<PrescriptionForm>({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  })

  // Load record data when dialog opens
  useEffect(() => {
    if (record && open) {
      setVisitDate(new Date(record.visitDate))
      setChiefComplaint(record.chiefComplaint)
      setDiagnosis(record.diagnosis)
      setTreatment(record.treatment)
      setNotes(record.notes)
      setPrescriptions(
        record.prescriptions.map((p) => ({
          medication: p.medication,
          dosage: p.dosage,
          frequency: p.frequency,
          duration: p.duration,
          instructions: p.instructions || '',
        }))
      )
      setNextAppointmentDate(record.nextAppointmentDate ? new Date(record.nextAppointmentDate) : undefined)
    }
  }, [record, open])

  const handleAddPrescription = () => {
    if (currentPrescription.medication && currentPrescription.dosage) {
      setPrescriptions([...prescriptions, currentPrescription])
      setCurrentPrescription({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      })
      setShowPrescriptionForm(false)
    }
  }

  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: API call to update medical record
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSuccess()
    } catch (error) {
      console.error('Error updating medical record:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Registro Médico</DialogTitle>
          <DialogDescription>
            Actualice la información de la visita médica del paciente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Info (Read-only) */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-600">Paciente</p>
            <p className="font-semibold text-gray-900">
              {record.patient.firstName} {record.patient.lastName}
            </p>
            <p className="text-sm text-gray-600">
              Cédula: {record.patient.identificationNumber}
            </p>
          </div>

          {/* Visit Date */}
          <div className="space-y-2">
            <Label>Fecha de Visita *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !visitDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {visitDate ? format(visitDate, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={visitDate}
                  onSelect={(date) => date && setVisitDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Chief Complaint */}
          <div className="space-y-2">
            <Label htmlFor="complaint">Motivo de Consulta *</Label>
            <Textarea
              id="complaint"
              placeholder="Ej: Dolor en muela superior derecha..."
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              required
              rows={2}
            />
          </div>

          {/* Diagnosis */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnóstico *</Label>
            <Textarea
              id="diagnosis"
              placeholder="Ej: Caries dental profunda en pieza 16..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
              rows={3}
            />
          </div>

          {/* Treatment */}
          <div className="space-y-2">
            <Label htmlFor="treatment">Tratamiento Realizado *</Label>
            <Textarea
              id="treatment"
              placeholder="Descripción del tratamiento realizado..."
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              required
              rows={3}
            />
          </div>

          {/* Prescriptions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Prescripciones</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Medicamento
              </Button>
            </div>

            {/* Prescription Form */}
            {showPrescriptionForm && (
              <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="medication">Medicamento</Label>
                    <Input
                      id="medication"
                      placeholder="Nombre del medicamento"
                      value={currentPrescription.medication}
                      onChange={(e) =>
                        setCurrentPrescription({ ...currentPrescription, medication: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosis</Label>
                    <Input
                      id="dosage"
                      placeholder="Ej: 500mg"
                      value={currentPrescription.dosage}
                      onChange={(e) =>
                        setCurrentPrescription({ ...currentPrescription, dosage: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frecuencia</Label>
                    <Input
                      id="frequency"
                      placeholder="Ej: Cada 8 horas"
                      value={currentPrescription.frequency}
                      onChange={(e) =>
                        setCurrentPrescription({ ...currentPrescription, frequency: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración</Label>
                    <Input
                      id="duration"
                      placeholder="Ej: 7 días"
                      value={currentPrescription.duration}
                      onChange={(e) =>
                        setCurrentPrescription({ ...currentPrescription, duration: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instrucciones</Label>
                  <Input
                    id="instructions"
                    placeholder="Instrucciones adicionales"
                    value={currentPrescription.instructions}
                    onChange={(e) =>
                      setCurrentPrescription({ ...currentPrescription, instructions: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPrescriptionForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="button" size="sm" onClick={handleAddPrescription}>
                    Agregar
                  </Button>
                </div>
              </div>
            )}

            {/* Prescription List */}
            {prescriptions.length > 0 && (
              <div className="space-y-2">
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="border rounded-lg p-3 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{prescription.medication}</p>
                      <p className="text-xs text-gray-600">
                        {prescription.dosage} - {prescription.frequency} por {prescription.duration}
                      </p>
                      {prescription.instructions && (
                        <p className="text-xs text-gray-500 mt-1 italic">{prescription.instructions}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePrescription(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones, recomendaciones u otra información relevante..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Next Appointment */}
          <div className="space-y-2">
            <Label>Próxima Cita (Opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !nextAppointmentDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextAppointmentDate ? (
                    format(nextAppointmentDate, 'PPP', { locale: es })
                  ) : (
                    <span>Seleccionar fecha de seguimiento</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextAppointmentDate}
                  onSelect={setNextAppointmentDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Actualizar Registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
