/**
 * Rate limiting для OTP запросов
 * Предотвращает злоупотребление системой отправки кодов
 */

const STORAGE_KEY = 'otp_rate_limit'
const MAX_REQUESTS = 10 // Максимум запросов
const TIME_WINDOW = 10 * 60 * 1000 // 10 минут в миллисекундах
const COOLDOWN_TIME = 60 * 1000 // 1 минута между запросами

interface RateLimitEntry {
  email: string
  timestamp: number
}

/**
 * Получить историю запросов из localStorage
 */
function getRequestHistory(): RateLimitEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const history: RateLimitEntry[] = JSON.parse(stored)
    const now = Date.now()

    // Фильтруем только запросы за последние 10 минут
    return history.filter(entry => now - entry.timestamp < TIME_WINDOW)
  } catch (error) {
    console.error('Error reading rate limit history:', error)
    return []
  }
}

/**
 * Сохранить историю запросов
 */
function saveRequestHistory(history: RateLimitEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Error saving rate limit history:', error)
  }
}

/**
 * Проверить можно ли отправить запрос
 * @returns { allowed: boolean, reason?: string, retryAfter?: number }
 */
export function canSendOtpRequest(_email: string): {
  allowed: boolean
  reason?: 'cooldown' | 'rate_limit'
  retryAfter?: number // секунды до следующей попытки
  requestsLeft?: number
} {
  const history = getRequestHistory()
  const now = Date.now()

  // Проверка 1: Cooldown (1 минута с момента последнего запроса)
  const lastRequest = history[history.length - 1]
  if (lastRequest) {
    const timeSinceLastRequest = now - lastRequest.timestamp
    if (timeSinceLastRequest < COOLDOWN_TIME) {
      const retryAfter = Math.ceil((COOLDOWN_TIME - timeSinceLastRequest) / 1000)
      return {
        allowed: false,
        reason: 'cooldown',
        retryAfter
      }
    }
  }

  // Проверка 2: Rate limit (10 запросов за 10 минут)
  const recentRequests = history.filter(entry => now - entry.timestamp < TIME_WINDOW)

  if (recentRequests.length >= MAX_REQUESTS) {
    // Найти самый старый запрос для вычисления времени ожидания
    const oldestRequest = recentRequests[0]
    const timeUntilOldestExpires = TIME_WINDOW - (now - oldestRequest.timestamp)
    const retryAfter = Math.ceil(timeUntilOldestExpires / 1000)

    return {
      allowed: false,
      reason: 'rate_limit',
      retryAfter,
      requestsLeft: 0
    }
  }

  return {
    allowed: true,
    requestsLeft: MAX_REQUESTS - recentRequests.length
  }
}

/**
 * Записать успешный запрос OTP
 */
export function recordOtpRequest(email: string) {
  const history = getRequestHistory()
  history.push({
    email,
    timestamp: Date.now()
  })
  saveRequestHistory(history)
}

/**
 * Очистить историю запросов (для тестирования)
 */
export function clearRateLimitHistory() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Получить информацию о текущем состоянии лимитов
 */
export function getRateLimitInfo(): {
  requestsMade: number
  requestsLeft: number
  oldestRequestAge: number // миллисекунды
} {
  const history = getRequestHistory()
  const requestsMade = history.length
  const requestsLeft = Math.max(0, MAX_REQUESTS - requestsMade)

  let oldestRequestAge = 0
  if (history.length > 0) {
    oldestRequestAge = Date.now() - history[0].timestamp
  }

  return {
    requestsMade,
    requestsLeft,
    oldestRequestAge
  }
}
