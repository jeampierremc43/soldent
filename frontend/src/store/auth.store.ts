import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types'
import { saveTokens, saveUser, clearAuth, getUser } from '@/lib/auth'

/**
 * Authentication store using Zustand
 */

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User) => void
  setTokens: (tokens: AuthTokens) => void
  login: (user: User, tokens: AuthTokens) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Set user
      setUser: (user) => {
        saveUser(user)
        set({ user, isAuthenticated: true })
      },

      // Set tokens
      setTokens: (tokens) => {
        saveTokens(tokens)
      },

      // Login - save user and tokens
      login: (user, tokens) => {
        saveUser(user)
        saveTokens(tokens)
        set({ user, isAuthenticated: true })
      },

      // Logout - clear all auth data
      logout: () => {
        clearAuth()
        set({ user: null, isAuthenticated: false })
      },

      // Initialize - load user from localStorage
      initialize: () => {
        const user = getUser()
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
