import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth-store'
import { useTranslation } from '../hooks/use-translation'
import { interpolate } from '../hooks/use-translation'
import { Button } from '../components/ui/Button'
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher'
import { canSendOtpRequest, recordOtpRequest, getRateLimitInfo } from '../lib/rate-limit'

type AuthStep = 'email' | 'verify-otp'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [authStep, setAuthStep] = useState<AuthStep>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [requestsLeft, setRequestsLeft] = useState(10)
  const signInWithOtp = useAuthStore(state => state.signInWithOtp)
  const verifyOtp = useAuthStore(state => state.verifyOtp)
  const { t } = useTranslation()

  // Таймер cooldown
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownSeconds])

  // Обновить количество оставшихся запросов при монтировании
  useEffect(() => {
    const info = getRateLimitInfo()
    setRequestsLeft(info.requestsLeft)
  }, [])

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Проверка rate limit
    const rateLimitCheck = canSendOtpRequest(email)
    if (!rateLimitCheck.allowed) {
      setIsLoading(false)

      if (rateLimitCheck.reason === 'cooldown') {
        setError(interpolate(t.login.cooldownError, { seconds: rateLimitCheck.retryAfter || 60 }))
        setCooldownSeconds(rateLimitCheck.retryAfter || 60)
      } else if (rateLimitCheck.reason === 'rate_limit') {
        const minutes = Math.ceil((rateLimitCheck.retryAfter || 0) / 60)
        setError(interpolate(t.login.rateLimitError, { minutes }))
      }
      return
    }

    const { error: signInError } = await signInWithOtp(email)

    if (!signInError) {
      // Записать успешный запрос
      recordOtpRequest(email)

      // Обновить счетчики
      const info = getRateLimitInfo()
      setRequestsLeft(info.requestsLeft)
      setCooldownSeconds(60)

      setAuthStep('verify-otp')
    } else {
      console.error('Error signing in:', signInError)
      setError(signInError.message)
    }

    setIsLoading(false)
  }

  const handleResendCode = async () => {
    setError(null)
    setIsLoading(true)

    // Проверка rate limit
    const rateLimitCheck = canSendOtpRequest(email)
    if (!rateLimitCheck.allowed) {
      setIsLoading(false)

      if (rateLimitCheck.reason === 'cooldown') {
        setError(interpolate(t.login.cooldownError, { seconds: rateLimitCheck.retryAfter || 60 }))
        setCooldownSeconds(rateLimitCheck.retryAfter || 60)
      } else if (rateLimitCheck.reason === 'rate_limit') {
        const minutes = Math.ceil((rateLimitCheck.retryAfter || 0) / 60)
        setError(interpolate(t.login.rateLimitError, { minutes }))
      }
      return
    }

    const { error: signInError } = await signInWithOtp(email)

    if (!signInError) {
      recordOtpRequest(email)
      const info = getRateLimitInfo()
      setRequestsLeft(info.requestsLeft)
      setCooldownSeconds(60)
      setError(null)
    } else {
      console.error('Error resending code:', signInError)
      setError(signInError.message)
    }

    setIsLoading(false)
  }

  const handleIHaveCode = () => {
    setAuthStep('verify-otp')
    setError(null)
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
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1000 focus:border-transparent touch-manipulation"
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

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToEmail}
                className="flex-1"
              >
                {t.login.backButton}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={isLoading || cooldownSeconds > 0}
                className="flex-1"
              >
                {cooldownSeconds > 0
                  ? interpolate(t.login.resendCodeIn, { seconds: cooldownSeconds })
                  : t.login.resendCode}
              </Button>
            </div>

            {requestsLeft < 10 && requestsLeft > 0 && (
              <div className="text-xs text-center text-gray-500">
                {interpolate(t.login.requestsLeft, { count: requestsLeft })}
              </div>
            )}
          </form>
        </div>
      </div>
    )
  }

  // Экран ввода email
  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'max(env(safe-area-inset-left), 0.75rem)',
        paddingRight: 'max(env(safe-area-inset-right), 0.75rem)'
      }}
    >
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
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1000 focus:border-transparent touch-manipulation"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || cooldownSeconds > 0}
            className="w-full min-h-[48px]"
          >
            {isLoading ? t.common.loading : t.login.signInButton}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleIHaveCode}
            className="w-full"
          >
            {t.login.iHaveCode}
          </Button>

          {requestsLeft < 10 && requestsLeft > 0 && (
            <div className="text-xs text-center text-gray-500">
              {interpolate(t.login.requestsLeft, { count: requestsLeft })}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
