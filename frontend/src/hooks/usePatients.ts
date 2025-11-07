import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { Patient, PatientFormData, PatientFilters, PaginatedResponse } from '@/types'

/**
 * Custom hook for managing patients
 * Handles fetching, creating, updating, and deleting patients
 */
export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  /**
   * Fetch patients with filters and pagination
   */
  const fetchPatients = useCallback(async (filters?: PatientFilters, page = 1, limit = 10) => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/patients', { params: { ...filters, page, limit } })

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 800))

      const mockPatients: Patient[] = [
        {
          id: '1',
          identificationType: 'cedula',
          identificationNumber: '1234567890',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
          phone: '0991234567',
          dateOfBirth: '1990-05-15',
          gender: 'male',
          address: 'Av. Principal 123',
          city: 'Quito',
          province: 'pichincha',
          emergencyContact: {
            name: 'María Pérez',
            relationship: 'spouse',
            phone: '0987654321',
          },
          insuranceInfo: {
            hasInsurance: true,
            provider: 'Seguros Unidos',
            policyNumber: 'POL-12345',
          },
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          identificationType: 'cedula',
          identificationNumber: '0987654321',
          firstName: 'Ana',
          lastName: 'González',
          email: 'ana.gonzalez@example.com',
          phone: '0981234567',
          dateOfBirth: '1985-08-22',
          gender: 'female',
          address: 'Calle Secundaria 456',
          city: 'Guayaquil',
          province: 'guayas',
          emergencyContact: {
            name: 'Carlos González',
            relationship: 'sibling',
            phone: '0976543210',
          },
          insuranceInfo: {
            hasInsurance: false,
          },
          isActive: true,
          createdAt: '2024-01-16T11:00:00Z',
          updatedAt: '2024-01-16T11:00:00Z',
        },
        {
          id: '3',
          identificationType: 'passport',
          identificationNumber: 'AB123456',
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          email: 'carlos.rodriguez@example.com',
          phone: '0971234567',
          dateOfBirth: '1978-12-10',
          gender: 'male',
          address: 'Urbanización Los Pinos',
          city: 'Cuenca',
          province: 'azuay',
          emergencyContact: {
            name: 'Laura Rodríguez',
            relationship: 'spouse',
            phone: '0965432109',
          },
          insuranceInfo: {
            hasInsurance: true,
            provider: 'Salud Total',
            policyNumber: 'ST-98765',
          },
          isActive: false,
          createdAt: '2024-01-17T09:30:00Z',
          updatedAt: '2024-01-20T14:15:00Z',
        },
      ]

      // Apply filters
      let filteredPatients = [...mockPatients]

      if (filters?.search) {
        const search = filters.search.toLowerCase()
        filteredPatients = filteredPatients.filter(
          p =>
            p.firstName.toLowerCase().includes(search) ||
            p.lastName.toLowerCase().includes(search) ||
            p.identificationNumber.includes(search) ||
            p.email?.toLowerCase().includes(search)
        )
      }

      if (filters?.status && filters.status !== 'all') {
        filteredPatients = filteredPatients.filter(p =>
          filters.status === 'active' ? p.isActive : !p.isActive
        )
      }

      if (filters?.gender && filters.gender !== 'all') {
        filteredPatients = filteredPatients.filter(p => p.gender === filters.gender)
      }

      if (filters?.hasInsurance && filters.hasInsurance !== 'all') {
        filteredPatients = filteredPatients.filter(p =>
          filters.hasInsurance === 'yes'
            ? p.insuranceInfo?.hasInsurance
            : !p.insuranceInfo?.hasInsurance
        )
      }

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPatients = filteredPatients.slice(startIndex, endIndex)

      setPatients(paginatedPatients)
      setPagination({
        page,
        limit,
        total: filteredPatients.length,
        totalPages: Math.ceil(filteredPatients.length / limit),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar pacientes'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new patient
   */
  const createPatient = async (data: PatientFormData): Promise<Patient | null> => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post('/api/patients', data)

      await new Promise(resolve => setTimeout(resolve, 500))

      const newPatient: Patient = {
        id: `${Date.now()}`,
        identificationType: data.identificationType,
        identificationNumber: data.identificationNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: typeof data.dateOfBirth === 'string' ? data.dateOfBirth : data.dateOfBirth.toISOString(),
        gender: data.gender,
        address: data.address,
        city: data.city,
        province: data.province,
        emergencyContact: data.emergencyContactName
          ? {
              name: data.emergencyContactName,
              relationship: data.emergencyContactRelationship || '',
              phone: data.emergencyContactPhone || '',
            }
          : undefined,
        insuranceInfo: {
          hasInsurance: data.hasInsurance,
          provider: data.insuranceProvider,
          policyNumber: data.insurancePolicyNumber,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setPatients(prev => [newPatient, ...prev])
      toast.success('Paciente creado exitosamente')
      return newPatient
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear paciente'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update an existing patient
   */
  const updatePatient = async (id: string, data: Partial<PatientFormData>): Promise<Patient | null> => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.patch(`/api/patients/${id}`, data)

      await new Promise(resolve => setTimeout(resolve, 500))

      const updatedPatients = patients.map(patient => {
        if (patient.id === id) {
          return {
            ...patient,
            ...data,
            dateOfBirth: data.dateOfBirth
              ? typeof data.dateOfBirth === 'string'
                ? data.dateOfBirth
                : data.dateOfBirth.toISOString()
              : patient.dateOfBirth,
            updatedAt: new Date().toISOString(),
          }
        }
        return patient
      })

      setPatients(updatedPatients)
      toast.success('Paciente actualizado exitosamente')

      const updatedPatient = updatedPatients.find(p => p.id === id)
      return updatedPatient || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar paciente'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete a patient (soft delete - set isActive to false)
   */
  const deletePatient = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // await apiClient.delete(`/api/patients/${id}`)

      await new Promise(resolve => setTimeout(resolve, 500))

      setPatients(prev => prev.filter(p => p.id !== id))
      toast.success('Paciente eliminado exitosamente')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar paciente'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get a single patient by ID
   */
  const getPatient = useCallback(async (id: string): Promise<Patient | null> => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/api/patients/${id}`)

      await new Promise(resolve => setTimeout(resolve, 300))

      const patient = patients.find(p => p.id === id)

      if (!patient) {
        throw new Error('Paciente no encontrado')
      }

      return patient
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar paciente'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [patients])

  return {
    patients,
    loading,
    error,
    pagination,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getPatient,
  }
}
