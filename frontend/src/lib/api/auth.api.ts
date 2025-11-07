import { apiClient } from './client'
import { API_ENDPOINTS } from '@/constants'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User
} from '@/types'

/**
 * Authentication API functions
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials)
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.REGISTER, data)
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    return apiClient.post(API_ENDPOINTS.LOGOUT)
  },

  /**
   * Get current user
   */
  me: async (): Promise<User> => {
    return apiClient.get<User>(API_ENDPOINTS.ME)
  },

  /**
   * Refresh access token
   */
  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post(API_ENDPOINTS.REFRESH, { refreshToken })
  },
}
