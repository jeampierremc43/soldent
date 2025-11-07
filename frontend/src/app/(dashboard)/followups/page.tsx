'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  MoreHorizontal,
  List,
  LayoutGrid,
  Calendar as CalendarIcon,
  User,
  FileText,
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

// Types
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type ViewMode = 'list' | 'kanban'

interface FollowUp {
  id: string
  patientId: string
  patientName: string
  title: string
  description?: string
  priority: Priority
  status: Status
  dueDate: string
  assignedTo: string
  assignedToName: string
  relatedAppointmentId?: string
  reminderDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

interface Patient {
  id: string
  name: string
}

interface Staff {
  id: string
  name: string
}

interface FormData {
  patientId: string
  title: string
  description: string
  priority: Priority
  status: Status
  dueDate: Date | undefined
  assignedTo: string
  relatedAppointmentId: string
  reminderDate: Date | undefined
  notes: string
}

// Priority configuration
const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; icon: typeof AlertTriangle }> = {
  LOW: {
    label: 'Baja',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 border-gray-300',
    icon: Circle,
  },
  MEDIUM: {
    label: 'Media',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 border-blue-300',
    icon: Clock,
  },
  HIGH: {
    label: 'Alta',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 border-orange-300',
    icon: AlertTriangle,
  },
  URGENT: {
    label: 'Urgente',
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-300',
    icon: AlertTriangle,
  },
}

// Status configuration
const statusConfig: Record<Status, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
  PENDING: {
    label: 'Pendiente',
    variant: 'warning',
  },
  IN_PROGRESS: {
    label: 'En Progreso',
    variant: 'default',
  },
  COMPLETED: {
    label: 'Completado',
    variant: 'success',
  },
  CANCELLED: {
    label: 'Cancelado',
    variant: 'secondary',
  },
}

