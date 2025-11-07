import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { AppointmentFormData, RescheduleAppointmentFormData, CancelAppointmentFormData } from '@/lib/validations/appointment.schema'

/**
 * Appointment interface
 */
export interface Appointment {
  id: number
  patientId: number
  patientName: string
  doctorId: number
  doctorName: string
  appointmentDate: string
  startTime: string
  endTime: string
  type: string
  status: string
  reason?: string
  notes?: string
  isRecurring: boolean
  recurrenceId?: number
  createdAt: string
  updatedAt: string
}

/**
 * Availability slot interface
 */
export interface AvailabilitySlot {
  startTime: string
  endTime: string
  isAvailable: boolean
}

/**
 * Hook for managing appointments
 */
export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch appointments with filters
   */
  const fetchAppointments = useCallback(async (filters?: {
    startDate?: string
    endDate?: string
    doctorId?: number
    patientId?: number
    status?: string
    type?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await appointmentsApi.getAppointments(filters)
      // setAppointments(response.data)

      // Mock data for development
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          patientId: 1,
          patientName: 'Juan Pérez García',
          doctorId: 1,
          doctorName: 'Dr. Carlos Mendoza',
          appointmentDate: '2025-11-07',
          startTime: '09:00',
          endTime: '09:30',
          type: 'CHECKUP',
          status: 'SCHEDULED',
          reason: 'Revisión general',
          isRecurring: false,
          createdAt: '2025-11-01T10:00:00Z',
          updatedAt: '2025-11-01T10:00:00Z',
        },
        {
          id: 2,
          patientId: 2,
          patientName: 'María López Sánchez',
          doctorId: 1,
          doctorName: 'Dr. Carlos Mendoza',
          appointmentDate: '2025-11-07',
          startTime: '10:00',
          endTime: '10:45',
          type: 'CLEANING',
          status: 'CONFIRMED',
          reason: 'Limpieza dental',
          isRecurring: true,
          recurrenceId: 1,
          createdAt: '2025-11-01T11:00:00Z',
          updatedAt: '2025-11-02T09:00:00Z',
        },
        {
          id: 3,
          patientId: 3,
          patientName: 'Pedro Rodríguez Gómez',
          doctorId: 2,
          doctorName: 'Dra. Ana Martínez',
          appointmentDate: '2025-11-07',
          startTime: '11:00',
          endTime: '12:00',
          type: 'ROOT_CANAL',
          status: 'IN_PROGRESS',
          reason: 'Endodoncia molar inferior',
          isRecurring: false,
          createdAt: '2025-11-01T12:00:00Z',
          updatedAt: '2025-11-07T11:00:00Z',
        },
        {
          id: 4,
          patientId: 4,
          patientName: 'Ana Torres Vega',
          doctorId: 1,
          doctorName: 'Dr. Carlos Mendoza',
          appointmentDate: '2025-11-08',
          startTime: '14:00',
          endTime: '14:30',
          type: 'FOLLOWUP',
          status: 'SCHEDULED',
          reason: 'Control post-extracción',
          isRecurring: false,
          createdAt: '2025-11-03T10:00:00Z',
          updatedAt: '2025-11-03T10:00:00Z',
        },
        {
          id: 5,
          patientId: 5,
          patientName: 'Luis Fernández Castro',
          doctorId: 2,
          doctorName: 'Dra. Ana Martínez',
          appointmentDate: '2025-11-09',
          startTime: '09:30',
          endTime: '10:00',
          type: 'EXTRACTION',
          status: 'CANCELLED',
          reason: 'Extracción molar',
          notes: 'Paciente canceló por enfermedad',
          isRecurring: false,
          createdAt: '2025-11-02T15:00:00Z',
          updatedAt: '2025-11-06T08:00:00Z',
        },
      ]

      // Apply filters
      let filtered = mockAppointments

      if (filters?.startDate) {
        filtered = filtered.filter(a => a.appointmentDate >= filters.startDate!)
      }
      if (filters?.endDate) {
        filtered = filtered.filter(a => a.appointmentDate <= filters.endDate!)
      }
      if (filters?.doctorId) {
        filtered = filtered.filter(a => a.doctorId === filters.doctorId)
      }
      if (filters?.patientId) {
        filtered = filtered.filter(a => a.patientId === filters.patientId)
      }
      if (filters?.status) {
        filtered = filtered.filter(a => a.status === filters.status)
      }
      if (filters?.type) {
        filtered = filtered.filter(a => a.type === filters.type)
      }

      setAppointments(filtered)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar las citas'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new appointment
   */
  const createAppointment = async (data: AppointmentFormData) => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await appointmentsApi.createAppointment(data)
      // await fetchAppointments()

      toast.success('Cita creada exitosamente')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la cita'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update an appointment
   */
  const updateAppointment = async (id: number, data: Partial<AppointmentFormData>) => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await appointmentsApi.updateAppointment(id, data)
      // await fetchAppointments()

      toast.success('Cita actualizada exitosamente')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la cita'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reschedule an appointment
   */
  const rescheduleAppointment = async (id: number, data: RescheduleAppointmentFormData) => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await appointmentsApi.rescheduleAppointment(id, data)
      // await fetchAppointments()

      toast.success('Cita reagendada exitosamente')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al reagendar la cita'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cancel an appointment
   */
  const cancelAppointment = async (id: number, data: CancelAppointmentFormData) => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await appointmentsApi.cancelAppointment(id, data)
      // await fetchAppointments()

      toast.success('Cita cancelada exitosamente')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar la cita'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check availability for a specific date and time
   */
  const checkAvailability = async (
    doctorId: number,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: number
  ): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      // const response = await appointmentsApi.checkAvailability({
      //   doctorId,
      //   date,
      //   startTime,
      //   endTime,
      //   excludeAppointmentId,
      // })
      // return response.isAvailable

      // Mock: always available for now
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al verificar disponibilidad'
      toast.error(message)
      return false
    }
  }

  /**
   * Get available time slots for a doctor on a specific date
   */
  const getAvailableSlots = async (
    doctorId: number,
    date: string,
    duration: number = 30
  ): Promise<AvailabilitySlot[]> => {
    try {
      // TODO: Replace with actual API call
      // const response = await appointmentsApi.getAvailableSlots({
      //   doctorId,
      //   date,
      //   duration,
      // })
      // return response.slots

      // Mock data
      const slots: AvailabilitySlot[] = []
      for (let hour = 9; hour < 18; hour++) {
        slots.push({
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${hour.toString().padStart(2, '0')}:30`,
          isAvailable: Math.random() > 0.3,
        })
        slots.push({
          startTime: `${hour.toString().padStart(2, '0')}:30`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          isAvailable: Math.random() > 0.3,
        })
      }
      return slots
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener horarios disponibles'
      toast.error(message)
      return []
    }
  }

  // Load appointments on mount
  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    rescheduleAppointment,
    cancelAppointment,
    checkAvailability,
    getAvailableSlots,
  }
}
