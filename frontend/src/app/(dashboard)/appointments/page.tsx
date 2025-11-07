'use client'

import { useState, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  List,
  Grid3x3,
  Calendar as CalendarViewIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppointments } from '@/hooks/useAppointments'
import { CreateAppointmentDialog } from '@/components/appointments/CreateAppointmentDialog'
import { EditAppointmentDialog } from '@/components/appointments/EditAppointmentDialog'
import { ViewAppointmentDialog } from '@/components/appointments/ViewAppointmentDialog'
import { CancelAppointmentDialog } from '@/components/appointments/CancelAppointmentDialog'
import {
  appointmentTypeLabels,
  appointmentStatusConfig,
} from '@/lib/validations/appointment.schema'
import type { Appointment } from '@/hooks/useAppointments'
import { cn } from '@/lib/utils'

type ViewMode = 'day' | 'week' | 'month'

export default function AppointmentsPage() {
  const { appointments, fetchAppointments, loading } = useAppointments()

  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDoctor, setFilterDoctor] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // Mock doctors list - replace with actual API
  const doctors = [
    { id: 1, name: 'Dr. Carlos Mendoza' },
    { id: 2, name: 'Dra. Ana Martínez' },
  ]

  // Filter appointments based on view mode and filters
  const filteredAppointments = useMemo(() => {
    let filtered = appointments

    // Date range filter based on view mode
    if (viewMode === 'day') {
      filtered = filtered.filter((apt) =>
        isSameDay(parseISO(apt.appointmentDate), selectedDate)
      )
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { locale: es })
      const weekEnd = endOfWeek(selectedDate, { locale: es })
      filtered = filtered.filter((apt) => {
        const date = parseISO(apt.appointmentDate)
        return date >= weekStart && date <= weekEnd
      })
    } else if (viewMode === 'month') {
      const monthStart = startOfMonth(selectedDate)
      const monthEnd = endOfMonth(selectedDate)
      filtered = filtered.filter((apt) => {
        const date = parseISO(apt.appointmentDate)
        return date >= monthStart && date <= weekEnd
      })
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (apt) =>
          apt.patientName.toLowerCase().includes(query) ||
          apt.reason?.toLowerCase().includes(query)
      )
    }

    // Doctor filter
    if (filterDoctor && filterDoctor !== 'all') {
      filtered = filtered.filter((apt) => apt.doctorId.toString() === filterDoctor)
    }

    // Status filter
    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter((apt) => apt.status === filterStatus)
    }

    // Type filter
    if (filterType && filterType !== 'all') {
      filtered = filtered.filter((apt) => apt.type === filterType)
    }

    return filtered
  }, [appointments, viewMode, selectedDate, searchQuery, filterDoctor, filterStatus, filterType])

  // Navigation handlers
  const goToPrevious = () => {
    const newDate = new Date(selectedDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setSelectedDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(selectedDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  // Dialog handlers
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setViewDialogOpen(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setEditDialogOpen(true)
  }

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setCancelDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    fetchAppointments()
  }

  // Render date title based on view mode
  const renderDateTitle = () => {
    if (viewMode === 'day') {
      return format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { locale: es })
      const weekEnd = endOfWeek(selectedDate, { locale: es })
      return `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`
    } else {
      return format(selectedDate, 'MMMM yyyy', { locale: es })
    }
  }

  // Render appointment card
  const renderAppointmentCard = (appointment: Appointment) => {
    const statusConfig = appointmentStatusConfig[appointment.status as keyof typeof appointmentStatusConfig]
    const typeLabel = appointmentTypeLabels[appointment.type as keyof typeof appointmentTypeLabels]

    return (
      <Card
        key={appointment.id}
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleViewAppointment(appointment)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">
                  {appointment.startTime} - {appointment.endTime}
                </span>
                <Badge
                  className={cn(
                    'text-xs',
                    statusConfig.bgColor,
                    statusConfig.textColor
                  )}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <h4 className="font-semibold text-base mb-1 truncate">
                {appointment.patientName}
              </h4>
              <p className="text-sm text-muted-foreground mb-1">{appointment.doctorName}</p>
              <p className="text-sm text-muted-foreground">{typeLabel}</p>
              {appointment.reason && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {appointment.reason}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditAppointment(appointment)
                }}
              >
                Editar
              </Button>
              {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelAppointment(appointment)
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render day view
  const renderDayView = () => {
    const dayAppointments = [...filteredAppointments].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    )

    return (
      <div className="space-y-3">
        {dayAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No hay citas programadas para este día</p>
            </CardContent>
          </Card>
        ) : (
          dayAppointments.map(renderAppointmentCard)
        )}
      </div>
    )
  }

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { locale: es })
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => {
          const dayAppointments = filteredAppointments.filter((apt) =>
            isSameDay(parseISO(apt.appointmentDate), day)
          ).sort((a, b) => a.startTime.localeCompare(b.startTime))

          const isToday = isSameDay(day, new Date())

          return (
            <Card key={day.toISOString()} className={cn(isToday && 'border-primary')}>
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium text-center">
                  <div className={cn(isToday && 'text-primary')}>
                    {format(day, 'EEE', { locale: es })}
                  </div>
                  <div className={cn('text-2xl', isToday && 'text-primary')}>
                    {format(day, 'd')}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {dayAppointments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center">Sin citas</p>
                  ) : (
                    dayAppointments.map((apt) => {
                      const statusConfig = appointmentStatusConfig[apt.status as keyof typeof appointmentStatusConfig]
                      return (
                        <div
                          key={apt.id}
                          className="p-2 rounded-md border bg-card hover:bg-accent cursor-pointer transition-colors text-xs"
                          onClick={() => handleViewAppointment(apt)}
                        >
                          <div className="font-medium">{apt.startTime}</div>
                          <div className="truncate">{apt.patientName}</div>
                          <Badge
                            className={cn(
                              'text-[10px] mt-1',
                              statusConfig.bgColor,
                              statusConfig.textColor
                            )}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Render month view
  const renderMonthView = () => {
    const groupedByDate = filteredAppointments.reduce((acc, apt) => {
      const date = apt.appointmentDate
      if (!acc[date]) acc[date] = []
      acc[date].push(apt)
      return acc
    }, {} as Record<string, Appointment[]>)

    return (
      <div className="space-y-3">
        {Object.entries(groupedByDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, appointments]) => (
            <Card key={date}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {format(parseISO(date), 'EEEE, d MMMM', { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {appointments
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(renderAppointmentCard)}
              </CardContent>
            </Card>
          ))}
        {Object.keys(groupedByDate).length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No hay citas programadas para este mes</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario de Citas</h1>
          <p className="text-muted-foreground">
            Gestione y visualice todas las citas médicas
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente o motivo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterDoctor} onValueChange={setFilterDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los doctores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los doctores</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="SCHEDULED">Agendada</SelectItem>
                <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                <SelectItem value="COMPLETED">Completada</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(appointmentTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {renderDateTitle()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={goToToday}>
            Hoy
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsList>
            <TabsTrigger value="day">
              <List className="h-4 w-4 mr-2" />
              Día
            </TabsTrigger>
            <TabsTrigger value="week">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Semana
            </TabsTrigger>
            <TabsTrigger value="month">
              <CalendarViewIcon className="h-4 w-4 mr-2" />
              Mes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Citas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredAppointments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Confirmadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {filteredAppointments.filter((a) => a.status === 'CONFIRMED').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredAppointments.filter((a) => a.status === 'SCHEDULED').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Canceladas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {filteredAppointments.filter((a) => a.status === 'CANCELLED').length}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="space-y-3">
          {viewMode === 'day' && (
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
          {viewMode === 'week' && (
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="p-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-6 w-8 mt-1" />
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {[...Array(2)].map((_, j) => (
                      <Skeleton key={j} className="h-12 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {viewMode === 'month' && (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-20 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </>
      )}

      {/* Dialogs */}
      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultDate={selectedDate}
        onSuccess={handleDialogSuccess}
      />

      <EditAppointmentDialog
        appointment={selectedAppointment}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <ViewAppointmentDialog
        appointment={selectedAppointment}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <CancelAppointmentDialog
        appointment={selectedAppointment}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}
