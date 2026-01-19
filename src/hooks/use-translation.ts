import { useLocaleStore } from '../store/locale-store'
import { locales } from '../i18n'

/**
 * Hook для использования переводов
 */
export function useTranslation() {
  const { locale, setLocale } = useLocaleStore()
  const t = locales[locale]

  return {
    t,
    locale,
    setLocale,
  }
}

/**
 * Утилита для интерполяции переменных в строки
 * Пример: interpolate("Week {{number}}", { number: 5 }) => "Week 5"
 */
export function interpolate(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return vars[key]?.toString() || match
  })
}

/**
 * Утилита для плюрализации
 * Пример: pluralize(5, { one: "задача", other: "задачи" })
 */
export function pluralize(
  count: number,
  forms: { zero?: string; one?: string; other?: string }
): string {
  if (count === 0 && forms.zero) {
    return forms.zero
  }
  if (count === 1 && forms.one) {
    return forms.one
  }
  return forms.other || forms.one || ''
}
