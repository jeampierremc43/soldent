// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  RECEPTIONIST = 'receptionist',
  ASSISTANT = 'assistant',
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

// ============================================
// PATIENT TYPES
// ============================================

export enum IdentificationType {
  CEDULA = 'cedula',
  PASSPORT = 'passport',
  RUC = 'ruc',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface Patient {
  id: string
  identificationType: IdentificationType
  identificationNumber: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  dateOfBirth: string
  gender: Gender
  address?: string
  city?: string
  province?: string
  emergencyContact?: EmergencyContact
  insuranceInfo?: InsuranceInfo
  medicalHistory?: string
  allergies?: string
  medications?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface InsuranceInfo {
  hasInsurance: boolean
  provider?: string
  policyNumber?: string
}

export interface PatientFormData {
  identificationType: IdentificationType
  identificationNumber: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  dateOfBirth: Date | string
  gender: Gender
  address?: string
  city?: string
  province?: string
  emergencyContactName?: string
  emergencyContactRelationship?: string
  emergencyContactPhone?: string
  hasInsurance: boolean
  insuranceProvider?: string
  insurancePolicyNumber?: string
}

export interface PatientFilters {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  gender?: 'all' | Gender
  hasInsurance?: 'all' | 'yes' | 'no'
}

// ============================================
// APPOINTMENT TYPES
// ============================================

export interface Appointment {
  id: string
  patientId: string
  patient?: Patient
  doctorId: string
  doctor?: User
  appointmentDate: string
  duration: number
  status: AppointmentStatus
  reason?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

// ============================================
// MEDICAL RECORD TYPES
// ============================================

export interface MedicalRecord {
  id: string
  patientId: string
  patient?: Patient
  appointmentId?: string
  appointment?: Appointment
  doctorId: string
  doctor?: User
  diagnosis: string
  treatment: string
  notes?: string
  prescriptions?: Prescription[]
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface Attachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  uploadedAt: string
}

// ============================================
// BILLING & PAYMENT TYPES
// ============================================

export interface Invoice {
  id: string
  patientId: string
  patient?: Patient
  appointmentId?: string
  appointment?: Appointment
  invoiceNumber: string
  date: string
  dueDate: string
  subtotal: number
  tax: number
  discount: number
  total: number
  status: InvoiceStatus
  items: InvoiceItem[]
  payments?: Payment[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: PaymentMethod
  transactionId?: string
  date: string
  notes?: string
  createdAt: string
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  INSURANCE = 'insurance',
}

// ============================================
// FOLLOW-UP TYPES
// ============================================

export interface FollowUp {
  id: string
  patientId: string
  patient?: Patient
  medicalRecordId?: string
  assignedTo: string
  assignedUser?: User
  dueDate: string
  priority: FollowUpPriority
  status: FollowUpStatus
  description: string
  notes?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export enum FollowUpPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum FollowUpStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ============================================
// DASHBOARD & STATISTICS TYPES
// ============================================

export interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingFollowUps: number
  monthlyRevenue: number
  revenueChange: number
  appointmentsChange: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

// ============================================
// FORM TYPES
// ============================================

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: { label: string; value: string }[]
}

export interface FormState {
  isSubmitting: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}
