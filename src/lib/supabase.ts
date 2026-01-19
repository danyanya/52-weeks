import { createClient } from '@supabase/supabase-js'
import { cookieStorage } from './cookie-storage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Использовать cookies вместо localStorage для лучшей безопасности
    storage: cookieStorage,
    // Автоматически обновлять токены
    autoRefreshToken: true,
    // Сохранять сессию между перезагрузками
    persistSession: true,
    // Обнаруживать токены в URL (для magic links)
    detectSessionInUrl: true,
    // Использовать PKCE flow для дополнительной безопасности
    flowType: 'pkce'
  }
})
