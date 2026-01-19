/**
 * Email whitelist utilities
 * Проверяет разрешен ли доступ для определенного email
 */

/**
 * Получить список разрешенных email из переменных окружения
 */
function getAllowedEmails(): string[] {
  const allowedEmailsEnv = import.meta.env.VITE_ALLOWED_EMAILS

  if (!allowedEmailsEnv || allowedEmailsEnv.trim() === '') {
    return []
  }

  return allowedEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0)
}

/**
 * Проверить включен ли whitelist
 */
export function isWhitelistEnabled(): boolean {
  return getAllowedEmails().length > 0
}

/**
 * Проверить разрешен ли email
 */
export function isEmailAllowed(email: string): boolean {
  // Если whitelist не настроен - доступ открыт для всех
  if (!isWhitelistEnabled()) {
    return true
  }

  const allowedEmails = getAllowedEmails()
  const normalizedEmail = email.trim().toLowerCase()

  return allowedEmails.includes(normalizedEmail)
}

/**
 * Получить сообщение об ошибке для неразрешенного email
 */
export function getWhitelistErrorMessage(): string {
  return 'Доступ ограничен. Ваш email не находится в списке разрешенных. Обратитесь к администратору для получения доступа.'
}
