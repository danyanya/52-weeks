import { useState } from 'react'
import { useAuthStore } from '../store/auth-store'
import { useTranslation } from '../hooks/use-translation'
import { interpolate } from '../hooks/use-translation'
import { Button } from '../components/ui/Button'
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher'

type AuthStep = 'email' | 'verify-otp'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [authStep, setAuthStep] = useState<AuthStep>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const signInWithOtp = useAuthStore(state => state.signInWithOtp)
  const verifyOtp = useAuthStore(state => state.verifyOtp)
  const { t } = useTranslation()

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error: signInError } = await signInWithOtp(email)

    if (!signInError) {
      setAuthStep('verify-otp')
    } else {
      console.error('Error signing in:', signInError)
      setError(signInError.message)
    }

    setIsLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error: verifyError } = await verifyOtp(email, otp)

    if (verifyError) {
      console.error('Error verifying OTP:', verifyError)
      // Определяем тип ошибки для более понятных сообщений
      if (verifyError.message.includes('expired')) {
        setError(t.login.expiredCode)
      } else {
        setError(t.login.wrongCode)
      }
    }
    // Если ошибки нет, auth state обновится автоматически через onAuthStateChange

    setIsLoading(false)
  }

  const handleBackToEmail = () => {
    setAuthStep('email')
    setOtp('')
    setError(null)
  }

  // Экран ввода OTP кода
  if (authStep === 'verify-otp') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
            <LanguageSwitcher />
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {t.login.checkEmailOtpTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {interpolate(t.login.checkEmailOtpMessage, { email })}
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                {t.login.otpLabel}
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t.login.otpPlaceholder}
                required
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                autoFocus
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full min-h-[48px]"
            >
              {isLoading ? t.common.loading : t.login.verifyButton}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBackToEmail}
              className="w-full"
            >
              {t.login.backButton}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Экран ввода email
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

        <form onSubmit={handleSubmitEmail} className="space-y-4">
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
