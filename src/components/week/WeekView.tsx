import { useState, useEffect } from 'react'
import { useWeek } from '../../hooks/use-week'
import { getWeekDates, formatWeekRange, getCurrentWeek, getPreviousWeek, getNextWeek } from '../../lib/date-utils'
import { DayCard } from './DayCard'
import { WeekFocus } from './WeekFocus'
import { WeekExportImport } from './WeekExportImport'
import { Button } from '../ui/Button'
import { isToday } from 'date-fns'
import { useTranslation } from '../../hooks/use-translation'
import { interpolate } from '../../hooks/use-translation'

interface WeekViewProps {
  initialYear?: number
  initialWeekNumber?: number
}

export function WeekView({ initialYear, initialWeekNumber }: WeekViewProps = {}) {
  const { t } = useTranslation()
  const currentWeek = getCurrentWeek()
  const [selectedWeek, setSelectedWeek] = useState({
    year: initialYear || currentWeek.year,
    weekNumber: initialWeekNumber || currentWeek.weekNumber
  })

  // Update selected week when props change
  useEffect(() => {
    if (initialYear && initialWeekNumber) {
      setSelectedWeek({ year: initialYear, weekNumber: initialWeekNumber })
    }
  }, [initialYear, initialWeekNumber])

  const { week, isLoading, error, updateDay, updateFocus } = useWeek(selectedWeek.year, selectedWeek.weekNumber)

  const handlePreviousWeek = () => {
    setSelectedWeek(getPreviousWeek(selectedWeek.year, selectedWeek.weekNumber))
  }

  const handleNextWeek = () => {
    setSelectedWeek(getNextWeek(selectedWeek.year, selectedWeek.weekNumber))
  }

  const handleToday = () => {
    setSelectedWeek(getCurrentWeek())
  }

  const handleImport = async (data: {
    focusText: string
    days: Array<{ dayIndex: number; content: string }>
  }) => {
    // Обновляем фокус недели
    if (data.focusText) {
      await updateFocus(data.focusText)
    }

    // Обновляем дни
    for (const day of data.days) {
      await updateDay(day.dayIndex, day.content)
    }
  }

  const isCurrentWeek = selectedWeek.year === currentWeek.year && selectedWeek.weekNumber === currentWeek.weekNumber

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">{t.common.loading}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 font-semibold mb-2">{t.common.error}</div>
          <div className="text-gray-600 text-sm">{error}</div>
          <div className="mt-4 text-xs text-gray-500">
            {t.week.openConsole}
          </div>
        </div>
      </div>
    )
  }

  if (!week) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 mb-2">{t.week.notFound}</div>
          <div className="text-xs text-gray-400">
            {t.week.openConsole}
          </div>
        </div>
      </div>
    )
  }

  const weekDates = getWeekDates(selectedWeek.year, selectedWeek.weekNumber)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Week Navigation */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={handlePreviousWeek} className="min-w-[44px]">
            <span className="hidden sm:inline">{t.week.previous}</span>
            <span className="sm:hidden">←</span>
          </Button>

          <div className="text-center flex-1">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
              {interpolate(t.week.title, { number: selectedWeek.weekNumber })}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              {formatWeekRange(selectedWeek.year, selectedWeek.weekNumber)}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={handleNextWeek} className="min-w-[44px]">
              <span className="hidden sm:inline">{t.week.next}</span>
              <span className="sm:hidden">→</span>
            </Button>

            {/* Export/Import buttons */}
            <WeekExportImport
              week={{
                year: selectedWeek.year,
                week_number: selectedWeek.weekNumber,
                focus_text: week?.focus_text || '',
                days: week?.days || []
              }}
              onImport={handleImport}
            />
          </div>
        </div>

        {/* Today button - full width on mobile */}
        {!isCurrentWeek && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToday}
            className="w-full sm:w-auto sm:mx-auto"
          >
            {t.week.currentWeek}
          </Button>
        )}
      </div>

      {/* Week Focus */}
      <WeekFocus
        focusText={week?.focus_text || ''}
        onChange={updateFocus}
      />

      {/* Days Grid */}
      <div className="grid grid-cols-1 gap-4">
        {weekDates.days.map((dayInfo) => {
          const dayData = week.days.find((d) => d.day_index === dayInfo.index)
          const content = dayData?.content || ''

          return (
            <DayCard
              key={dayInfo.index}
              day={dayInfo}
              content={content}
              isToday={isToday(dayInfo.date)}
              onChange={(newContent) => updateDay(dayInfo.index, newContent)}
            />
          )
        })}
      </div>
    </div>
  )
}
