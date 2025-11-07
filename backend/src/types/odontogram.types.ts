import { z } from 'zod';
import { DentitionType, ToothStatus } from '@prisma/client';

/**
 * ============================================
 * ODONTOGRAM VALIDATION
 * ============================================
 */

/**
 * Superficies dentales válidas
 */
export enum DentalSurface {
  OCLUSAL = 'O',    // Superficie de masticación
  MESIAL = 'M',     // Hacia el centro
  DISTAL = 'D',     // Alejándose del centro
  VESTIBULAR = 'V', // Hacia mejillas/labios
  LINGUAL = 'L',    // Hacia la lengua
  PALATINA = 'P',   // Paladar (solo superiores)
}

/**
 * Números FDI válidos para dientes permanentes (adultos)
 * Cuadrante 1 (superior derecho): 11-18
 * Cuadrante 2 (superior izquierdo): 21-28
 * Cuadrante 3 (inferior izquierdo): 31-38
 * Cuadrante 4 (inferior derecho): 41-48
 */
const permanentTeethNumbers = [
  // Cuadrante 1
  '11', '12', '13', '14', '15', '16', '17', '18',
  // Cuadrante 2
  '21', '22', '23', '24', '25', '26', '27', '28',
  // Cuadrante 3
  '31', '32', '33', '34', '35', '36', '37', '38',
  // Cuadrante 4
  '41', '42', '43', '44', '45', '46', '47', '48',
];

/**
 * Números FDI válidos para dientes temporales (niños)
 * Cuadrante 5 (superior derecho): 51-55
 * Cuadrante 6 (superior izquierdo): 61-65
 * Cuadrante 7 (inferior izquierdo): 71-75
 * Cuadrante 8 (inferior derecho): 81-85
 */
const temporaryTeethNumbers = [
  // Cuadrante 5
  '51', '52', '53', '54', '55',
  // Cuadrante 6
  '61', '62', '63', '64', '65',
  // Cuadrante 7
  '71', '72', '73', '74', '75',
  // Cuadrante 8
  '81', '82', '83', '84', '85',
];

/**
 * Validar número de diente FDI
 */
export const toothNumberSchema = z.string()
  .refine(
    (num) => permanentTeethNumbers.includes(num) || temporaryTeethNumbers.includes(num),
    'Invalid FDI tooth number'
  );

/**
 * Validar número de diente permanente
 */
export const permanentToothNumberSchema = z.string()
  .refine(
    (num) => permanentTeethNumbers.includes(num),
    'Invalid permanent tooth number. Expected 11-48'
  );

/**
 * Validar número de diente temporal
 */
export const temporaryToothNumberSchema = z.string()
  .refine(
    (num) => temporaryTeethNumbers.includes(num),
    'Invalid temporary tooth number. Expected 51-85'
  );

/**
 * Validar superficie dental
 */
export const dentalSurfaceSchema = z.nativeEnum(DentalSurface);

/**
 * Estado de una superficie dental
 */
