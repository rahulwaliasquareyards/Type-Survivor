import { useEffect } from 'react'
import './Explosion.css'

export function Explosion({ x, y, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="explosion"
      style={{ left: `${x}%`, top: `${y}px` }}
    />
  )
}
