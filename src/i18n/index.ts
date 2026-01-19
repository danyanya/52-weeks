import { en } from './locales/en'
import { ru } from './locales/ru'

export type Locale = 'en' | 'ru'

export const locales = {
  en,
  ru,
}

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
}

/**
 * Определить язык из настроек браузера
 */
export function detectBrowserLocale(): Locale {
  const browserLang = navigator.language.toLowerCase()

  // Проверяем полное совпадение (ru-RU -> ru)
  const lang = browserLang.split('-')[0]

  if (lang === 'ru') {
    return 'ru'
  }

  // По умолчанию английский
  return 'en'
}

/**
 * Получить сохраненный язык из localStorage или определить из браузера
 */
export function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem('locale') as Locale
    if (saved && (saved === 'en' || saved === 'ru')) {
      return saved
    }
  } catch (error) {
    console.warn('Failed to read locale from localStorage:', error)
  }

  return detectBrowserLocale()
}

/**
 * Сохранить выбранный язык в localStorage
 */
export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem('locale', locale)
  } catch (error) {
    console.warn('Failed to save locale to localStorage:', error)
  }
}
