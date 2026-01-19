import { useState } from 'react'
import { parseContent, countStats } from '../../lib/text-parser'
import { LineRenderer } from './LineRenderer'
import { useDebouncedSave } from '../../hooks/use-debounced-save'
import { useTranslation } from '../../hooks/use-translation'

interface DayCardProps {
  day: {
    index: number
    dayOfMonth: string
    date: Date
  }
  content: string
  isToday: boolean
  onChange: (content: string) => void
}

export function DayCard({ day, content, isToday, onChange }: DayCardProps) {
  const { t, locale } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [localContent, setLocalContent] = useState(content)

  const debouncedSave = useDebouncedSave(async (newContent: string) => {
    onChange(newContent)
  }, 500)

  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent)
    debouncedSave(newContent)
  }

  // Get day name by index (0 = Monday, 6 = Sunday)
  const getDayName = (index: number): string => {
    const dayNames = [
      t.days.monday,
      t.days.tuesday,
      t.days.wednesday,
      t.days.thursday,
      t.days.friday,
      t.days.saturday,
      t.days.sunday
    ]
    return dayNames[index]
  }

  const stats = countStats(localContent)
  const lines = parseContent(localContent)

  return (
    <div
      className={`bg-white rounded-2xl border transition-all ${
        isToday ? 'border-blue-300 shadow-md' : 'border-gray-100 shadow-sm'
      }`}
    >
      {/* Header - клик для toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-3 sm:px-4 py-3 sm:py-3 min-h-[56px] flex items-center justify-between cursor-pointer rounded-t-2xl active:opacity-70 transition-opacity ${
          isToday ? 'bg-blue-50' : 'bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`text-xl sm:text-2xl font-light ${
              isToday ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {day.dayOfMonth}
          </span>
          <span
            className={`font-medium text-sm sm:text-base ${
              isToday ? 'text-blue-700' : 'text-gray-700'
            }`}
          >
            {getDayName(day.index)}
          </span>
          {isToday && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {t.day.today}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-gray-400">
            {stats.done}/{stats.total}
          </span>
          <span
            className={`transition-transform text-lg ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            ▾
          </span>
        </div>
      </div>

      {/* Content */}
      {isExpanded ? (
        <div className="p-3 sm:p-4">
          <textarea
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full min-h-[200px] text-sm sm:text-base font-mono bg-transparent resize-none focus:outline-none touch-manipulation"
            placeholder={t.day.placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      ) : (
        <div className="p-3 sm:p-4 text-sm">
          {lines.slice(0, 5).map((line, i) => (
            <LineRenderer key={i} line={line} />
          ))}
          {lines.length > 5 && (
            <div className="text-gray-400 text-xs mt-2">
              +{lines.length - 5} {locale === 'ru' ? 'ещё...' : 'more...'}
            </div>
          )}
          {lines.length === 0 && (
            <div className="text-gray-400 text-xs">{t.day.tasksCount_zero}</div>
          )}
        </div>
      )}
    </div>
  )
}
