import { useEffect } from 'react'
import { useAuthStore } from '../store/auth-store'

export function useAuth() {
  const { user, isLoading, isAuthenticated, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    user,
    isLoading,
    isAuthenticated
  }
}
