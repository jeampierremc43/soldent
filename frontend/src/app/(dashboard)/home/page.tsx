'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { StatCard } from '@/components/shared/StatCard'
import { DataTable } from '@/components/shared/DataTable'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  FOLLOWUP_PRIORITY_COLORS,
  FOLLOWUP_PRIORITY_LABELS,
} from '@/constants'
import {
  Users,
  Calendar,
  DollarSign,
  CheckSquare,
  ArrowRight,
} from 'lucide-react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const { data, loading, error, refresh } = useDashboard(true, 30000)

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar el dashboard</p>
          <Button onClick={refresh}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido al sistema Soldent - {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats Cards */}
      {loading && !data ? (
        <LoadingSkeleton variant="stat" count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pacientes"
            value={data?.stats.totalPatients || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Citas de Hoy"
            value={data?.stats.todayAppointments || 0}
            change={data?.stats.appointmentsChange}
            icon={Calendar}
            color="green"
          />
          <StatCard
            title="Seguimientos Pendientes"
            value={data?.stats.pendingFollowUps || 0}
            icon={CheckSquare}
            color="orange"
          />
          <StatCard
            title="Ingresos del Mes"
            value={`$${data?.stats.monthlyRevenue.toLocaleString() || 0}`}
            change={data?.stats.revenueChange}
            icon={DollarSign}
            color="purple"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {loading && !data ? (
          <LoadingSkeleton variant="chart" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Ingresos Mensuales</CardTitle>
              <p className="text-sm text-gray-600">
                Últimos 6 meses
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Ingresos"
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Appointments Pie Chart */}
        {loading && !data ? (
          <LoadingSkeleton variant="chart" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Citas por Estado</CardTitle>
              <p className="text-sm text-gray-600">
                Distribución del último mes
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.appointmentsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) =>
                      `${status} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data?.appointmentsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        {loading && !data ? (
          <LoadingSkeleton variant="table" count={5} />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Citas de Hoy</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {data?.todayAppointments.length || 0} citas programadas
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    key: 'time',
                    label: 'Hora',
                    className: 'w-20',
                  },
                  {
                    key: 'patient',
                    label: 'Paciente',
                  },
                  {
                    key: 'reason',
                    label: 'Motivo',
                    className: 'hidden md:table-cell',
                  },
                  {
                    key: 'status',
                    label: 'Estado',
                    render: (item: any) => (
                      <Badge
                        variant="secondary"
                        className={APPOINTMENT_STATUS_COLORS[item.status] || ''}
                      >
                        {APPOINTMENT_STATUS_LABELS[item.status] || item.status}
                      </Badge>
                    ),
                  },
                ]}
                data={data?.todayAppointments || []}
                emptyMessage="No hay citas programadas para hoy"
              />
            </CardContent>
          </Card>
        )}

        {/* Urgent Follow-ups */}
        {loading && !data ? (
          <LoadingSkeleton variant="table" count={5} />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Seguimientos Urgentes</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {data?.urgentFollowups.length || 0} seguimientos pendientes
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    key: 'title',
                    label: 'Título',
                  },
                  {
                    key: 'patient',
                    label: 'Paciente',
                  },
                  {
                    key: 'dueDate',
                    label: 'Fecha',
                    className: 'hidden md:table-cell',
                    render: (item: any) => format(new Date(item.dueDate), 'dd/MM/yyyy'),
                  },
                  {
                    key: 'priority',
                    label: 'Prioridad',
                    render: (item: any) => (
                      <Badge
                        variant="secondary"
                        className={FOLLOWUP_PRIORITY_COLORS[item.priority] || ''}
                      >
                        {FOLLOWUP_PRIORITY_LABELS[item.priority] || item.priority}
                      </Badge>
                    ),
                  },
                ]}
                data={data?.urgentFollowups || []}
                emptyMessage="No hay seguimientos urgentes"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
