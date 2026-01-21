import { getCurrentWeek, getAllWeeksInYear } from '../../lib/date-utils'
import { useTranslation } from '../../hooks/use-translation'

export function YearProgress() {
  const { year, weekNumber } = getCurrentWeek()
  const totalWeeks = getAllWeeksInYear(year).length
  const { t } = useTranslation()

  return (
    <div className="bg-white border-b border-gray-200 py-2 sm:py-4">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="text-xs sm:text-sm font-medium text-gray-700">
            {t.yearProgress.week} {weekNumber} {t.yearProgress.of} {totalWeeks}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500">
            {Math.round((weekNumber / totalWeeks) * 100)}% {t.yearProgress.yearComplete}
          </div>
        </div>

        <div className="grid gap-0.5 sm:gap-1" style={{
          gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))`
        }}>
          {Array.from({ length: totalWeeks }, (_, i) => {
            const week = i + 1
            const isPast = week < weekNumber
            const isCurrent = week === weekNumber

            return (
              <div
                key={week}
                className={`aspect-square rounded-[2px] sm:rounded-sm transition-colors ${
                  isCurrent
                    ? 'bg-gray-1000'
                    : isPast
                    ? 'bg-gray-300'
                    : 'bg-gray-100'
                }`}
                title={`${t.yearProgress.week} ${week}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
