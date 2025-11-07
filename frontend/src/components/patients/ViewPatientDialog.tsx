'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import type { Patient } from '@/types'
import {
  IDENTIFICATION_TYPES,
  ECUADOR_PROVINCES,
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from '@/constants'

interface ViewPatientDialogProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewPatientDialog({ patient, open, onOpenChange }: ViewPatientDialogProps) {
  if (!patient) return null

  const getIdentificationTypeLabel = (value: string) => {
    return IDENTIFICATION_TYPES.find(t => t.value === value)?.label || value
  }

  const getGenderLabel = (value: string) => {
    return GENDER_OPTIONS.find(g => g.value === value)?.label || value
  }

  const getProvinceLabel = (value?: string) => {
    if (!value) return '-'
    return ECUADOR_PROVINCES.find(p => p.value === value)?.label || value
  }

  const getRelationshipLabel = (value?: string) => {
    if (!value) return '-'
    return RELATIONSHIP_OPTIONS.find(r => r.value === value)?.label || value
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {patient.firstName} {patient.lastName}
              </DialogTitle>
              <DialogDescription>
                {getIdentificationTypeLabel(patient.identificationType)}: {patient.identificationNumber}
              </DialogDescription>
            </div>
            <Badge variant={patient.isActive ? 'success' : 'destructive'}>
              {patient.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="medical">Historia Médica</TabsTrigger>
            <TabsTrigger value="appointments">Citas</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Datos Personales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nombres</Label>
                  <p className="font-medium">{patient.firstName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Apellidos</Label>
                  <p className="font-medium">{patient.lastName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de Nacimiento</Label>
                  <p className="font-medium">
                    {format(new Date(patient.dateOfBirth), 'dd/MM/yyyy')} ({calculateAge(patient.dateOfBirth)} años)
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Género</Label>
                  <p className="font-medium">{getGenderLabel(patient.gender)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{patient.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Teléfono</Label>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dirección</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Dirección</Label>
                  <p className="font-medium">{patient.address || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ciudad</Label>
                  <p className="font-medium">{patient.city || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Provincia</Label>
                  <p className="font-medium">{getProvinceLabel(patient.province)}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {patient.emergencyContact && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contacto de Emergencia</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nombre</Label>
                    <p className="font-medium">{patient.emergencyContact.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Relación</Label>
                    <p className="font-medium">
                      {getRelationshipLabel(patient.emergencyContact.relationship)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Teléfono</Label>
                    <p className="font-medium">{patient.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Seguro Médico</h3>
              {patient.insuranceInfo?.hasInsurance ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Proveedor</Label>
                    <p className="font-medium">{patient.insuranceInfo.provider || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Número de Póliza</Label>
                    <p className="font-medium">{patient.insuranceInfo.policyNumber || '-'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No tiene seguro médico</p>
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label className="text-muted-foreground">Fecha de Registro</Label>
                  <p>{format(new Date(patient.createdAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Última Actualización</Label>
                  <p>{format(new Date(patient.updatedAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              <p>La historia médica estará disponible próximamente</p>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              <p>Las citas del paciente estarán disponibles próximamente</p>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              <p>Los pagos del paciente estarán disponibles próximamente</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
