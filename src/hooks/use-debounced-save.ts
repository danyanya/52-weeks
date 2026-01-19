import { useCallback, useRef } from 'react'

export function useDebouncedSave<T>(
  saveFn: (value: T) => Promise<void>,
  delay = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback((value: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      saveFn(value)
    }, delay)
  }, [saveFn, delay])
}
