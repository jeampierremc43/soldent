'use client'

import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  Printer,
  DollarSign,
  FileText,
  AlertCircle,
  TrendingUp,
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

import { CreateInvoiceDialog } from '@/components/accounting/CreateInvoiceDialog'
import { EditInvoiceDialog } from '@/components/accounting/EditInvoiceDialog'
import { ViewInvoiceDialog } from '@/components/accounting/ViewInvoiceDialog'
import { MarkAsPaidDialog } from '@/components/accounting/MarkAsPaidDialog'

import { formatCurrency } from '@/lib/utils'
import { InvoiceStatus } from '@/types'

// Mock data types
interface InvoiceListItem {
  id: string
  invoiceNumber: string
  patientId: string
  patientName: string
  date: string
  dueDate: string
  subtotal: number
  tax: number
  total: number
  status: InvoiceStatus
  amountPaid: number
}

// Mock data
const mockInvoices: InvoiceListItem[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    patientId: '1',
    patientName: 'María González',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    subtotal: 150.00,
    tax: 18.00,
    total: 168.00,
    status: InvoiceStatus.PAID,
    amountPaid: 168.00,
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    patientId: '2',
    patientName: 'Juan Pérez',
    date: '2024-01-20',
    dueDate: '2024-02-20',
    subtotal: 250.00,
    tax: 30.00,
    total: 280.00,
    status: InvoiceStatus.PENDING,
    amountPaid: 0,
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    patientId: '3',
    patientName: 'Ana Martínez',
    date: '2024-01-10',
    dueDate: '2024-01-25',
    subtotal: 180.00,
    tax: 21.60,
    total: 201.60,
    status: InvoiceStatus.OVERDUE,
    amountPaid: 0,
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    patientId: '4',
    patientName: 'Carlos Rodríguez',
    date: '2024-01-22',
    dueDate: '2024-02-22',
    subtotal: 300.00,
    tax: 36.00,
    total: 336.00,
    status: InvoiceStatus.PARTIALLY_PAID,
    amountPaid: 150.00,
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    patientId: '5',
    patientName: 'Laura Sánchez',
    date: '2024-01-25',
    dueDate: '2024-02-25',
    subtotal: 120.00,
    tax: 14.40,
    total: 134.40,
    status: InvoiceStatus.PENDING,
    amountPaid: 0,
  },
]

// Status configuration
const invoiceStatusConfig = {
  [InvoiceStatus.DRAFT]: {
    label: 'Borrador',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800',
  },
  [InvoiceStatus.PENDING]: {
    label: 'Pendiente',
    variant: 'default' as const,
    className: 'bg-yellow-100 text-yellow-800',
  },
  [InvoiceStatus.PAID]: {
    label: 'Pagada',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800',
  },
  [InvoiceStatus.PARTIALLY_PAID]: {
    label: 'Pago Parcial',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800',
  },
  [InvoiceStatus.OVERDUE]: {
    label: 'Vencida',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800',
  },
  [InvoiceStatus.CANCELLED]: {
    label: 'Cancelada',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800',
  },
}

