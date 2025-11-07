'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, User, Stethoscope, FileText, Repeat, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Appointment } from '@/hooks/useAppointments'
import {
  appointmentTypeLabels,
  appointmentStatusConfig,
} from '@/lib/validations/appointment.schema'

interface ViewAppointmentDialogProps {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewAppointmentDialog({
  appointment,
  open,
  onOpenChange,
}: ViewAppointmentDialogProps) {
  if (!appointment) return null

  const statusConfig = appointmentStatusConfig[appointment.status as keyof typeof appointmentStatusConfig]
  const typeLabel = appointmentTypeLabels[appointment.type as keyof typeof appointmentTypeLabels]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">Detalles de la Cita</DialogTitle>
              <DialogDescription>
                Información completa de la cita médica
              </DialogDescription>
            </div>
            <Badge className={statusConfig.bgColor + ' ' + statusConfig.textColor}>
              {statusConfig.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Paciente</span>
            </div>
            <p className="text-lg font-medium pl-6">{appointment.patientName}</p>
          </div>

          <Separator />

          {/* Doctor Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Stethoscope className="h-4 w-4" />
              <span>Doctor</span>
            </div>
            <p className="text-lg font-medium pl-6">{appointment.doctorName}</p>
          </div>

          <Separator />

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Fecha</span>
              </div>
              <p className="text-lg font-medium pl-6">
                {format(new Date(appointment.appointmentDate), 'PPP', { locale: es })}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Horario</span>
              </div>
              <p className="text-lg font-medium pl-6">
                {appointment.startTime} - {appointment.endTime}
              </p>
            </div>
          </div>

          <Separator />

          {/* Appointment Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Tipo de Cita</span>
            </div>
            <p className="text-lg font-medium pl-6">{typeLabel}</p>
          </div>

          {/* Reason */}
          {appointment.reason && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Motivo</span>
                </div>
                <p className="pl-6">{appointment.reason}</p>
              </div>
            </>
          )}

          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Notas</span>
                </div>
                <p className="pl-6 text-sm text-muted-foreground">{appointment.notes}</p>
              </div>
            </>
          )}

          {/* Recurring Information */}
          {appointment.isRecurring && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Repeat className="h-4 w-4" />
                  <span>Cita Recurrente</span>
                </div>
                <div className="pl-6">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Parte de una serie recurrente
                  </Badge>
                  {appointment.recurrenceId && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ID de Recurrencia: #{appointment.recurrenceId}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Creada:</span>{' '}
              {format(new Date(appointment.createdAt), 'PPp', { locale: es })}
            </div>
            <div>
              <span className="font-medium">Actualizada:</span>{' '}
              {format(new Date(appointment.updatedAt), 'PPp', { locale: es })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
