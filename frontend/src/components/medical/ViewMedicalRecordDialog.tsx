'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, User, FileText, Pill, Stethoscope, ClipboardList } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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

interface ViewMedicalRecordDialogProps {
  record: MedicalRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewMedicalRecordDialog({
  record,
  open,
  onOpenChange,
}: ViewMedicalRecordDialogProps) {
  if (!record) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Registro Médico</DialogTitle>
          <DialogDescription>
            Información completa de la visita médica
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <User className="h-5 w-5 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">
                {record.patient.firstName} {record.patient.lastName}
              </h3>
              <p className="text-sm text-blue-700">
                Cédula: {record.patient.identificationNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">Fecha de Visita</p>
              <p className="font-semibold text-blue-900">
                {format(new Date(record.visitDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Motivo de Consulta</h3>
            </div>
            <p className="text-gray-700 pl-7">{record.chiefComplaint}</p>
          </div>

          <Separator />

          {/* Diagnosis */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Diagnóstico</h3>
            </div>
            <p className="text-gray-700 pl-7">{record.diagnosis}</p>
          </div>

          <Separator />

          {/* Treatment */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Tratamiento Realizado</h3>
            </div>
            <p className="text-gray-700 pl-7">{record.treatment}</p>
          </div>

          {/* Prescriptions */}
          {record.prescriptions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    Prescripciones ({record.prescriptions.length})
                  </h3>
                </div>
                <div className="space-y-3 pl-7">
                  {record.prescriptions.map((prescription, index) => (
                    <div
                      key={prescription.id}
                      className="border rounded-lg p-4 bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                          <h4 className="font-semibold text-gray-900">{prescription.medication}</h4>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Dosis:</span>
                          <span className="ml-2 font-medium text-gray-900">{prescription.dosage}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Frecuencia:</span>
                          <span className="ml-2 font-medium text-gray-900">{prescription.frequency}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Duración:</span>
                          <span className="ml-2 font-medium text-gray-900">{prescription.duration}</span>
                        </div>
                      </div>
                      {prescription.instructions && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Instrucciones:</span>{' '}
                            {prescription.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {record.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Notas Adicionales</h3>
                <p className="text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  {record.notes}
                </p>
              </div>
            </>
          )}

          {/* Next Appointment */}
          {record.nextAppointmentDate && (
            <>
              <Separator />
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Próxima Cita</p>
                  <p className="font-semibold text-green-900">
                    {format(new Date(record.nextAppointmentDate), "d 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creado:</span>{' '}
                {format(new Date(record.createdAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
              </div>
              <div>
                <span className="font-medium">Actualizado:</span>{' '}
                {format(new Date(record.updatedAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
