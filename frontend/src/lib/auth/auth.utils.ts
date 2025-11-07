import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@/constants'
import type { User, AuthTokens } from '@/types'

/**
 * Authentication utility functions
 */

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  return !!token
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Save authentication tokens to localStorage
 */
export function saveTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

/**
 * Save user data to localStorage
 */
export function saveUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Get user data from localStorage
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null

  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

/**
 * Clear all authentication data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= exp
  } catch {
    return true
  }
}

/**
 * Decode JWT token
 */
export function decodeToken<T = any>(token: string): T | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload as T
  } catch {
    return null
  }
}

/**
 * Get user role from stored user data
 */
export function getUserRole(): string | null {
  const user = getUser()
  return user?.role || null
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const userRole = getUserRole()
  return userRole === role
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: string[]): boolean {
  const userRole = getUserRole()
  return userRole ? roles.includes(userRole) : false
}
