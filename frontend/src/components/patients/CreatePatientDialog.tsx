'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PatientForm } from '@/components/forms/PatientForm'
import { usePatients } from '@/hooks/usePatients'
import type { PatientFormValues } from '@/lib/validations/patient.schema'

interface CreatePatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreatePatientDialog({ open, onOpenChange, onSuccess }: CreatePatientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createPatient } = usePatients()

  const handleSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await createPatient(data)
      if (result) {
        onOpenChange(false)
        onSuccess?.()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Paciente</DialogTitle>
          <DialogDescription>
            Ingrese la información del nuevo paciente. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <PatientForm onSubmit={handleSubmit} onCancel={handleCancel} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  )
}
