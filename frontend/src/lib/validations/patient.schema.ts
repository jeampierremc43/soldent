import { z } from 'zod'
import { ECUADOR_PHONE_REGEX, ECUADOR_CEDULA_REGEX, EMAIL_REGEX } from '@/constants'

/**
 * Validates Ecuadorian cedula (10 digits with checksum)
 */
function validateEcuadorianCedula(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false

  const digits = cedula.split('').map(Number)
  const province = parseInt(cedula.substring(0, 2))

  // Province code must be between 01 and 24 (or 30 for consular)
  if (province < 1 || (province > 24 && province !== 30)) return false

  const thirdDigit = digits[2]
  if (thirdDigit > 6) return false

  // Validate checksum
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let sum = 0

  for (let i = 0; i < 9; i++) {
    let value = digits[i] * coefficients[i]
    if (value > 9) value -= 9
    sum += value
  }

  const checksum = (10 - (sum % 10)) % 10
  return checksum === digits[9]
}

/**
 * Patient form schema with Zod validation
 */
export const patientFormSchema = z.object({
  // Identification
  identificationType: z.enum(['cedula', 'passport', 'ruc'], {
    required_error: 'Debe seleccionar un tipo de identificación',
  }),
  identificationNumber: z
    .string()
    .min(1, 'El número de identificación es requerido')
    .refine(
      (val) => {
        // Add validation logic based on identification type if needed
        return val.length >= 5
      },
      { message: 'Número de identificación inválido' }
    ),

  // Personal Information
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  email: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        return EMAIL_REGEX.test(val)
      },
      { message: 'Email inválido' }
    ),
  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .refine((val) => ECUADOR_PHONE_REGEX.test(val), {
      message: 'Teléfono ecuatoriano inválido (ej: 0991234567 o +593991234567)',
    }),
  dateOfBirth: z.date({
    required_error: 'La fecha de nacimiento es requerida',
  }),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Debe seleccionar un género',
  }),

  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),

  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        return ECUADOR_PHONE_REGEX.test(val)
      },
      { message: 'Teléfono ecuatoriano inválido' }
    ),

  // Insurance
  hasInsurance: z.boolean().default(false),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
})
  .refine(
    (data) => {
      // If identification type is cedula, validate it
      if (data.identificationType === 'cedula') {
        return validateEcuadorianCedula(data.identificationNumber)
      }
      return true
    },
    {
      message: 'Cédula ecuatoriana inválida',
      path: ['identificationNumber'],
    }
  )
  .refine(
    (data) => {
      // If has insurance, provider is required
      if (data.hasInsurance && !data.insuranceProvider) {
        return false
      }
      return true
    },
    {
      message: 'El proveedor de seguro es requerido cuando tiene seguro',
      path: ['insuranceProvider'],
    }
  )
  .refine(
    (data) => {
      // If has emergency contact name, phone should be provided
      if (data.emergencyContactName && !data.emergencyContactPhone) {
        return false
      }
      return true
    },
    {
      message: 'El teléfono de contacto de emergencia es requerido',
      path: ['emergencyContactPhone'],
    }
  )

export type PatientFormValues = z.infer<typeof patientFormSchema>

/**
 * Search/filter schema
 */
export const patientFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  gender: z.enum(['all', 'male', 'female', 'other']).default('all'),
  hasInsurance: z.enum(['all', 'yes', 'no']).default('all'),
})

export type PatientFiltersValues = z.infer<typeof patientFiltersSchema>
