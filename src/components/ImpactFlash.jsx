import { useEffect } from 'react'
import './ImpactFlash.css'

export function ImpactFlash({ x, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="impact-flash" style={{ left: `${x}%` }} />
  )
}
