/**
 * Утилиты для отладки сессии и токенов
 * Используйте в консоли браузера для диагностики проблем с авторизацией
 */

import { supabase, forceRefreshToken } from './supabase'
import { getSessionInfo } from './token-refresh'

/**
 * Показывает детальную информацию о текущей сессии
 * Использование в консоли: window.debugSession()
 */
export async function debugSession() {
  console.group('🔍 Session Debug Info')

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Error getting session:', error)
      console.groupEnd()
      return
    }

    if (!session) {
      console.log('⏸️  No active session')
      console.groupEnd()
      return
    }

    console.log('✅ Active session found')
    console.log('📧 User email:', session.user.email)
    console.log('🆔 User ID:', session.user.id)

    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000)
      const now = new Date()
      const timeLeft = expiresAt.getTime() - now.getTime()
      const minutesLeft = Math.floor(timeLeft / 1000 / 60)

      console.log('⏰ Token expires at:', expiresAt.toLocaleString())
      console.log('⏳ Time until expiry:', `${minutesLeft} minutes`)

      if (minutesLeft < 10) {
        console.warn('⚠️  Token expires soon!')
      } else {
        console.log('✅ Token is fresh')
      }
    }

    const info = await getSessionInfo()
    console.log('📊 Session info:', info)

    console.log('\n💡 Available commands:')
    console.log('  window.debugSession()     - Show this info')
    console.log('  window.refreshToken()     - Force refresh token')
    console.log('  window.checkSession()     - Quick session check')

  } catch (error) {
    console.error('❌ Error in debug session:', error)
  }

  console.groupEnd()
}

/**
 * Принудительно обновляет токен
 * Использование в консоли: window.refreshToken()
 */
export async function debugRefreshToken() {
  console.log('🔄 Force refreshing token...')
  const result = await forceRefreshToken()

  if (result.success) {
    console.log('✅ Token refreshed successfully')
    await debugSession()
  } else {
    console.error('❌ Failed to refresh token:', result.error)
  }

  return result
}

/**
 * Быстрая проверка статуса сессии
 * Использование в консоли: window.checkSession()
 */
export async function debugCheckSession() {
  const info = await getSessionInfo()

  if (!info.active) {
    console.log('❌ No active session')
    return info
  }

  const status = info.shouldRefresh ? '⚠️  Needs refresh' : '✅ Active'
  console.log(`${status} - Expires in ${info.expiresIn} minutes`)

  return info
}

// Экспортируем в window для доступа из консоли браузера
if (typeof window !== 'undefined') {
  (window as any).debugSession = debugSession;
  (window as any).refreshToken = debugRefreshToken;
  (window as any).checkSession = debugCheckSession
}
