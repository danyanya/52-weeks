export interface ParsedLine {
  text: string
  displayText: string
  type: 'header' | 'task' | 'subtask' | 'note'
  status: 'none' | 'done' | 'partial'
  time?: string
}

export function parseContent(text: string): ParsedLine[] {
  return text.split('\n').map(line => {
    const trimmed = line.trim()

    // Статус
    let status: ParsedLine['status'] = 'none'
    let displayText = trimmed

    if (trimmed.includes('++')) {
      status = 'done'
      displayText = trimmed.replace(/\s*\+\+\s*/g, '')
    } else if (trimmed.includes('+-')) {
      status = 'partial'
      displayText = trimmed.replace(/\s*\+-\s*/g, '')
    }

    // Тип строки
    let type: ParsedLine['type'] = 'task'

    // Заголовок: слово с большой буквы без других символов или аббревиатура
    if (/^[A-ZА-ЯЁ][A-Za-zА-Яа-яЁё]*$/.test(trimmed) || /^[A-ZА-ЯЁ]{2,}$/.test(trimmed)) {
      type = 'header'
    }
    // Подзадача: начинается с — или -
    else if (/^[—\-]/.test(trimmed)) {
      type = 'subtask'
      displayText = displayText.replace(/^[—\-]\s*/, '')
    }

    // Время: различные форматы времени и диапазонов
    // Поддерживает: 10:00, 10, 10-11, 10 - 11, 10:00 - 12:30, 10-11:00
    const timeMatch = displayText.match(/^(\d{1,2}(?::\d{2})?\s*-\s*\d{1,2}(?::\d{2})?|\d{1,2}:\d{2}|\d{1,2})\s+/)
    let time: string | undefined

    if (timeMatch) {
      // Нормализуем формат: добавляем пробелы вокруг тире в диапазонах
      time = timeMatch[1].replace(/\s*-\s*/, ' - ')
      displayText = displayText.replace(timeMatch[0], '')
    }

    return { text: line, displayText, type, status, time }
  })
}

export function countStats(text: string) {
  const lines = parseContent(text)
  const tasks = lines.filter(l => l.type === 'task')

  return {
    total: tasks.length,
    done: tasks.filter(l => l.status === 'done').length,
    partial: tasks.filter(l => l.status === 'partial').length,
  }
}
