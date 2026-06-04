import { useEffect } from 'react'
import './LaserBeam.css'

export function LaserBeam({ x, y, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 320)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="laser-beam"
      style={{
        left: `${x}%`,
        top: `${y}px`,
        height: `calc(100% - ${y}px)`,
      }}
    />
  )
}