export default function AccountingPage() {
  // State
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceListItem | null>(null)

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setInvoices(mockInvoices)
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = invoices

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.patientName.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter((inv) => inv.status === filterStatus)
    }

    return filtered
  }, [invoices, searchQuery, filterStatus])

  // Calculate statistics
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.date)
      return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear
    })

    const monthlyIncome = monthlyInvoices
      .filter((inv) => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + inv.total, 0)

    const pendingInvoices = invoices.filter(
      (inv) => inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.PARTIALLY_PAID
    )

    const overdueInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.OVERDUE)

    const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0)

    return {
      monthlyIncome,
      pendingCount: pendingInvoices.length,
      pendingAmount: pendingInvoices.reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0),
      overdueCount: overdueInvoices.length,
      overdueAmount: overdueInvoices.reduce((sum, inv) => sum + inv.total, 0),
      totalCollected,
    }
  }, [invoices])

  // Dialog handlers
  const handleView = (invoice: InvoiceListItem) => {
    setSelectedInvoice(invoice)
    setViewDialogOpen(true)
  }

  const handleEdit = (invoice: InvoiceListItem) => {
    setSelectedInvoice(invoice)
    setEditDialogOpen(true)
  }

  const handleMarkAsPaid = (invoice: InvoiceListItem) => {
    setSelectedInvoice(invoice)
    setMarkAsPaidDialogOpen(true)
  }

  const handlePrint = (invoice: InvoiceListItem) => {
    // Placeholder for print functionality
    console.log('Print invoice:', invoice.invoiceNumber)
    alert(`Función de impresión para ${invoice.invoiceNumber} - Por implementar`)
  }

  const handleExportPDF = (invoice: InvoiceListItem) => {
    // Placeholder for PDF export
    console.log('Export PDF:', invoice.invoiceNumber)
    alert(`Exportar PDF para ${invoice.invoiceNumber} - Por implementar`)
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setInvoices(mockInvoices)
      setLoading(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contabilidad y Facturación</h1>
          <p className="text-gray-600 mt-1">
            Gestiona facturas, pagos y reportes financieros
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => alert('Exportar reporte - Por implementar')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-36" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {/* Monthly Income */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Ingresos del Mes
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyIncome)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(), 'MMMM yyyy', { locale: es })}
                </p>
              </CardContent>
            </Card>

            {/* Pending Invoices */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Facturas Pendientes
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.pendingCount}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(stats.pendingAmount)} por cobrar
                </p>
              </CardContent>
            </Card>

            {/* Overdue Invoices */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Facturas Vencidas
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {stats.overdueCount}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(stats.overdueAmount)} vencido
                </p>
              </CardContent>
            </Card>

            {/* Total Collected */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Recaudado
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(stats.totalCollected)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total acumulado
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número de factura o paciente..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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
                <SelectItem value={InvoiceStatus.PENDING}>Pendiente</SelectItem>
                <SelectItem value={InvoiceStatus.PAID}>Pagada</SelectItem>
                <SelectItem value={InvoiceStatus.PARTIALLY_PAID}>Pago Parcial</SelectItem>
                <SelectItem value={InvoiceStatus.OVERDUE}>Vencida</SelectItem>
                <SelectItem value={InvoiceStatus.CANCELLED}>Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchInput || filterStatus !== 'all') && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput('')
                  setFilterStatus('all')
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        {loading ? (
          <div>
            {/* Table Header Skeleton */}
            <div className="border-b">
              <div className="grid grid-cols-7 gap-4 p-6">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="space-y-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b last:border-b-0">
                  <div className="grid grid-cols-7 gap-4 p-6 items-center">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24 justify-self-end" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron facturas
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primera factura'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Factura
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const statusConfig = invoiceStatusConfig[invoice.status]
                  const isPending = invoice.status === InvoiceStatus.PENDING ||
                                   invoice.status === InvoiceStatus.PARTIALLY_PAID ||
                                   invoice.status === InvoiceStatus.OVERDUE

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.patientName}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatCurrency(invoice.total)}
                          </div>
                          {invoice.amountPaid > 0 && invoice.amountPaid < invoice.total && (
                            <div className="text-xs text-gray-500">
                              Pagado: {formatCurrency(invoice.amountPaid)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => handleView(invoice)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrint(invoice)}>
                              <Printer className="h-4 w-4 mr-2" />
                              Imprimir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportPDF(invoice)}>
                              <Download className="h-4 w-4 mr-2" />
                              Exportar PDF
                            </DropdownMenuItem>
                            {isPending && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleMarkAsPaid(invoice)}
                                  className="text-green-600 focus:text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar como Pagada
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Results Summary */}
            <div className="px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {filteredInvoices.length} de {invoices.length} facturas
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Dialogs */}
      <CreateInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleRefresh}
      />

      <EditInvoiceDialog
        invoice={selectedInvoice}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
      />

      <ViewInvoiceDialog
        invoice={selectedInvoice}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <MarkAsPaidDialog
        invoice={selectedInvoice}
        open={markAsPaidDialogOpen}
        onOpenChange={setMarkAsPaidDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
