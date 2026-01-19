import { startOfWeek, endOfWeek, getWeek, addWeeks, format, getISOWeeksInYear } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'
import { useLocaleStore } from '../store/locale-store'

export function getDateFnsLocale(): DateFnsLocale {
  const locale = useLocaleStore.getState().locale
  return locale === 'ru' ? ru : enUS
}

export function getWeekNumber(date: Date): number {
  return getWeek(date, { weekStartsOn: 1 })
}

export function getWeekDates(year: number, weekNumber: number) {
  const jan1 = new Date(year, 0, 1)
  const weekStart = startOfWeek(addWeeks(jan1, weekNumber - 1), { weekStartsOn: 1 })

  return {
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
    days: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      return {
        index: i,
        date,
        dayOfMonth: format(date, 'd'),
      }
    })
  }
}

export function formatWeekRange(year: number, weekNumber: number): string {
  const { start, end } = getWeekDates(year, weekNumber)
  const locale = getDateFnsLocale()
  return `${format(start, 'd MMM', { locale })} — ${format(end, 'd MMM yyyy', { locale })}`
}

export function getCurrentWeek(): { year: number; weekNumber: number } {
  const now = new Date()
  return {
    year: now.getFullYear(),
    weekNumber: getWeekNumber(now)
  }
}

export function getPreviousWeek(year: number, weekNumber: number): { year: number; weekNumber: number } {
  if (weekNumber > 1) {
    return { year, weekNumber: weekNumber - 1 }
  }
  // Переход на предыдущий год
  const lastWeekOfPrevYear = getISOWeeksInYear(new Date(year - 1, 0, 1))
  return { year: year - 1, weekNumber: lastWeekOfPrevYear }
}

export function getNextWeek(year: number, weekNumber: number): { year: number; weekNumber: number } {
  const lastWeekOfYear = getISOWeeksInYear(new Date(year, 0, 1))
  if (weekNumber < lastWeekOfYear) {
    return { year, weekNumber: weekNumber + 1 }
  }
  // Переход на следующий год
  return { year: year + 1, weekNumber: 1 }
}

// Квартальные функции
export function getQuarterFromWeek(weekNumber: number): number {
  return Math.ceil(weekNumber / 13)
}

export function getWeeksInQuarter(year: number, quarter: number): number[] {
  const startWeek = (quarter - 1) * 13 + 1
  const totalWeeksInYear = getISOWeeksInYear(new Date(year, 0, 1))

  // Для последнего квартала берём все оставшиеся недели
  const endWeek = quarter === 4 ? totalWeeksInYear : Math.min(quarter * 13, totalWeeksInYear)

  return Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i)
}

export function getCurrentQuarter(): { year: number; quarter: number } {
  const { year, weekNumber } = getCurrentWeek()
  return {
    year,
    quarter: getQuarterFromWeek(weekNumber)
  }
}

export function getQuarterName(quarter: number): string {
  return `Q${quarter}`
}

export function formatQuarterRange(year: number, quarter: number): string {
  const weeks = getWeeksInQuarter(year, quarter)
  const firstWeek = weeks[0]
  const lastWeek = weeks[weeks.length - 1]

  const { start } = getWeekDates(year, firstWeek)
  const { end } = getWeekDates(year, lastWeek)
  const locale = getDateFnsLocale()

  return `${format(start, 'd MMM', { locale })} — ${format(end, 'd MMM yyyy', { locale })}`
}

// Годовые функции
export function getAllWeeksInYear(year: number): number[] {
  const totalWeeks = getISOWeeksInYear(new Date(year, 0, 1))
  return Array.from({ length: totalWeeks }, (_, i) => i + 1)
}
