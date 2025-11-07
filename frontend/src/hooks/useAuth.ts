'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/lib/api/auth.api'
import type { LoginCredentials, RegisterData } from '@/types'
import { toast } from 'sonner'

/**
 * Custom hook for authentication operations
 * Provides login, register, logout, and session management
 */
export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, login: setAuth, logout: clearAuth, initialize } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Login user with credentials
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.login(credentials)

      if (response.user && response.tokens) {
        setAuth(response.user, response.tokens)
        toast.success('Inicio de sesión exitoso', {
          description: `Bienvenido, ${response.user.firstName}!`,
        })
        router.push('/dashboard')
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Error al iniciar sesión'
      setError(errorMessage)
      toast.error('Error de autenticación', {
        description: errorMessage,
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Register new user
   */
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.register(data)

      if (response.user && response.tokens) {
        setAuth(response.user, response.tokens)
        toast.success('Registro exitoso', {
          description: 'Tu cuenta ha sido creada correctamente',
        })
        router.push('/dashboard')
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Error al registrar usuario'
      setError(errorMessage)
      toast.error('Error de registro', {
        description: errorMessage,
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true)
      await authApi.logout()
      clearAuth()
      toast.success('Sesión cerrada', {
        description: 'Has cerrado sesión correctamente',
      })
      router.push('/login')
    } catch (err: any) {
      console.error('Logout error:', err)
      // Even if API call fails, clear local auth state
      clearAuth()
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Check authentication status
   */
  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const response = await authApi.getCurrentUser()

      if (response.user) {
        setAuth(response.user, response.tokens)
        return true
      }
      return false
    } catch (err) {
      clearAuth()
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    initialize,
  }
}
