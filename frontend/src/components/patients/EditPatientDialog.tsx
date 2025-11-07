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
import type { Patient } from '@/types'
import type { PatientFormValues } from '@/lib/validations/patient.schema'

interface EditPatientDialogProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditPatientDialog({ patient, open, onOpenChange, onSuccess }: EditPatientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updatePatient } = usePatients()

  const handleSubmit = async (data: PatientFormValues) => {
    if (!patient) return

    setIsSubmitting(true)
    try {
      const result = await updatePatient(patient.id, data)
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

  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
          <DialogDescription>
            Modifique la información del paciente. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <PatientForm
          patient={patient}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
