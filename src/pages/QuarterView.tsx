import { getWeeksInQuarter, getQuarterName, formatQuarterRange, formatWeekRange, getCurrentWeek } from '../lib/date-utils'
import { useTranslation } from '../hooks/use-translation'

interface QuarterViewProps {
  year: number
  quarter: number
  onWeekClick: (weekNumber: number) => void
}

export function QuarterView({ year, quarter, onWeekClick }: QuarterViewProps) {
  const { t } = useTranslation()
  const weeks = getWeeksInQuarter(year, quarter)
  const currentWeek = getCurrentWeek()
  const isCurrentWeek = (weekNumber: number) =>
    year === currentWeek.year && weekNumber === currentWeek.weekNumber

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
          {getQuarterName(quarter)} {year}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{formatQuarterRange(year, quarter)}</p>
      </div>

      {/* Weeks Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {weeks.map((weekNumber) => {
          const isCurrent = isCurrentWeek(weekNumber)

          return (
            <button
              key={weekNumber}
              onClick={() => onWeekClick(weekNumber)}
              className={`rounded-xl border p-3 sm:p-4 text-left transition-all active:scale-[0.98] min-h-[80px] ${
                isCurrent
                  ? 'bg-blue-50 border-blue-300 shadow-md'
                  : 'bg-white border-gray-200 active:border-blue-200 sm:hover:border-blue-200 sm:hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span
                  className={`text-xl sm:text-2xl font-bold ${
                    isCurrent ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {weekNumber}
                </span>
                {isCurrent && (
                  <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-600 px-1.5 sm:px-2 py-0.5 rounded-full">
                    {t.day.today}
                  </span>
                )}
              </div>

              <p className="text-[10px] sm:text-xs text-gray-600">
                {formatWeekRange(year, weekNumber)}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
