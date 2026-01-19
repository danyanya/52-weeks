import { useState } from 'react'
import { useAuthStore } from '../store/auth-store'
import { useTranslation } from '../hooks/use-translation'
import { interpolate } from '../hooks/use-translation'
import { Button } from '../components/ui/Button'
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const signInWithEmail = useAuthStore(state => state.signInWithEmail)
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error: signInError } = await signInWithEmail(email)

    if (!signInError) {
      setIsSubmitted(true)
    } else {
      console.error('Error signing in:', signInError)
      setError(signInError.message)
    }

    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center relative">
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
            <LanguageSwitcher />
          </div>

          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {t.login.checkEmailTitle}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            {interpolate(t.login.checkEmailMessage, { email })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {t.login.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t.login.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t.login.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
              required
              autoComplete="email"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px]"
          >
            {isLoading ? t.common.loading : t.login.signInButton}
          </Button>
        </form>
      </div>
    </div>
  )
}
