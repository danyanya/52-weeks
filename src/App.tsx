import { useAuth } from './hooks/use-auth'
import { LoginPage } from './pages/LoginPage'
import { Header } from './components/layout/Header'
import { YearProgress } from './components/layout/YearProgress'
import { MainView } from './pages/MainView'
// Подключаем debug утилиты для доступа из консоли браузера
import './lib/debug-session'

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <Header />
      <YearProgress />
      <main
        className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl"
        style={{
          paddingLeft: 'max(env(safe-area-inset-left), 0.75rem)',
          paddingRight: 'max(env(safe-area-inset-right), 0.75rem)'
        }}
      >
        <MainView />
      </main>
    </div>
  )
}

export default App
