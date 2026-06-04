import { useEffect } from 'react'
import './Explosion.css'

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * Math.PI * 2) / 12
  const dist = 45 + (i % 4) * 14
  return {
    id: i,
    tx: Math.round(Math.cos(angle) * dist),
    ty: Math.round(Math.sin(angle) * dist),
    w: 2 + (i % 3),
    h: 6 + (i % 4) * 3,
    delay: (i % 4) * 25,
    color: ['#ffffff', '#ffcc00', '#ff8800', '#ff4400'][i % 4],
  }
})

export function Explosion({ x, y, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 750)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="explosion" style={{ left: `${x}%`, top: `${y}px` }}>
      <div className="explosion__flash" />
      <div className="explosion__ring explosion__ring--inner" />
      <div className="explosion__ring explosion__ring--outer" />
      {SPARKS.map(s => (
        <div
          key={s.id}
          className="explosion__spark"
          style={{
            '--tx': `${s.tx}px`,
            '--ty': `${s.ty}px`,
            width: `${s.w}px`,
            height: `${s.h}px`,
            background: s.color,
            boxShadow: `0 0 4px ${s.color}`,
            animationDelay: `${s.delay}ms`,
          }}
        />
      ))}
    </div>
  )
}