export const surfaceConditionSchema = z.object({
  status: z.nativeEnum(ToothStatus),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

/**
 * Superficies del diente (JSON)
 */
export const toothSurfacesSchema = z.object({
  O: surfaceConditionSchema.optional(), // Oclusal
  M: surfaceConditionSchema.optional(), // Mesial
  D: surfaceConditionSchema.optional(), // Distal
  V: surfaceConditionSchema.optional(), // Vestibular
  L: surfaceConditionSchema.optional(), // Lingual
  P: surfaceConditionSchema.optional(), // Palatina
}).optional();

/**
 * ============================================
 * TOOTH SCHEMAS
 * ============================================
 */

/**
 * Schema para crear un diente
 */
export const createToothSchema = z.object({
  toothNumber: toothNumberSchema,
  status: z.nativeEnum(ToothStatus).default(ToothStatus.HEALTHY),
  surfaces: toothSurfacesSchema,
  notes: z.string().optional(),
});

/**
 * Schema para actualizar un diente
 */
export const updateToothSchema = z.object({
  status: z.nativeEnum(ToothStatus).optional(),
  surfaces: toothSurfacesSchema,
  notes: z.string().optional(),
});

/**
 * ============================================
 * ODONTOGRAM SCHEMAS
 * ============================================
 */

/**
 * Schema para crear odontograma
 */
export const createOdontogramSchema = z.object({
  type: z.nativeEnum(DentitionType),
  generalNotes: z.string().optional(),
  teeth: z.array(createToothSchema).optional(),
}).refine(
  (data) => {
    // Si se proporcionan dientes, validar que coincidan con el tipo
    if (data.teeth && data.teeth.length > 0) {
      const isValid = data.teeth.every((tooth) => {
        if (data.type === DentitionType.PERMANENT) {
          return permanentTeethNumbers.includes(tooth.toothNumber);
        } else if (data.type === DentitionType.TEMPORARY) {
          return temporaryTeethNumbers.includes(tooth.toothNumber);
        }
        return true; // MIXED permite ambos
      });
      return isValid;
    }
    return true;
  },
  {
    message: 'Tooth numbers must match dentition type',
  }
);

/**
 * Schema para actualizar odontograma
 */
export const updateOdontogramSchema = z.object({
  generalNotes: z.string().optional(),
  isCurrent: z.boolean().optional(),
});

/**
 * Schema para actualizar un diente específico
 */
export const updateToothInOdontogramSchema = z.object({
  toothNumber: toothNumberSchema,
  data: updateToothSchema,
});

/**
 * Schema para filtros de consulta
 */
export const odontogramQuerySchema = z.object({
  isCurrent: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  version: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional(),
});

/**
 * Schema para comparar versiones
 */
export const compareVersionsSchema = z.object({
  v1: z.string().uuid(),
  v2: z.string().uuid(),
});

/**
 * ============================================
 * DTO TYPES
 * ============================================
 */

export type CreateToothDTO = z.infer<typeof createToothSchema>;
export type UpdateToothDTO = z.infer<typeof updateToothSchema>;
export type CreateOdontogramDTO = z.infer<typeof createOdontogramSchema>;
export type UpdateOdontogramDTO = z.infer<typeof updateOdontogramSchema>;
export type UpdateToothInOdontogramDTO = z.infer<typeof updateToothInOdontogramSchema>;
export type OdontogramQueryDTO = z.infer<typeof odontogramQuerySchema>;
export type CompareVersionsDTO = z.infer<typeof compareVersionsSchema>;

/**
 * ============================================
 * RESPONSE TYPES
 * ============================================
 */

/**
 * Tooth surface condition response
 */
export interface SurfaceConditionResponse {
  status: ToothStatus;
  date?: string;
  notes?: string;
}

/**
 * Tooth surfaces response
 */
export interface ToothSurfacesResponse {
  O?: SurfaceConditionResponse; // Oclusal
  M?: SurfaceConditionResponse; // Mesial
  D?: SurfaceConditionResponse; // Distal
  V?: SurfaceConditionResponse; // Vestibular
  L?: SurfaceConditionResponse; // Lingual
  P?: SurfaceConditionResponse; // Palatina
}

/**
 * Tooth response
 */
export interface ToothResponse {
  id: string;
  odontogramId: string;
  toothNumber: string;
  status: ToothStatus;
  surfaces?: ToothSurfacesResponse;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Odontogram response (básico, sin dientes)
 */
export interface OdontogramResponse {
  id: string;
  patientId: string;
  date: string;
  version: number;
  type: DentitionType;
  generalNotes?: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Odontogram response con dientes
 */
export interface OdontogramWithTeethResponse extends OdontogramResponse {
  teeth: ToothResponse[];
}

/**
 * Tooth change para comparación de versiones
 */
export interface ToothChange {
  toothNumber: string;
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Comparison result entre dos odontogramas
 */
export interface OdontogramComparisonResponse {
  version1: OdontogramResponse;
  version2: OdontogramResponse;
  changes: ToothChange[];
  summary: {
    totalChanges: number;
    teethModified: number;
    statusChanges: number;
    surfaceChanges: number;
  };
}

/**
 * ============================================
 * UTILITY TYPES
 * ============================================
 */

/**
 * Validar si un número de diente es permanente
 */
export const isPermanentTooth = (toothNumber: string): boolean => {
  return permanentTeethNumbers.includes(toothNumber);
};

/**
 * Validar si un número de diente es temporal
 */
export const isTemporaryTooth = (toothNumber: string): boolean => {
  return temporaryTeethNumbers.includes(toothNumber);
};

/**
 * Obtener todos los números de dientes según tipo
 */
export const getAllToothNumbers = (type: DentitionType): string[] => {
  switch (type) {
    case DentitionType.PERMANENT:
      return [...permanentTeethNumbers];
    case DentitionType.TEMPORARY:
      return [...temporaryTeethNumbers];
    case DentitionType.MIXED:
      return [...permanentTeethNumbers, ...temporaryTeethNumbers];
    default:
      return [];
  }
};

/**
 * Validar que los números de dientes coincidan con el tipo
 */
export const validateToothNumbersForType = (
  toothNumbers: string[],
  type: DentitionType
): boolean => {
  return toothNumbers.every((num) => {
    if (type === DentitionType.PERMANENT) {
      return isPermanentTooth(num);
    } else if (type === DentitionType.TEMPORARY) {
      return isTemporaryTooth(num);
    }
    // MIXED permite ambos
    return isPermanentTooth(num) || isTemporaryTooth(num);
  });
};

export default {};
