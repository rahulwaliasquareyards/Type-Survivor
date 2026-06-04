import { useEffect } from 'react'
import { TICK_MS } from '../lib/levelConfig'

export { TICK_MS }

export function useGameLoop(isActive, onTickRef) {
  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => onTickRef.current?.(), TICK_MS)
    return () => clearInterval(id)
  }, [isActive])
}
