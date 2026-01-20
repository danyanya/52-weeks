import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { isEmailAllowed, isWhitelistEnabled, getWhitelistErrorMessage } from '../lib/email-whitelist'
import { startTokenRefreshMonitor, stopTokenRefreshMonitor } from '../lib/token-refresh'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  initialize: () => Promise<void>
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    set({ isLoading: true })

    const { data: { session } } = await supabase.auth.getSession()

    // Проверка whitelist для текущего пользователя
    const userEmail = session?.user?.email
    const isAllowed = !userEmail || isEmailAllowed(userEmail)

    // Если пользователь не в whitelist - выйти
    if (session?.user && !isAllowed) {
      console.warn(`Email ${userEmail} не находится в whitelist`)
      await supabase.auth.signOut()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
      return
    }

    set({
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
      isLoading: false
    })

    // Запускаем мониторинг автообновления токенов если пользователь залогинен
    if (session?.user) {
      startTokenRefreshMonitor()
    }

    // Подписка на изменения auth state с обработкой автообновления
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Логирование для отладки
      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token auto-refreshed successfully')
      } else if (event === 'SIGNED_OUT') {
        console.log('🔓 User signed out')
      } else if (event === 'SIGNED_IN') {
        console.log('🔐 User signed in')
      }

      const userEmail = session?.user?.email
      const isAllowed = !userEmail || isEmailAllowed(userEmail)

      // Проверка whitelist при изменении auth state
      if (session?.user && !isAllowed) {
        console.warn(`Email ${userEmail} не находится в whitelist`)
        await supabase.auth.signOut()
        set({
          user: null,
          isAuthenticated: false
        })
        return
      }

      set({
        user: session?.user ?? null,
        isAuthenticated: !!session?.user
      })

      // Управляем мониторингом токенов в зависимости от состояния сессии
      if (session?.user) {
        startTokenRefreshMonitor()
      } else {
        stopTokenRefreshMonitor()
      }
    })
  },

  signInWithOtp: async (email: string) => {
    // Проверка whitelist перед отправкой OTP
    if (isWhitelistEnabled() && !isEmailAllowed(email)) {
      console.warn(`Попытка входа с неразрешенного email: ${email}`)
      return {
        error: new Error(getWhitelistErrorMessage())
      }
    }

    // Отправляем OTP код (без emailRedirectTo)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    })

    return { error }
  },

  verifyOtp: async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })

    return { error }
  },

  signOut: async () => {
    // Останавливаем мониторинг токенов
    stopTokenRefreshMonitor()
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },
}))
