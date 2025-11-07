'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Plus,
  Search,
  FileText,
  Calendar,
  User,
  Pill,
  Stethoscope,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { CreateMedicalRecordDialog } from '@/components/medical/CreateMedicalRecordDialog'
import { ViewMedicalRecordDialog } from '@/components/medical/ViewMedicalRecordDialog'
import { EditMedicalRecordDialog } from '@/components/medical/EditMedicalRecordDialog'

// Types
interface Patient {
  id: string
  firstName: string
  lastName: string
  identificationNumber: string
}

interface MedicalRecord {
  id: string
  patient: Patient
  patientId: string
  visitDate: string
  chiefComplaint: string
  diagnosis: string
  treatment: string
  prescriptions: Prescription[]
  notes: string
  nextAppointmentDate?: string
  createdAt: string
  updatedAt: string
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

interface ToothCondition {
  status: 'healthy' | 'caries' | 'filled' | 'missing' | 'crown' | 'root_canal' | 'extraction_needed'
  notes?: string
}

// Mock data
const mockPatients: Patient[] = [
  { id: '1', firstName: 'Juan', lastName: 'Pérez', identificationNumber: '0987654321' },
  { id: '2', firstName: 'María', lastName: 'González', identificationNumber: '0912345678' },
  { id: '3', firstName: 'Carlos', lastName: 'Rodríguez', identificationNumber: '0945678901' },
]

const mockRecords: MedicalRecord[] = [
  {
    id: '1',
    patient: mockPatients[0],
    patientId: '1',
    visitDate: '2024-03-15T10:00:00',
    chiefComplaint: 'Dolor en muela superior derecha',
    diagnosis: 'Caries dental profunda en pieza 16',
    treatment: 'Tratamiento de conducto iniciado',
    prescriptions: [
      {
        id: '1',
        medication: 'Amoxicilina',
        dosage: '500mg',
        frequency: 'Cada 8 horas',
        duration: '7 días',
        instructions: 'Tomar con alimentos',
      },
      {
        id: '2',
        medication: 'Ibuprofeno',
        dosage: '400mg',
        frequency: 'Cada 6 horas',
        duration: '5 días',
        instructions: 'Tomar solo si hay dolor',
      },
    ],
    notes: 'Paciente presenta sensibilidad extrema. Requiere segunda sesión.',
    nextAppointmentDate: '2024-03-22T10:00:00',
    createdAt: '2024-03-15T10:00:00',
    updatedAt: '2024-03-15T10:00:00',
  },
  {
    id: '2',
    patient: mockPatients[1],
    patientId: '2',
    visitDate: '2024-03-14T14:30:00',
    chiefComplaint: 'Limpieza dental de rutina',
    diagnosis: 'Gingivitis leve, placa bacteriana',
    treatment: 'Profilaxis dental completa, aplicación de flúor',
    prescriptions: [],
    notes: 'Se recomienda mejorar técnica de cepillado',
    createdAt: '2024-03-14T14:30:00',
    updatedAt: '2024-03-14T14:30:00',
  },
]

// Tooth status colors
const toothStatusConfig = {
  healthy: { color: 'bg-green-100 border-green-500', label: 'Sano', icon: '✓' },
  caries: { color: 'bg-red-100 border-red-500', label: 'Caries', icon: '●' },
  filled: { color: 'bg-blue-100 border-blue-500', label: 'Obturado', icon: '■' },
  missing: { color: 'bg-gray-200 border-gray-400', label: 'Ausente', icon: '✕' },
  crown: { color: 'bg-yellow-100 border-yellow-500', label: 'Corona', icon: '◆' },
  root_canal: { color: 'bg-purple-100 border-purple-500', label: 'Endodoncia', icon: '▼' },
  extraction_needed: { color: 'bg-orange-100 border-orange-500', label: 'A extraer', icon: '!' },
}

export default function MedicalRecordsPage() {
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<MedicalRecord[]>(mockRecords)
  const [selectedTab, setSelectedTab] = useState('records')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate] = useState('all')
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())

  // Odontogram state (adult dentition - 32 teeth)
  const [odontogramData, setOdontogramData] = useState<Record<string, ToothCondition>>({})
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)

  // Filter records
  const filteredRecords = useMemo(() => {
    let filtered = records

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.patient.firstName.toLowerCase().includes(query) ||
          record.patient.lastName.toLowerCase().includes(query) ||
          record.patient.identificationNumber.includes(query) ||
          record.chiefComplaint.toLowerCase().includes(query) ||
          record.diagnosis.toLowerCase().includes(query)
      )
    }

    if (filterDate !== 'all') {
      const now = new Date()
      const dateThreshold = new Date()

      switch (filterDate) {
        case 'today':
          dateThreshold.setHours(0, 0, 0, 0)
          filtered = filtered.filter((r) => new Date(r.visitDate) >= dateThreshold)
          break
        case 'week':
          dateThreshold.setDate(dateThreshold.getDate() - 7)
          filtered = filtered.filter((r) => new Date(r.visitDate) >= dateThreshold)
          break
        case 'month':
          dateThreshold.setMonth(dateThreshold.getMonth() - 1)
          filtered = filtered.filter((r) => new Date(r.visitDate) >= dateThreshold)
          break
      }
    }

    return filtered.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
  }, [records, searchQuery, filterDate])

  const toggleRecordExpansion = (recordId: string) => {
    const newExpanded = new Set(expandedRecords)
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId)
    } else {
      newExpanded.add(recordId)
    }
    setExpandedRecords(newExpanded)
  }

  const handleView = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setViewDialogOpen(true)
  }

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setEditDialogOpen(true)
  }

  const handleDelete = (record: MedicalRecord) => {
    if (confirm(`¿Está seguro de eliminar el registro de ${record.patient.firstName} ${record.patient.lastName}?`)) {
      setRecords(records.filter((r) => r.id !== record.id))
    }
  }

  const handleToothClick = (toothNumber: string) => {
    setSelectedTooth(toothNumber)
  }

  const handleToothStatusChange = (status: ToothCondition['status']) => {
    if (selectedTooth) {
      setOdontogramData({
        ...odontogramData,
        [selectedTooth]: { status },
      })
    }
  }

  // Odontogram component
  const Odontogram = () => {
    // Adult dentition FDI notation: 11-18, 21-28, 31-38, 41-48
    const quadrants = [
      { name: 'Superior Derecho', teeth: ['18', '17', '16', '15', '14', '13', '12', '11'] },
      { name: 'Superior Izquierdo', teeth: ['21', '22', '23', '24', '25', '26', '27', '28'] },
      { name: 'Inferior Izquierdo', teeth: ['31', '32', '33', '34', '35', '36', '37', '38'] },
      { name: 'Inferior Derecho', teeth: ['48', '47', '46', '45', '44', '43', '42', '41'] },
    ]

    const renderTooth = (toothNumber: string) => {
      const condition = odontogramData[toothNumber] || { status: 'healthy' }
      const config = toothStatusConfig[condition.status]
      const isSelected = selectedTooth === toothNumber

      return (
        <div
          key={toothNumber}
          onClick={() => handleToothClick(toothNumber)}
          className={`
            relative cursor-pointer transition-all duration-200
            w-12 h-16 rounded-md border-2 flex flex-col items-center justify-center
            hover:scale-110 hover:shadow-lg
            ${config.color}
            ${isSelected ? 'ring-4 ring-blue-500 scale-110' : ''}
          `}
        >
          <span className="text-xs font-semibold text-gray-700">{toothNumber}</span>
          {condition.status !== 'healthy' && (
            <span className="text-2xl font-bold text-gray-700">{config.icon}</span>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Upper teeth */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-8">
            {/* Upper right */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">
                {quadrants[0].name}
              </h4>
              <div className="flex justify-center gap-1">
                {quadrants[0].teeth.map(renderTooth)}
              </div>
            </div>
            {/* Upper left */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">
                {quadrants[1].name}
              </h4>
              <div className="flex justify-center gap-1">
                {quadrants[1].teeth.map(renderTooth)}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300" />

        {/* Lower teeth */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-8">
            {/* Lower left */}
            <div>
              <div className="flex justify-center gap-1">
                {quadrants[2].teeth.map(renderTooth)}
              </div>
              <h4 className="text-sm font-medium text-gray-700 mt-2 text-center">
                {quadrants[2].name}
              </h4>
            </div>
            {/* Lower right */}
            <div>
              <div className="flex justify-center gap-1">
                {quadrants[3].teeth.map(renderTooth)}
              </div>
              <h4 className="text-sm font-medium text-gray-700 mt-2 text-center">
                {quadrants[3].name}
              </h4>
            </div>
          </div>
        </div>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Leyenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(toothStatusConfig).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded border-2 flex items-center justify-center ${config.color}`}>
                    <span className="text-sm font-bold">{config.icon}</span>
                  </div>
                  <span className="text-sm text-gray-700">{config.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tooth status selector */}
        {selectedTooth && (
          <Card className="border-blue-500">
            <CardHeader>
              <CardTitle className="text-sm">
                Pieza Dental {selectedTooth}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(toothStatusConfig).map(([status, config]) => (
                  <Button
                    key={status}
                    variant={odontogramData[selectedTooth]?.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToothStatusChange(status as ToothCondition['status'])}
                    className="text-xs"
                  >
                    <span className="mr-1">{config.icon}</span>
                    {config.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registros Médicos</h1>
          <p className="text-gray-600 mt-1">
            Historiales médicos, odontogramas y diagnósticos
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="records">
            <FileText className="h-4 w-4 mr-2" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="odontogram">
            <Stethoscope className="h-4 w-4 mr-2" />
            Odontograma
          </TabsTrigger>
        </TabsList>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold">Filtros</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por paciente, cédula o diagnóstico..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Registros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{records.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Este Mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {records.filter((r) => {
                    const date = new Date(r.visitDate)
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  }).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Con Prescripciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {records.filter((r) => r.prescriptions.length > 0).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Citas de Seguimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {records.filter((r) => r.nextAppointmentDate).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Records Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No se encontraron registros
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || filterDate !== 'all'
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Comienza agregando tu primer registro médico'}
                  </p>
                  {!searchQuery && filterDate === 'all' && (
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Registro
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Motivo de Consulta</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead>Prescripciones</TableHead>
                      <TableHead>Seguimiento</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <>
                        <TableRow key={record.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                {format(new Date(record.visitDate), "d MMM yyyy", { locale: es })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium text-sm">
                                  {record.patient.firstName} {record.patient.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {record.patient.identificationNumber}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm truncate">{record.chiefComplaint}</p>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm truncate">{record.diagnosis}</p>
                          </TableCell>
                          <TableCell>
                            {record.prescriptions.length > 0 ? (
                              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                <Pill className="h-3 w-3" />
                                {record.prescriptions.length}
                              </Badge>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.nextAppointmentDate ? (
                              <Badge variant="outline">
                                {format(new Date(record.nextAppointmentDate), "d MMM", { locale: es })}
                              </Badge>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRecordExpansion(record.id)}
                              >
                                {expandedRecords.has(record.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    Acciones
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleView(record)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(record)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(record)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedRecords.has(record.id) && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50">
                              <div className="p-4 space-y-4">
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Tratamiento Realizado</h4>
                                  <p className="text-sm text-gray-700">{record.treatment}</p>
                                </div>
                                {record.prescriptions.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Prescripciones</h4>
                                    <div className="space-y-2">
                                      {record.prescriptions.map((prescription) => (
                                        <div key={prescription.id} className="bg-white p-3 rounded border">
                                          <p className="font-medium text-sm">{prescription.medication}</p>
                                          <p className="text-xs text-gray-600">
                                            {prescription.dosage} - {prescription.frequency} por {prescription.duration}
                                          </p>
                                          {prescription.instructions && (
                                            <p className="text-xs text-gray-500 mt-1 italic">
                                              {prescription.instructions}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {record.notes && (
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Notas Adicionales</h4>
                                    <p className="text-sm text-gray-700">{record.notes}</p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Odontogram Tab */}
        <TabsContent value="odontogram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Odontograma Dental Interactivo</CardTitle>
              <p className="text-sm text-muted-foreground">
                Haga clic en cualquier pieza dental para registrar su estado
              </p>
            </CardHeader>
            <CardContent>
              <Odontogram />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateMedicalRecordDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          // Refresh records
          setCreateDialogOpen(false)
        }}
      />

      <ViewMedicalRecordDialog
        record={selectedRecord}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <EditMedicalRecordDialog
        record={selectedRecord}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          // Refresh records
          setEditDialogOpen(false)
        }}
      />
    </div>
  )
}
