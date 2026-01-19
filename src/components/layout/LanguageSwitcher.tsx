import { useTranslation } from '../../hooks/use-translation'
import { type Locale } from '../../i18n'

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  const toggleLocale = () => {
    const newLocale: Locale = locale === 'en' ? 'ru' : 'en'
    setLocale(newLocale)
  }

  return (
    <button
      onClick={toggleLocale}
      className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title={`Switch to ${locale === 'en' ? 'Русский' : 'English'}`}
    >
      {locale === 'en' ? '🇷🇺 RU' : '🇺🇸 EN'}
    </button>
  )
}
