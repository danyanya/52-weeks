import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { isEmailAllowed, isWhitelistEnabled, getWhitelistErrorMessage } from '../lib/email-whitelist'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  initialize: () => Promise<void>
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>
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

    // Подписка на изменения auth state
    supabase.auth.onAuthStateChange(async (_event, session) => {
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
    })
  },

  signInWithEmail: async (email: string) => {
    // Проверка whitelist перед отправкой magic link
    if (isWhitelistEnabled() && !isEmailAllowed(email)) {
      console.warn(`Попытка входа с неразрешенного email: ${email}`)
      return {
        error: new Error(getWhitelistErrorMessage())
      }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    })

    return { error }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },
}))
