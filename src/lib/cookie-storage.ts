/**
 * Cookie Storage adapter for Supabase
 * Provides more secure storage than localStorage
 * With fallback to localStorage for iOS compatibility
 */

// Detect iOS devices
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

// On iOS, cookies can be problematic in some browsers (especially Chrome)
// So we fall back to localStorage
const useLocalStorageFallback = isIOS

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  secure: window.location.protocol === 'https:',
  // Cookies expire in 1 year (очень долго, полагаемся на refresh token)
  // Supabase будет автоматически обновлять токены до истечения
  maxAge: 60 * 60 * 24 * 365
}

function setCookie(name: string, value: string, options = COOKIE_OPTIONS) {
  const cookieString = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `path=${options.path}`,
    `max-age=${options.maxAge}`,
    `samesite=${options.sameSite}`,
    options.secure ? 'secure' : ''
  ]
    .filter(Boolean)
    .join('; ')

  document.cookie = cookieString
}

function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + '='
  const cookies = document.cookie.split(';')

  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }

  return null
}

function deleteCookie(name: string) {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0`
}

/**
 * Cookie storage adapter compatible with Supabase
 * Falls back to localStorage on iOS for better compatibility
 */
export const cookieStorage = {
  getItem: (key: string): string | null => {
    if (useLocalStorageFallback) {
      try {
        return localStorage.getItem(key)
      } catch (e) {
        console.warn('localStorage not available, falling back to cookie:', e)
        return getCookie(key)
      }
    }
    return getCookie(key)
  },

  setItem: (key: string, value: string): void => {
    if (useLocalStorageFallback) {
      try {
        localStorage.setItem(key, value)
        return
      } catch (e) {
        console.warn('localStorage not available, falling back to cookie:', e)
      }
    }
    setCookie(key, value)
  },

  removeItem: (key: string): void => {
    if (useLocalStorageFallback) {
      try {
        localStorage.removeItem(key)
        return
      } catch (e) {
        console.warn('localStorage not available, falling back to cookie:', e)
      }
    }
    deleteCookie(key)
  }
}
