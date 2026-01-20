import { createClient } from '@supabase/supabase-js'
import { cookieStorage } from './cookie-storage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Использовать cookies вместо localStorage для лучшей безопасности
    // С fallback на localStorage для iOS compatibility
    storage: cookieStorage,
    // Автоматически обновлять токены
    autoRefreshToken: true,
    // Сохранять сессию между перезагрузками
    persistSession: true,
    // Обнаруживать токены в URL (для OTP)
    detectSessionInUrl: true,
    // Использовать PKCE flow для максимальной безопасности
    // PKCE защищает от перехвата токенов и CSRF атак
    flowType: 'pkce',
    // Дополнительная опция для storage recovery
    storageKey: 'sb-auth-token'
  },
  // Глобальные настройки для автоматических retry
  global: {
    headers: {
      'X-Client-Info': '52-weeks-app'
    }
  }
})

/**
 * Принудительное обновление токена
 * Используйте если подозреваете что токен протух
 */
export async function forceRefreshToken() {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('❌ Failed to refresh token:', error.message)
      return { success: false, error }
    }
    console.log('✅ Token manually refreshed')
    return { success: true, session: data.session }
  } catch (error) {
    console.error('❌ Error refreshing token:', error)
    return { success: false, error }
  }
}
