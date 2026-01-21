import { Button } from '../components/ui/Button'
import { getQuarterName, formatQuarterRange, getAllWeeksInYear } from '../lib/date-utils'
import { useTranslation } from '../hooks/use-translation'
import { interpolate } from '../hooks/use-translation'

interface YearViewProps {
  year: number
  onQuarterClick: (quarter: number) => void
  onYearChange: (year: number) => void
}

export function YearView({ year, onQuarterClick, onYearChange }: YearViewProps) {
  const { t } = useTranslation()
  const quarters = [1, 2, 3, 4]
  const currentYear = new Date().getFullYear()
  const isCurrentYear = year === currentYear
  const totalWeeks = getAllWeeksInYear(year).length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Year Navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => onYearChange(year - 1)} className="min-w-[44px]">
          <span className="hidden sm:inline">{interpolate(t.year.previousYear, { year: year - 1 })}</span>
          <span className="sm:hidden">← {year - 1}</span>
        </Button>

        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{year}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{totalWeeks} {t.year.weeks}</p>
        </div>

        <Button variant="ghost" size="sm" onClick={() => onYearChange(year + 1)} className="min-w-[44px]">
          <span className="hidden sm:inline">{interpolate(t.year.nextYear, { year: year + 1 })}</span>
          <span className="sm:hidden">{year + 1} →</span>
        </Button>
      </div>

      {/* Quarters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {quarters.map((quarter) => (
          <button
            key={quarter}
            onClick={() => onQuarterClick(quarter)}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm active:scale-[0.98] active:shadow-none sm:hover:shadow-md transition-all p-4 sm:p-6 text-left group min-h-[120px]"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {getQuarterName(quarter)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                  {interpolate(t.quarter.weeks, { start: (quarter - 1) * 13 + 1, end: quarter * 13 })}
                </p>
              </div>
              <span className="text-2xl sm:text-3xl">{getQuarterEmoji(quarter)}</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600">
              {formatQuarterRange(year, quarter)}
            </p>

            <div className="mt-3 sm:mt-4 text-xs text-gray-700 font-medium opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {t.quarter.openQuarter}
            </div>
          </button>
        ))}
      </div>

      {!isCurrentYear && (
        <div className="text-center">
          <Button variant="secondary" size="sm" onClick={() => onYearChange(currentYear)} className="w-full sm:w-auto">
            {t.year.currentYear} ({currentYear})
          </Button>
        </div>
      )}
    </div>
  )
}

function getQuarterEmoji(quarter: number): string {
  const emojis = ['❄️', '🌸', '☀️', '🍂']
  return emojis[quarter - 1]
}
