import { useAuthStore } from '../../store/auth-store'
import { useTranslation } from '../../hooks/use-translation'
import { Button } from '../ui/Button'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Header() {
  const { user, signOut } = useAuthStore()
  const { t } = useTranslation()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{t.header.title}</h1>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          {user && (
            <>
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                {t.auth.signOut}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
