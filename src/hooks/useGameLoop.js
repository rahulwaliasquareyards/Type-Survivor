import { useEffect } from 'react'

export const TICK_MS = 33

export function useGameLoop(isActive, onTickRef) {
  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => onTickRef.current?.(), TICK_MS)
    return () => clearInterval(id)
  }, [isActive])
}