// Mock data
const mockFollowUps: FollowUp[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'María González',
    title: 'Revisión de ortodoncia',
    description: 'Control mensual de brackets, verificar ajuste y progreso',
    priority: 'HIGH',
    status: 'PENDING',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: '1',
    assignedToName: 'Dr. Carlos Mendoza',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Juan Pérez',
    title: 'Llamada de seguimiento post-extracción',
    description: 'Verificar recuperación después de extracción de muela del juicio',
    priority: 'URGENT',
    status: 'PENDING',
    dueDate: new Date().toISOString(),
    assignedTo: '2',
    assignedToName: 'Dra. Ana Martínez',
    reminderDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Carlos Ramírez',
    title: 'Agendar limpieza dental',
    description: 'Programar cita de limpieza dental semestral',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: '3',
    assignedToName: 'Recepción',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    patientId: '4',
    patientName: 'Ana López',
    title: 'Recordatorio de pago pendiente',
    description: 'Factura #1234 pendiente de pago del tratamiento de conducto',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: '3',
    assignedToName: 'Recepción',
    notes: 'Cliente solicitó recordatorio por WhatsApp',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    patientId: '5',
    patientName: 'Pedro Sánchez',
    title: 'Entrega de radiografías',
    description: 'Entregar resultados de radiografías panorámicas',
    priority: 'LOW',
    status: 'COMPLETED',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: '3',
    assignedToName: 'Recepción',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: '6',
    patientId: '6',
    patientName: 'Laura Fernández',
    title: 'Consulta sobre implantes',
    description: 'Paciente solicitó información sobre costos y procedimiento de implantes dentales',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: '1',
    assignedToName: 'Dr. Carlos Mendoza',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    patientId: '7',
    patientName: 'Roberto Díaz',
    title: 'Control de blanqueamiento',
    description: 'Revisión después de 2 semanas del tratamiento de blanqueamiento',
    priority: 'LOW',
    status: 'PENDING',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: '2',
    assignedToName: 'Dra. Ana Martínez',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const mockPatients: Patient[] = [
  { id: '1', name: 'María González' },
  { id: '2', name: 'Juan Pérez' },
  { id: '3', name: 'Carlos Ramírez' },
  { id: '4', name: 'Ana López' },
  { id: '5', name: 'Pedro Sánchez' },
  { id: '6', name: 'Laura Fernández' },
  { id: '7', name: 'Roberto Díaz' },
]

const mockStaff: Staff[] = [
  { id: '1', name: 'Dr. Carlos Mendoza' },
  { id: '2', name: 'Dra. Ana Martínez' },
  { id: '3', name: 'Recepción' },
]

export default function FollowUpsPage() {
  // State
  const [followUps, setFollowUps] = useState<FollowUp[]>(mockFollowUps)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>('all')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: undefined,
    assignedTo: '',
    relatedAppointmentId: '',
    reminderDate: undefined,
    notes: '',
  })

  // Filter and compute stats
  const filteredFollowUps = useMemo(() => {
    let filtered = [...followUps]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (fu) =>
          fu.patientName.toLowerCase().includes(query) ||
          fu.title.toLowerCase().includes(query) ||
          fu.description?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter((fu) => fu.status === filterStatus)
    }

    // Priority filter
    if (filterPriority && filterPriority !== 'all') {
      filtered = filtered.filter((fu) => fu.priority === filterPriority)
    }

    // Assigned to filter
    if (filterAssignedTo && filterAssignedTo !== 'all') {
      filtered = filtered.filter((fu) => fu.assignedTo === filterAssignedTo)
    }

    return filtered
  }, [followUps, searchQuery, filterStatus, filterPriority, filterAssignedTo])

  // Compute summary stats
  const stats = useMemo(() => {
    const today = startOfDay(new Date())
    const pending = followUps.filter((fu) => fu.status === 'PENDING').length
    const inProgress = followUps.filter((fu) => fu.status === 'IN_PROGRESS').length
    const completedToday = followUps.filter(
      (fu) =>
        fu.status === 'COMPLETED' &&
        fu.completedAt &&
        startOfDay(parseISO(fu.completedAt)).getTime() === today.getTime()
    ).length
    const urgent = followUps.filter(
      (fu) => fu.priority === 'URGENT' && fu.status !== 'COMPLETED' && fu.status !== 'CANCELLED'
    ).length

    return { pending, inProgress, completedToday, urgent }
  }, [followUps])

  // Check if task is overdue
  const isOverdue = (dueDate: string, status: Status) => {
    if (status === 'COMPLETED' || status === 'CANCELLED') return false
    return isBefore(parseISO(dueDate), startOfDay(new Date()))
  }

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setFormData({
      patientId: '',
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: undefined,
      assignedTo: '',
      relatedAppointmentId: '',
      reminderDate: undefined,
      notes: '',
    })
    setCreateDialogOpen(true)
  }

  const handleOpenEditDialog = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp)
    setFormData({
      patientId: followUp.patientId,
      title: followUp.title,
      description: followUp.description || '',
      priority: followUp.priority,
      status: followUp.status,
      dueDate: parseISO(followUp.dueDate),
      assignedTo: followUp.assignedTo,
      relatedAppointmentId: followUp.relatedAppointmentId || '',
      reminderDate: followUp.reminderDate ? parseISO(followUp.reminderDate) : undefined,
      notes: followUp.notes || '',
    })
    setEditDialogOpen(true)
  }

  const handleOpenDeleteDialog = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp)
    setDeleteDialogOpen(true)
  }

  const handleCreateFollowUp = () => {
    if (!formData.patientId || !formData.title || !formData.dueDate || !formData.assignedTo) {
      alert('Por favor complete todos los campos obligatorios')
      return
    }

    const patient = mockPatients.find((p) => p.id === formData.patientId)
    const staff = mockStaff.find((s) => s.id === formData.assignedTo)

    const newFollowUp: FollowUp = {
      id: Date.now().toString(),
      patientId: formData.patientId,
      patientName: patient?.name || '',
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate.toISOString(),
      assignedTo: formData.assignedTo,
      assignedToName: staff?.name || '',
      relatedAppointmentId: formData.relatedAppointmentId || undefined,
      reminderDate: formData.reminderDate?.toISOString(),
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setFollowUps([newFollowUp, ...followUps])
    setCreateDialogOpen(false)
  }

  const handleUpdateFollowUp = () => {
    if (!selectedFollowUp || !formData.patientId || !formData.title || !formData.dueDate || !formData.assignedTo) {
      alert('Por favor complete todos los campos obligatorios')
      return
    }

    const patient = mockPatients.find((p) => p.id === formData.patientId)
    const staff = mockStaff.find((s) => s.id === formData.assignedTo)

    const updatedFollowUp: FollowUp = {
      ...selectedFollowUp,
      patientId: formData.patientId,
      patientName: patient?.name || '',
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate.toISOString(),
      assignedTo: formData.assignedTo,
      assignedToName: staff?.name || '',
      relatedAppointmentId: formData.relatedAppointmentId || undefined,
      reminderDate: formData.reminderDate?.toISOString(),
      notes: formData.notes,
      updatedAt: new Date().toISOString(),
      completedAt: formData.status === 'COMPLETED' ? new Date().toISOString() : undefined,
    }

    setFollowUps(followUps.map((fu) => (fu.id === selectedFollowUp.id ? updatedFollowUp : fu)))
    setEditDialogOpen(false)
  }

  const handleDeleteFollowUp = () => {
    if (!selectedFollowUp) return
    setFollowUps(followUps.filter((fu) => fu.id !== selectedFollowUp.id))
    setDeleteDialogOpen(false)
  }

  const handleMarkAsComplete = (followUp: FollowUp) => {
    const updated: FollowUp = {
      ...followUp,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setFollowUps(followUps.map((fu) => (fu.id === followUp.id ? updated : fu)))
  }

  // Render Priority Badge
  const renderPriorityBadge = (priority: Priority) => {
    const config = priorityConfig[priority]
    const Icon = config.icon
    return (
      <Badge className={cn('border', config.bgColor, config.color)}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  // Render Status Badge
  const renderStatusBadge = (status: Status) => {
    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Render Follow-up card for kanban view
  const renderFollowUpCard = (followUp: FollowUp) => {
    const overdue = isOverdue(followUp.dueDate, followUp.status)

    return (
      <Card
        key={followUp.id}
        className={cn(
          'mb-3 cursor-pointer hover:shadow-md transition-shadow',
          overdue && 'border-red-500 border-2'
        )}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1 truncate">{followUp.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{followUp.patientName}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {followUp.status !== 'COMPLETED' && followUp.status !== 'CANCELLED' && (
                    <DropdownMenuItem onClick={() => handleMarkAsComplete(followUp)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar Completado
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleOpenEditDialog(followUp)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleOpenDeleteDialog(followUp)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {followUp.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{followUp.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {renderPriorityBadge(followUp.priority)}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span className={cn(overdue && 'text-red-600 font-semibold')}>
                  {format(parseISO(followUp.dueDate), 'dd MMM', { locale: es })}
                  {overdue && ' (Vencido)'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">{followUp.assignedToName}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render Kanban column
  const renderKanbanColumn = (status: Status, title: string) => {
    const columnFollowUps = filteredFollowUps.filter((fu) => fu.status === status)

    return (
      <div className="flex-1 min-w-[300px]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{title}</span>
              <Badge variant="secondary">{columnFollowUps.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {columnFollowUps.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No hay tareas en esta columna
                </p>
              ) : (
                columnFollowUps.map(renderFollowUpCard)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seguimientos</h1>
          <p className="text-gray-600 mt-1">Gestiona las tareas de seguimiento de pacientes</p>
        </div>
        <Button onClick={handleOpenCreateDialog} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Seguimiento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completados Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Urgentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.urgent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold">Filtros</h2>
              </div>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-2" />
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="kanban">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Kanban
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por paciente o tarea..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>

              {/* Assigned To Filter */}
              <Select value={filterAssignedTo} onValueChange={setFilterAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Asignado a" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {mockStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setFilterStatus('all')
                setFilterPriority('all')
                setFilterAssignedTo('all')
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Area - List or Kanban View */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <Card>
          {filteredFollowUps.length === 0 ? (
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron seguimientos</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignedTo !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza agregando tu primer seguimiento'}
              </p>
              {!searchQuery && filterStatus === 'all' && filterPriority === 'all' && filterAssignedTo === 'all' && (
                <Button onClick={handleOpenCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Seguimiento
                </Button>
              )}
            </CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead>Asignado a</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFollowUps.map((followUp) => {
                  const overdue = isOverdue(followUp.dueDate, followUp.status)
                  return (
                    <TableRow key={followUp.id} className={cn(overdue && 'bg-red-50')}>
                      <TableCell>
                        <Checkbox
                          checked={followUp.status === 'COMPLETED'}
                          onCheckedChange={() =>
                            followUp.status !== 'COMPLETED' && handleMarkAsComplete(followUp)
                          }
                          disabled={followUp.status === 'COMPLETED' || followUp.status === 'CANCELLED'}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{followUp.patientName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{followUp.title}</p>
                          {followUp.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {followUp.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{renderPriorityBadge(followUp.priority)}</TableCell>
                      <TableCell>{renderStatusBadge(followUp.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className={cn(overdue && 'text-red-600 font-semibold')}>
                            {format(parseISO(followUp.dueDate), 'dd MMM yyyy', { locale: es })}
                          </span>
                          {overdue && (
                            <Badge variant="destructive" className="text-xs">
                              Vencido
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{followUp.assignedToName}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Acciones
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {followUp.status !== 'COMPLETED' && followUp.status !== 'CANCELLED' && (
                              <DropdownMenuItem onClick={() => handleMarkAsComplete(followUp)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Marcar Completado
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(followUp)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenDeleteDialog(followUp)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {renderKanbanColumn('PENDING', 'Pendiente')}
          {renderKanbanColumn('IN_PROGRESS', 'En Progreso')}
          {renderKanbanColumn('COMPLETED', 'Completado')}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open)
        setEditDialogOpen(open)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {createDialogOpen ? 'Nuevo Seguimiento' : 'Editar Seguimiento'}
            </DialogTitle>
            <DialogDescription>
              {createDialogOpen
                ? 'Crea una nueva tarea de seguimiento para un paciente'
                : 'Modifica los detalles del seguimiento'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Patient Selection */}
            <div className="grid gap-2">
              <Label htmlFor="patient">
                Paciente <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {mockPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Título de la tarea <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Revisión de ortodoncia"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Detalles adicionales sobre la tarea..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">
                  Prioridad <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Baja</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">
                  Estado <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Status })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                    <SelectItem value="COMPLETED">Completado</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="grid gap-2">
              <Label>
                Fecha de vencimiento <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !formData.dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, 'PPP', { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Assigned To */}
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">
                Asignado a <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar personal" />
                </SelectTrigger>
                <SelectContent>
                  {mockStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reminder Date */}
            <div className="grid gap-2">
              <Label>Fecha de recordatorio (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !formData.reminderDate && 'text-muted-foreground'
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formData.reminderDate ? (
                      format(formData.reminderDate, 'PPP', { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.reminderDate}
                    onSelect={(date) => setFormData({ ...formData, reminderDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Notas internas sobre la tarea..."
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                setEditDialogOpen(false)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={createDialogOpen ? handleCreateFollowUp : handleUpdateFollowUp}>
              {createDialogOpen ? 'Crear Seguimiento' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Seguimiento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este seguimiento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedFollowUp && (
            <div className="py-4">
              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-semibold">{selectedFollowUp.title}</p>
                <p className="text-sm text-muted-foreground">Paciente: {selectedFollowUp.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  Vencimiento: {format(parseISO(selectedFollowUp.dueDate), 'PPP', { locale: es })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteFollowUp}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
