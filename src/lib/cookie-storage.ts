/**
 * Cookie Storage adapter for Supabase
 * Provides more secure storage than localStorage
 */

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  secure: window.location.protocol === 'https:',
  // Cookies expire in 7 days by default
  maxAge: 60 * 60 * 24 * 7
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
 */
export const cookieStorage = {
  getItem: (key: string): string | null => {
    return getCookie(key)
  },

  setItem: (key: string, value: string): void => {
    setCookie(key, value)
  },

  removeItem: (key: string): void => {
    deleteCookie(key)
  }
}
