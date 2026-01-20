/**
 * Автоматическое обновление токенов
 * Проверяет истечение токена и обновляет его заранее
 */

import { supabase, forceRefreshToken } from './supabase'

// Интервал проверки токена (каждые 5 минут)
const CHECK_INTERVAL = 5 * 60 * 1000

// Обновлять токен если осталось меньше 10 минут
const REFRESH_THRESHOLD = 10 * 60 * 1000

let intervalId: number | null = null

/**
 * Проверяет нужно ли обновить токен
 */
async function checkAndRefreshToken() {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      console.log('⏸️  No active session, skipping token refresh')
      return
    }

    // Проверяем время истечения токена
    const expiresAt = session.expires_at
    if (!expiresAt) {
      console.warn('⚠️  Session has no expiration time')
      return
    }

    const expiresAtMs = expiresAt * 1000
    const now = Date.now()
    const timeUntilExpiry = expiresAtMs - now

    if (timeUntilExpiry < REFRESH_THRESHOLD) {
      console.log(`🔄 Token expires in ${Math.floor(timeUntilExpiry / 1000 / 60)} minutes, refreshing...`)
      const result = await forceRefreshToken()

      if (result.success) {
        console.log('✅ Token refreshed proactively')
      } else {
        console.error('❌ Failed to refresh token proactively')
      }
    } else {
      console.log(`✓ Token valid for ${Math.floor(timeUntilExpiry / 1000 / 60)} minutes`)
    }
  } catch (error) {
    console.error('❌ Error in token refresh check:', error)
  }
}

/**
 * Запускает автоматическую проверку токена
 */
export function startTokenRefreshMonitor() {
  // Останавливаем предыдущий интервал если есть
  if (intervalId !== null) {
    window.clearInterval(intervalId)
  }

  console.log('🔄 Starting token refresh monitor (checking every 5 minutes)')

  // Первая проверка сразу
  checkAndRefreshToken()

  // Периодическая проверка
  intervalId = window.setInterval(checkAndRefreshToken, CHECK_INTERVAL)
}

/**
 * Останавливает автоматическую проверку токена
 */
export function stopTokenRefreshMonitor() {
  if (intervalId !== null) {
    window.clearInterval(intervalId)
    intervalId = null
    console.log('⏹️  Token refresh monitor stopped')
  }
}

/**
 * Получает информацию о текущей сессии
 */
export async function getSessionInfo() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { active: false }
  }

  const expiresAt = session.expires_at
  if (!expiresAt) {
    return { active: true, expiresIn: 'unknown' }
  }

  const expiresAtMs = expiresAt * 1000
  const now = Date.now()
  const timeUntilExpiry = expiresAtMs - now

  return {
    active: true,
    expiresIn: Math.floor(timeUntilExpiry / 1000 / 60), // minutes
    expiresAt: new Date(expiresAtMs).toISOString(),
    shouldRefresh: timeUntilExpiry < REFRESH_THRESHOLD
  }
}
