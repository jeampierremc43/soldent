import { useState, useEffect } from 'react'
import { DashboardStats } from '@/types'

interface DashboardData {
  stats: DashboardStats
  todayAppointments: any[]
  urgentFollowups: any[]
  revenueChartData: any[]
  appointmentsChartData: any[]
}

interface UseDashboardResult {
  data: DashboardData | null
  loading: boolean
  error: Error | null
  refresh: () => void
}

// Mock data generator
const generateMockData = (): DashboardData => {
  return {
    stats: {
      totalPatients: 245,
      todayAppointments: 12,
      pendingFollowUps: 8,
      monthlyRevenue: 24500,
      revenueChange: 12.5,
      appointmentsChange: 8.3,
    },
    todayAppointments: [
      {
        id: '1',
        time: '09:00',
        patient: 'María González',
        doctor: 'Dr. Juan Pérez',
        status: 'confirmed',
        reason: 'Limpieza dental',
      },
      {
        id: '2',
        time: '10:30',
        patient: 'Carlos Ruiz',
        doctor: 'Dr. Juan Pérez',
        status: 'scheduled',
        reason: 'Extracción',
      },
      {
        id: '3',
        time: '11:00',
        patient: 'Ana Martínez',
        doctor: 'Dr. Juan Pérez',
        status: 'in_progress',
        reason: 'Ortodoncia',
      },
      {
        id: '4',
        time: '14:00',
        patient: 'Luis Torres',
        doctor: 'Dr. Juan Pérez',
        status: 'scheduled',
        reason: 'Revisión general',
      },
      {
        id: '5',
        time: '15:30',
        patient: 'Sofia Ramírez',
        doctor: 'Dr. Juan Pérez',
        status: 'scheduled',
        reason: 'Endodoncia',
      },
    ],
    urgentFollowups: [
      {
        id: '1',
        title: 'Revisión post-operatoria',
        patient: 'Carlos Ruiz',
        dueDate: '2025-11-07',
        priority: 'urgent',
      },
      {
        id: '2',
        title: 'Control de ortodoncia',
        patient: 'Ana Martínez',
        dueDate: '2025-11-08',
        priority: 'high',
      },
      {
        id: '3',
        title: 'Retirar puntos',
        patient: 'Pedro Sánchez',
        dueDate: '2025-11-09',
        priority: 'urgent',
      },
      {
        id: '4',
        title: 'Revisión de implante',
        patient: 'Laura García',
        dueDate: '2025-11-10',
        priority: 'high',
      },
      {
        id: '5',
        title: 'Control de sensibilidad',
        patient: 'Roberto Díaz',
        dueDate: '2025-11-11',
        priority: 'medium',
      },
    ],
    revenueChartData: [
      { month: 'Ene', revenue: 18000 },
      { month: 'Feb', revenue: 21000 },
      { month: 'Mar', revenue: 19500 },
      { month: 'Abr', revenue: 23000 },
      { month: 'May', revenue: 22000 },
      { month: 'Jun', revenue: 24500 },
    ],
    appointmentsChartData: [
      { status: 'Completadas', value: 156, fill: '#10b981' },
      { status: 'Programadas', value: 45, fill: '#3b82f6' },
      { status: 'Canceladas', value: 12, fill: '#ef4444' },
      { status: 'No asistió', value: 8, fill: '#f59e0b' },
    ],
  }
}

export function useDashboard(autoRefresh = false, refreshInterval = 30000): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // TODO: Replace with actual API call
      // const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_STATS)
      // setData(response.data)

      // Using mock data for now
      const mockData = generateMockData()
      setData(mockData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar datos del dashboard'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval])

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  }
}
