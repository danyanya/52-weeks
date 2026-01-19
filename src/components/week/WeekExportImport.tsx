import { useRef } from 'react'
import { Button } from '../ui/Button'
import { exportWeekToText, importWeekFromText, downloadTextFile } from '../../lib/week-export'
import { useTranslation } from '../../hooks/use-translation'

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
  const { locale } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const text = exportWeekToText(week, locale)
    const filename = `week-${week.year}-${String(week.week_number).padStart(2, '0')}.txt`
    downloadTextFile(text, filename)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = importWeekFromText(text)

      if (!parsed) {
        alert(locale === 'ru'
          ? 'Не удалось распознать формат файла. Проверьте что файл содержит правильную структуру.'
          : 'Failed to parse file format. Please check that the file contains the correct structure.'
        )
        return
      }

      // Подтверждение импорта
      const confirmMessage = locale === 'ru'
        ? `Импортировать данные?\n\n${parsed.days.length} дней будут обновлены.\n${parsed.focusText ? 'Фокус недели будет обновлен.' : ''}\n\nТекущие данные будут заменены.`
        : `Import data?\n\n${parsed.days.length} days will be updated.\n${parsed.focusText ? 'Week focus will be updated.' : ''}\n\nCurrent data will be replaced.`

      if (!confirm(confirmMessage)) {
        return
      }

      await onImport(parsed)

      alert(locale === 'ru'
        ? 'Данные успешно импортированы!'
        : 'Data imported successfully!'
      )

      // Обновляем страницу для отображения импортированных данных
      window.location.reload()
    } catch (error) {
      console.error('Import error:', error)
      alert(locale === 'ru'
        ? 'Ошибка при импорте файла'
        : 'Error importing file'
      )
      // Сбросить input для возможности повторного выбора того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
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
        title={locale === 'ru' ? 'Экспорт недели в текстовый файл' : 'Export week to text file'}
        className="gap-1"
      >
        <span className="text-base">📤</span>
        {/* <span className="hidden sm:inline">
          {locale === 'ru' ? 'Экспорт' : 'Export'}
        </span> */}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleImportClick}
        title={locale === 'ru' ? 'Импорт недели из текстового файла' : 'Import week from text file'}
        className="gap-1"
      >
        <span className="text-base">📥</span>
        {/* <span className="hidden sm:inline">
          {locale === 'ru' ? 'Импорт' : 'Import'}
        </span> */}
      </Button>
    </div>
  )
}
