import { useRef } from 'react'
import { Button } from '../ui/Button'
import { exportWeekToText, importWeekFromText, downloadTextFile } from '../../lib/week-export'
import { useTranslation, interpolate } from '../../hooks/use-translation'

interface WeekExportImportProps {
  week: {
    year: number
    week_number: number
    focus_text: string
    days: Array<{ day_index: number; content: string }>
  }
  onImport: (data: {
    focusText: string
    days: Array<{ dayIndex: number; content: string }>
  }) => void
}

export function WeekExportImport({ week, onImport }: WeekExportImportProps) {
  const { t, locale } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const text = exportWeekToText(week, locale)
    const filename = `week-${week.year}-${String(week.week_number).padStart(2, '0')}.txt`
    downloadTextFile(text, filename)
  }

  const handleImportFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleTextImport = async () => {
    const text = prompt(t.week.importTextPrompt)
    if (!text) return

    await processImport(text)
  }

  const processImport = async (text: string) => {
    try {
      const parsed = importWeekFromText(text)

      if (!parsed) {
        alert(t.week.importParseError)
        return
      }

      // Подтверждение импорта
      const focusMessage = parsed.focusText ? t.week.importConfirmFocus : ''
      const confirmMessage = interpolate(t.week.importConfirm, {
        days: parsed.days.length,
        focus: focusMessage
      })

      if (!confirm(confirmMessage)) {
        return
      }

      await onImport(parsed)
      alert(t.week.importSuccess)

      // Обновляем страницу для отображения импортированных данных
      window.location.reload()
    } catch (error) {
      console.error('Import error:', error)
      alert(t.week.importError)
      // Сбросить input для возможности повторного выбора того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    await processImport(text)
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleExport}
        title={t.week.exportTooltip}
        className="gap-1 px-2 min-w-[36px]"
      >
        <span className="text-base">📤</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleImportFileClick}
        title={t.week.importFileTooltip}
        className="gap-1 px-2 min-w-[36px]"
      >
        <span className="text-base">📥</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleTextImport}
        title={t.week.importTextTooltip}
        className="gap-1 px-2 min-w-[36px]"
      >
        <span className="text-base">📋</span>
      </Button>
    </div>
  )
}
