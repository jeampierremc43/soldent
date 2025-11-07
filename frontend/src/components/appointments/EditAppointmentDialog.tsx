'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { useAppointments, type Appointment } from '@/hooks/useAppointments'
import type { AppointmentFormData } from '@/lib/validations/appointment.schema'

interface EditAppointmentDialogProps {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onSuccess,
}: EditAppointmentDialogProps) {
  const { updateAppointment, loading } = useAppointments()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: AppointmentFormData) => {
    if (!appointment) return

    setIsSubmitting(true)
    const success = await updateAppointment(appointment.id, data)
    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }

  if (!appointment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cita</DialogTitle>
          <DialogDescription>
            Modifique los datos de la cita médica
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          defaultValues={{
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            appointmentDate: new Date(appointment.appointmentDate),
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            type: appointment.type as any,
            status: appointment.status as any,
            reason: appointment.reason,
            notes: appointment.notes,
            isRecurring: appointment.isRecurring,
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isSubmitting || loading}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  )
}
