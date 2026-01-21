import { useState } from 'react'
import { YearView } from './YearView'
import { QuarterView } from './QuarterView'
import { WeekView } from '../components/week/WeekView'
import { getCurrentWeek, getQuarterFromWeek } from '../lib/date-utils'
import { useTranslation } from '../hooks/use-translation'
import { interpolate } from '../hooks/use-translation'
import { Button } from '../components/ui/Button'

type ViewType = 'year' | 'quarter' | 'week'

interface ViewState {
  type: ViewType
  year: number
  quarter?: number
  weekNumber?: number
}

export function MainView() {
  const currentWeek = getCurrentWeek()
  const { t } = useTranslation()
  const [viewState, setViewState] = useState<ViewState>({
    type: 'week',
    year: currentWeek.year,
    weekNumber: currentWeek.weekNumber,
    quarter: getQuarterFromWeek(currentWeek.weekNumber)
  })

  const handleYearChange = (year: number) => {
    setViewState({ type: 'year', year })
  }

  const handleQuarterClick = (quarter: number) => {
    setViewState({ type: 'quarter', year: viewState.year, quarter })
  }

  const handleWeekClick = (weekNumber: number) => {
    const quarter = viewState.quarter || getQuarterFromWeek(weekNumber)
    setViewState({ type: 'week', year: viewState.year, weekNumber, quarter })
  }

  // Breadcrumb navigation
  const renderBreadcrumbs = () => {
    if (viewState.type === 'year') {
      return null
    }

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <button
          onClick={() => setViewState({ type: 'year', year: viewState.year })}
          className="hover:text-gray-700 transition-colors"
        >
          {viewState.year}
        </button>

        {(viewState.type === 'quarter' || viewState.type === 'week') && (
          <>
            <span>/</span>
            {viewState.quarter && (
              viewState.type === 'week' ? (
                <button
                  onClick={() => {
                    const quarter = viewState.quarter || getQuarterFromWeek(viewState.weekNumber || 1)
                    setViewState({ type: 'quarter', year: viewState.year, quarter })
                  }}
                  className="hover:text-gray-700 transition-colors"
                >
                  Q{viewState.quarter}
                </button>
              ) : (
                <span className="text-gray-900 font-medium">Q{viewState.quarter}</span>
              )
            )}
          </>
        )}

        {viewState.type === 'week' && viewState.weekNumber && (
          <>
            <span>/</span>
            <span className="text-gray-900 font-medium">{interpolate(t.week.title, { number: viewState.weekNumber })}</span>
          </>
        )}
      </div>
    )
  }

  // View toggle buttons
  const renderViewToggle = () => {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={viewState.type === 'year' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setViewState({ type: 'year', year: viewState.year })}
        >
          {t.nav.year}
        </Button>
        <Button
          variant={viewState.type === 'quarter' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => {
            const quarter = viewState.quarter || getQuarterFromWeek(viewState.weekNumber || 1)
            setViewState({ type: 'quarter', year: viewState.year, quarter })
          }}
        >
          {t.nav.quarter}
        </Button>
        <Button
          variant={viewState.type === 'week' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => {
            const weekNumber = viewState.weekNumber || currentWeek.weekNumber
            const quarter = viewState.quarter || getQuarterFromWeek(weekNumber)
            setViewState({ type: 'week', year: viewState.year, weekNumber, quarter })
          }}
        >
          {t.nav.week}
        </Button>
      </div>
    )
  }

  return (
    <div>
      {renderViewToggle()}
      {renderBreadcrumbs()}

      {viewState.type === 'year' && (
        <YearView
          year={viewState.year}
          onQuarterClick={handleQuarterClick}
          onYearChange={handleYearChange}
        />
      )}

      {viewState.type === 'quarter' && viewState.quarter && (
        <QuarterView
          year={viewState.year}
          quarter={viewState.quarter}
          onWeekClick={handleWeekClick}
        />
      )}

      {viewState.type === 'week' && viewState.weekNumber && (
        <WeekView
          initialYear={viewState.year}
          initialWeekNumber={viewState.weekNumber}
        />
      )}
    </div>
  )
}
