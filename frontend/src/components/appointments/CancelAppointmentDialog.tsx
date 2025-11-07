'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppointments, type Appointment } from '@/hooks/useAppointments'
import {
  cancelAppointmentSchema,
  type CancelAppointmentFormData,
} from '@/lib/validations/appointment.schema'

interface CancelAppointmentDialogProps {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CancelAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onSuccess,
}: CancelAppointmentDialogProps) {
  const { cancelAppointment, loading } = useAppointments()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CancelAppointmentFormData>({
    resolver: zodResolver(cancelAppointmentSchema),
    defaultValues: {
      notifyPatient: true,
    },
  })

  const handleSubmit = async (data: CancelAppointmentFormData) => {
    if (!appointment) return

    setIsSubmitting(true)
    const success = await cancelAppointment(appointment.id, data)
    setIsSubmitting(false)

    if (success) {
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    }
  }

  if (!appointment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Cancelar Cita</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paciente:</span>
              <span className="font-medium">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">{appointment.appointmentDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hora:</span>
              <span className="font-medium">
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de Cancelación *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: El paciente solicitó cancelar por motivos personales..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explique brevemente el motivo de la cancelación
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notifyPatient"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Notificar al paciente</FormLabel>
                      <FormDescription>
                        Enviar notificación por email/SMS sobre la cancelación
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset()
                    onOpenChange(false)
                  }}
                  disabled={isSubmitting || loading}
                >
                  No, mantener cita
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting ? 'Cancelando...' : 'Sí, cancelar cita'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
