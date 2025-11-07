import { z } from 'zod'

/**
 * Appointment validation schemas
 */

export const appointmentSchema = z.object({
  patientId: z.number({
    required_error: 'El paciente es requerido',
  }).positive('Seleccione un paciente válido'),

  doctorId: z.number({
    required_error: 'El doctor es requerido',
  }).positive('Seleccione un doctor válido'),

  appointmentDate: z.date({
    required_error: 'La fecha es requerida',
  }),

  startTime: z.string({
    required_error: 'La hora de inicio es requerida',
  }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),

  endTime: z.string({
    required_error: 'La hora de fin es requerida',
  }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),

  type: z.enum(['CHECKUP', 'CLEANING', 'FILLING', 'EXTRACTION', 'ROOT_CANAL', 'ORTHODONTICS', 'EMERGENCY', 'FOLLOWUP', 'OTHER'], {
    required_error: 'El tipo de cita es requerido',
  }),

  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).default('SCHEDULED'),

  reason: z.string().min(3, 'El motivo debe tener al menos 3 caracteres').optional().or(z.literal('')),

  notes: z.string().optional().or(z.literal('')),

  isRecurring: z.boolean().default(false),

  // Recurring appointment fields
  recurrencePattern: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']),
    interval: z.number().min(1).max(12),
    endDate: z.date().optional(),
    occurrences: z.number().min(1).max(52).optional(),
  }).optional(),
}).refine(
  (data) => {
    // Validate end time is after start time
    const [startHour, startMin] = data.startTime.split(':').map(Number)
    const [endHour, endMin] = data.endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return endMinutes > startMinutes
  },
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['endTime'],
  }
).refine(
  (data) => {
    // If recurring, must have recurrence pattern
    if (data.isRecurring && !data.recurrencePattern) {
      return false
    }
    return true
  },
  {
    message: 'Debe especificar el patrón de recurrencia',
    path: ['recurrencePattern'],
  }
)

export const rescheduleAppointmentSchema = z.object({
  appointmentDate: z.date({
    required_error: 'La fecha es requerida',
  }),

  startTime: z.string({
    required_error: 'La hora de inicio es requerida',
  }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),

  endTime: z.string({
    required_error: 'La hora de fin es requerida',
  }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),

  reason: z.string().min(5, 'El motivo debe tener al menos 5 caracteres'),
}).refine(
  (data) => {
    const [startHour, startMin] = data.startTime.split(':').map(Number)
    const [endHour, endMin] = data.endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return endMinutes > startMinutes
  },
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['endTime'],
  }
)

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(5, 'El motivo debe tener al menos 5 caracteres'),
  notifyPatient: z.boolean().default(true),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>
export type RescheduleAppointmentFormData = z.infer<typeof rescheduleAppointmentSchema>
export type CancelAppointmentFormData = z.infer<typeof cancelAppointmentSchema>

// Appointment type labels
export const appointmentTypeLabels: Record<string, string> = {
  CHECKUP: 'Revisión',
  CLEANING: 'Limpieza',
  FILLING: 'Obturación',
  EXTRACTION: 'Extracción',
  ROOT_CANAL: 'Endodoncia',
  ORTHODONTICS: 'Ortodoncia',
  EMERGENCY: 'Emergencia',
  FOLLOWUP: 'Seguimiento',
  OTHER: 'Otro',
}

// Appointment status labels and colors
export const appointmentStatusConfig = {
  SCHEDULED: { label: 'Agendada', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  CONFIRMED: { label: 'Confirmada', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  IN_PROGRESS: { label: 'En Progreso', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  COMPLETED: { label: 'Completada', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
  CANCELLED: { label: 'Cancelada', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  NO_SHOW: { label: 'No Asistió', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  RESCHEDULED: { label: 'Reagendada', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
}

// Recurrence frequency labels
export const recurrenceFrequencyLabels: Record<string, string> = {
  DAILY: 'Diaria',
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quincenal',
  MONTHLY: 'Mensual',
}
