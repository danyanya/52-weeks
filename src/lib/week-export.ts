import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { getWeekDates } from './date-utils'

interface Week {
  year: number
  week_number: number
  focus_text: string
  days: Array<{ day_index: number; content: string }>
}

const DAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const DAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * Экспорт недели в текстовый формат (Apple Notes compatible)
 */
export function exportWeekToText(week: Week, locale: 'ru' | 'en' = 'ru'): string {
  const weekDates = getWeekDates(week.year, week.week_number)
  const startDate = weekDates.days[0].date
  const endDate = weekDates.days[6].date

  const dateLocale = locale === 'ru' ? ru : undefined
  const startFormatted = format(startDate, 'dd.MM.yy', { locale: dateLocale })
  const endFormatted = format(endDate, 'dd.MM.yy', { locale: dateLocale })

  const dayNames = locale === 'ru' ? DAY_NAMES_RU : DAY_NAMES_EN
  const title = locale === 'ru'
    ? `План на неделю ${startFormatted} - ${endFormatted}`
    : `Week plan ${startFormatted} - ${endFormatted}`

  let result = title + '\n\n'

  // Добавляем фокус недели если есть
  if (week.focus_text?.trim()) {
    result += (locale === 'ru' ? '🎯 Фокус недели:\n' : '🎯 Week Focus:\n')
    result += week.focus_text.trim() + '\n\n'
  }

  // Добавляем каждый день
  weekDates.days.forEach((_, index) => {
    const dayData = week.days.find(d => d.day_index === index)
    const content = dayData?.content || ''

    result += dayNames[index] + '\n'

    if (content.trim()) {
      result += content.trim() + '\n'
    } else {
      result += '* \n'
    }

    result += '\n'
  })

  return result.trim()
}

/**
 * Импорт недели из текстового формата
 */
export function importWeekFromText(text: string): {
  focusText: string
  days: Array<{ dayIndex: number; content: string }>
} | null {
  try {
    const lines = text.split('\n')
    let focusText = ''
    const days: Array<{ dayIndex: number; content: string }> = []

    let currentDayIndex = -1
    let currentDayContent: string[] = []
    let inFocusSection = false
    let focusLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Пропускаем заголовок (первая строка с "План на неделю" или "Week plan")
      if (i === 0 && (trimmed.includes('План на неделю') || trimmed.includes('Week plan'))) {
        continue
      }

      // Проверяем начало секции фокуса
      if (trimmed.startsWith('🎯') && (trimmed.includes('Фокус') || trimmed.includes('Focus'))) {
        inFocusSection = true
        continue
      }

      // Проверяем день недели (Пн, Вт, Mon, Tue и т.д.)
      const dayIndex = parseDayName(trimmed)
      if (dayIndex !== -1) {
        // Завершаем фокус секцию если была
        if (inFocusSection) {
          focusText = focusLines.join('\n').trim()
          inFocusSection = false
        }

        // Сохраняем предыдущий день
        if (currentDayIndex !== -1) {
          days.push({
            dayIndex: currentDayIndex,
            content: currentDayContent.join('\n').trim()
          })
        }

        currentDayIndex = dayIndex
        currentDayContent = []
        continue
      }

      // Собираем контент
      if (inFocusSection) {
        // Если встретили пустую строку после фокуса - выходим из секции
        if (!trimmed && focusLines.length > 0) {
          inFocusSection = false
          focusText = focusLines.join('\n').trim()
        } else if (trimmed) {
          focusLines.push(line)
        }
      } else if (currentDayIndex !== -1) {
        // Добавляем контент к текущему дню
        currentDayContent.push(line)
      }
    }

    // Сохраняем последний день
    if (currentDayIndex !== -1) {
      days.push({
        dayIndex: currentDayIndex,
        content: currentDayContent.join('\n').trim()
      })
    }

    // Если ничего не нашли - возвращаем null
    if (days.length === 0 && !focusText) {
      return null
    }

    return { focusText, days }
  } catch (error) {
    console.error('Error parsing week text:', error)
    return null
  }
}

/**
 * Определяет индекс дня по названию
 */
function parseDayName(text: string): number {
  const normalized = text.toLowerCase().trim()

  // Русские сокращения
  const ruDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
  const ruIndex = ruDays.indexOf(normalized)
  if (ruIndex !== -1) return ruIndex

  // Английские сокращения
  const enDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const enIndex = enDays.indexOf(normalized)
  if (enIndex !== -1) return enIndex

  // Полные английские названия
  const enFullDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const enFullIndex = enFullDays.indexOf(normalized)
  if (enFullIndex !== -1) return enFullIndex

  return -1
}

/**
 * Скачивает текст как файл
 */
export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
