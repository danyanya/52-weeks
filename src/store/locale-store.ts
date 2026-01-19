import { create } from 'zustand'
import { type Locale, locales, getInitialLocale, saveLocale } from '../i18n'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: getInitialLocale(),

  setLocale: (locale: Locale) => {
    saveLocale(locale)
    set({ locale })
  },
}))

/**
 * Получить текущие переводы
 */
export function getCurrentTranslations() {
  return locales[useLocaleStore.getState().locale]
}
