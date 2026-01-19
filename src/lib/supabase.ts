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
  }
})
