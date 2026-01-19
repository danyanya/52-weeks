import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface Day {
  id?: string
  day_index: number
  content: string
}

interface Week {
  id?: string
  year: number
  week_number: number
  focus_text: string
  retro_notes: string
  days: Day[]
}

interface WeeksState {
  currentWeek: Week | null
  isLoading: boolean
  error: string | null

  // Actions
  loadWeek: (year: number, weekNumber: number) => Promise<void>
  updateFocus: (text: string) => Promise<void>
  updateDay: (dayIndex: number, content: string) => Promise<void>
  updateRetro: (notes: string) => Promise<void>
}

export const useWeeksStore = create<WeeksState>((set, get) => ({
  currentWeek: null,
  isLoading: false,
  error: null,

  loadWeek: async (year, weekNumber) => {
    set({ isLoading: true, error: null })

    try {
      console.log('Loading week:', year, weekNumber)

      // Проверяем пользователя
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('User not authenticated:', userError)
        set({ isLoading: false, currentWeek: null, error: 'Пользователь не авторизован' })
        return
      }

      console.log('User authenticated:', user.id)

      // Получаем или создаём неделю
      const { data: week, error } = await supabase
        .from('weeks')
        .select('*, days(*)')
        .eq('year', year)
        .eq('week_number', weekNumber)
        .maybeSingle()

      if (error) {
        console.error('Error loading week:', error)
        set({ isLoading: false, currentWeek: null, error: `Ошибка загрузки: ${error.message}` })
        return
      }

      let weekData = week

      if (!weekData) {
        console.log('Week not found, creating new one')

        // Пытаемся создать неделю
        const { data: newWeek, error: insertError } = await supabase
          .from('weeks')
          .insert({
            year,
            week_number: weekNumber,
            user_id: user.id,
            focus_text: '',
            retro_notes: ''
          })
          .select()
          .single()

        if (insertError) {
          // Если ошибка из-за duplicate key (race condition), загружаем существующую запись
          const isDuplicateError = insertError.code === '23505' ||
                                   insertError.message.includes('duplicate') ||
                                   insertError.message.includes('unique constraint')

          if (isDuplicateError) {
            console.log('Week already exists (race condition), loading existing one')
            const { data: existingWeek, error: selectError } = await supabase
              .from('weeks')
              .select('*, days(*)')
              .eq('year', year)
              .eq('week_number', weekNumber)
              .single()

            if (selectError || !existingWeek) {
              console.error('Error loading existing week:', selectError)
              set({ isLoading: false, currentWeek: null, error: `Ошибка загрузки недели: ${selectError?.message}` })
              return
            }

            weekData = existingWeek
          } else {
            // Другая ошибка
            console.error('Error creating week:', insertError)
            set({ isLoading: false, currentWeek: null, error: `Ошибка создания недели: ${insertError.message}` })
            return
          }
        } else {
          console.log('New week created:', newWeek)
          weekData = { ...newWeek, days: [] }
        }
      } else {
        console.log('Week loaded:', weekData)
      }

      // Заполняем пустые дни
      const days: Day[] = Array.from({ length: 7 }, (_, i) => {
        const existingDay = weekData.days?.find((d: Day) => d.day_index === i)
        return existingDay || { day_index: i, content: '' }
      })

      set({
        currentWeek: { ...weekData, days },
        isLoading: false
      })
    } catch (err) {
      console.error('Unexpected error loading week:', err)
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      set({ isLoading: false, error: errorMessage })
    }
  },

  updateFocus: async (text) => {
    const week = get().currentWeek
    if (!week?.id) return

    set({ currentWeek: { ...week, focus_text: text } })

    await supabase
      .from('weeks')
      .update({ focus_text: text })
      .eq('id', week.id)
  },

  updateDay: async (dayIndex, content) => {
    const week = get().currentWeek
    if (!week?.id) return

    const days = [...week.days]
    const dayIdx = days.findIndex(d => d.day_index === dayIndex)

    if (days[dayIdx].id) {
      // Обновляем существующий
      days[dayIdx] = { ...days[dayIdx], content }
      await supabase
        .from('days')
        .update({ content })
        .eq('id', days[dayIdx].id)
    } else {
      // Создаём новый
      const { data } = await supabase
        .from('days')
        .insert({ week_id: week.id, day_index: dayIndex, content })
        .select()
        .single()

      if (data) days[dayIdx] = data
    }

    set({ currentWeek: { ...week, days } })
  },

  updateRetro: async (notes) => {
    const week = get().currentWeek
    if (!week?.id) return

    set({ currentWeek: { ...week, retro_notes: notes } })

    await supabase
      .from('weeks')
      .update({ retro_notes: notes })
      .eq('id', week.id)
  },
}))
