'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { usePatients } from '@/hooks/usePatients'
import type { Patient } from '@/types'

interface DeletePatientDialogProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeletePatientDialog({
  patient,
  open,
  onOpenChange,
  onSuccess,
}: DeletePatientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deletePatient } = usePatients()

  const handleDelete = async () => {
    if (!patient) return

    setIsDeleting(true)
    try {
      const success = await deletePatient(patient.id)
      if (success) {
        onOpenChange(false)
        onSuccess?.()
      }
    } finally {
      setIsDeleting(false)
    }
  }

  if (!patient) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta acción eliminará permanentemente al paciente{' '}
              <span className="font-semibold">
                {patient.firstName} {patient.lastName}
              </span>
              .
            </p>
            <p className="text-destructive font-medium">
              Esta acción no se puede deshacer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
