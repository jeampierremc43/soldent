'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { useAppointments } from '@/hooks/useAppointments'
import type { AppointmentFormData } from '@/lib/validations/appointment.schema'

interface CreateAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: Date
  defaultDoctorId?: number
  onSuccess?: () => void
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultDoctorId,
  onSuccess,
}: CreateAppointmentDialogProps) {
  const { createAppointment, loading } = useAppointments()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true)
    const success = await createAppointment(data)
    setIsSubmitting(false)

    if (success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Cita</DialogTitle>
          <DialogDescription>
            Complete el formulario para agendar una nueva cita médica
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          defaultValues={{
            appointmentDate: defaultDate,
            doctorId: defaultDoctorId,
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isSubmitting || loading}
          mode="create"
        />
      </DialogContent>
    </Dialog>
  )
}
