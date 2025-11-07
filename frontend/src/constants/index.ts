// ============================================
// APPLICATION CONSTANTS
// ============================================

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Soldent'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ============================================
// AUTHENTICATION CONSTANTS
// ============================================

export const AUTH_TOKEN_KEY = 'soldent_auth_token'
export const REFRESH_TOKEN_KEY = 'soldent_refresh_token'
export const USER_KEY = 'soldent_user'

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  ME: '/api/v1/auth/me',

  // Users
  USERS: '/api/v1/users',
  USER_BY_ID: (id: string) => `/api/v1/users/${id}`,

  // Patients
  PATIENTS: '/api/v1/patients',
  PATIENT_BY_ID: (id: string) => `/api/v1/patients/${id}`,

  // Appointments
  APPOINTMENTS: '/api/v1/appointments',
  APPOINTMENT_BY_ID: (id: string) => `/api/v1/appointments/${id}`,

  // Medical Records
  MEDICAL_RECORDS: '/api/v1/medical-records',
  MEDICAL_RECORD_BY_ID: (id: string) => `/api/v1/medical-records/${id}`,

  // Invoices
  INVOICES: '/api/v1/invoices',
  INVOICE_BY_ID: (id: string) => `/api/v1/invoices/${id}`,

  // Payments
  PAYMENTS: '/api/v1/payments',
  PAYMENT_BY_ID: (id: string) => `/api/v1/payments/${id}`,

  // Follow-ups
  FOLLOWUPS: '/api/v1/follow-ups',
  FOLLOWUP_BY_ID: (id: string) => `/api/v1/follow-ups/${id}`,

  // Dashboard
  DASHBOARD_STATS: '/api/v1/dashboard/stats',
}

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PATIENTS: '/dashboard/patients',
  APPOINTMENTS: '/dashboard/appointments',
  MEDICAL_RECORDS: '/dashboard/medical',
  ACCOUNTING: '/dashboard/accounting',
  FOLLOWUPS: '/dashboard/followups',
} as const

// ============================================
// USER ROLES
// ============================================

export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  ASSISTANT: 'assistant',
} as const

// ============================================
// APPOINTMENT STATUS
// ============================================

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
}

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800',
}

// ============================================
// INVOICE STATUS
// ============================================

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PAID: 'paid',
  PARTIALLY_PAID: 'partially_paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  paid: 'Pagada',
  partially_paid: 'Parcialmente pagada',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
}

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  partially_paid: 'bg-blue-100 text-blue-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

// ============================================
// FOLLOW-UP STATUS
// ============================================

export const FOLLOWUP_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const FOLLOWUP_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export const FOLLOWUP_PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export const FOLLOWUP_PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

// ============================================
// PAGINATION
// ============================================

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// ============================================
// DATE FORMATS
// ============================================

export const DATE_FORMAT = 'yyyy-MM-dd'
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm'
export const TIME_FORMAT = 'HH:mm'

// ============================================
// VALIDATION
// ============================================

export const PASSWORD_MIN_LENGTH = 8
export const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const ECUADOR_PHONE_REGEX = /^(\+593|0)?[2-9]\d{8}$/
export const ECUADOR_CEDULA_REGEX = /^\d{10}$/

// ============================================
// PATIENT CONSTANTS (Ecuador)
// ============================================

export const IDENTIFICATION_TYPES = [
  { value: 'cedula', label: 'Cédula' },
  { value: 'passport', label: 'Pasaporte' },
  { value: 'ruc', label: 'RUC' },
] as const

export const ECUADOR_PROVINCES = [
  { value: 'azuay', label: 'Azuay' },
  { value: 'bolivar', label: 'Bolívar' },
  { value: 'canar', label: 'Cañar' },
  { value: 'carchi', label: 'Carchi' },
  { value: 'chimborazo', label: 'Chimborazo' },
  { value: 'cotopaxi', label: 'Cotopaxi' },
  { value: 'el_oro', label: 'El Oro' },
  { value: 'esmeraldas', label: 'Esmeraldas' },
  { value: 'galapagos', label: 'Galápagos' },
  { value: 'guayas', label: 'Guayas' },
  { value: 'imbabura', label: 'Imbabura' },
  { value: 'loja', label: 'Loja' },
  { value: 'los_rios', label: 'Los Ríos' },
  { value: 'manabi', label: 'Manabí' },
  { value: 'morona_santiago', label: 'Morona Santiago' },
  { value: 'napo', label: 'Napo' },
  { value: 'orellana', label: 'Orellana' },
  { value: 'pastaza', label: 'Pastaza' },
  { value: 'pichincha', label: 'Pichincha' },
  { value: 'santa_elena', label: 'Santa Elena' },
  { value: 'santo_domingo', label: 'Santo Domingo de los Tsáchilas' },
  { value: 'sucumbios', label: 'Sucumbíos' },
  { value: 'tungurahua', label: 'Tungurahua' },
  { value: 'zamora_chinchipe', label: 'Zamora Chinchipe' },
] as const

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
] as const

export const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Cónyuge' },
  { value: 'parent', label: 'Padre/Madre' },
  { value: 'child', label: 'Hijo/Hija' },
  { value: 'sibling', label: 'Hermano/Hermana' },
  { value: 'friend', label: 'Amigo/Amiga' },
  { value: 'other', label: 'Otro' },
] as const
