import { useEffect } from 'react'
import { useWeeksStore } from '../store/weeks-store'
import { getCurrentWeek } from '../lib/date-utils'

export function useWeek(year?: number, weekNumber?: number) {
  const { currentWeek, isLoading, error, loadWeek, updateFocus, updateDay, updateRetro } = useWeeksStore()

  useEffect(() => {
    const { year: currentYear, weekNumber: currentWeekNumber } = getCurrentWeek()
    const targetYear = year ?? currentYear
    const targetWeek = weekNumber ?? currentWeekNumber

    loadWeek(targetYear, targetWeek)
  }, [year, weekNumber, loadWeek])

  return {
    week: currentWeek,
    isLoading,
    error,
    updateFocus,
    updateDay,
    updateRetro
  }
}
