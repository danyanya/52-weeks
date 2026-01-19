import { useState, useEffect } from 'react'
import { useDebouncedSave } from '../../hooks/use-debounced-save'
import { useTranslation } from '../../hooks/use-translation'
import { interpolate, pluralize } from '../../hooks/use-translation'

interface WeekFocusProps {
  focusText: string
  onChange: (text: string) => void
}

export function WeekFocus({ focusText, onChange }: WeekFocusProps) {
  const { t } = useTranslation()
  const [localText, setLocalText] = useState(focusText)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    setLocalText(focusText)
  }, [focusText])

  const debouncedSave = useDebouncedSave(async (newText: string) => {
    onChange(newText)
  }, 500)

  const handleChange = (newText: string) => {
    setLocalText(newText)
    debouncedSave(newText)
  }

  const lineCount = localText.trim() ? localText.split('\n').filter(l => l.trim()).length : 0

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 sm:px-5 py-3 sm:py-4 min-h-[56px] flex items-center justify-between cursor-pointer active:opacity-70 transition-opacity"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">🎯</span>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">{t.weekFocus.title}</h3>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
              {lineCount === 0
                ? ''
                : interpolate(
                    pluralize(lineCount, {
                      zero: '',
                      one: t.weekFocus.tasksCount_one,
                      other: t.weekFocus.tasksCount_other
                    }),
                    { count: lineCount }
                  )
              }
            </p>
          </div>
        </div>
        <span className={`transition-transform text-blue-600 text-lg ${isExpanded ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </div>

      {isExpanded && (
        <div className="px-3 sm:px-5 pb-3 sm:pb-4">
          <textarea
            value={localText}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full min-h-[120px] px-3 py-2 text-sm sm:text-base font-mono bg-white border border-blue-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 touch-manipulation"
            placeholder={t.weekFocus.placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      )}
    </div>
  )
}
