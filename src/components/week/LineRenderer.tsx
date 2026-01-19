import { ParsedLine } from '../../lib/text-parser'

interface LineRendererProps {
  line: ParsedLine
}

export function LineRenderer({ line }: LineRendererProps) {
  if (!line.displayText.trim() && !line.time) return null

  const getLineStyle = () => {
    const baseStyle = 'py-0.5'

    if (line.type === 'header') {
      return `${baseStyle} font-semibold text-gray-800 mt-2 text-sm`
    }
    if (line.type === 'subtask') {
      return `${baseStyle} pl-4 text-gray-600 text-sm`
    }
    return `${baseStyle} text-gray-700 text-sm`
  }

  const getStatusStyle = () => {
    if (line.status === 'done') {
      return 'line-through text-gray-400'
    }
    if (line.status === 'partial') {
      return 'text-orange-600'
    }
    return ''
  }

  return (
    <div className={getLineStyle()}>
      {line.time && (
        <span className="text-blue-600 font-mono text-xs sm:text-sm mr-2 inline-block min-w-[60px] sm:min-w-[80px]">
          {line.time}
        </span>
      )}
      <span className={getStatusStyle()}>
        {line.displayText}
      </span>
      {line.status === 'done' && (
        <span className="ml-2 text-green-500">✓</span>
      )}
      {line.status === 'partial' && (
        <span className="ml-2 text-orange-500">◐</span>
      )}
    </div>
  )
}
