import { Alien } from './Alien'
import { Explosion } from './Explosion'
import './GameCanvas.css'

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: (i * 97 + 13) % 100,
  top: (i * 53 + 7) % 100,
  size: 1 + (i % 3),
  duration: 2 + (i % 4),
  delay: -(i % 5),
}))

export function GameCanvas({ aliens, explosions, onExplosionDone }) {
  return (
    <div className="game-canvas">
      <div className="starfield" aria-hidden="true">
        {STARS.map(s => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {aliens.map(alien => (
        <Alien key={alien.id} {...alien} />
      ))}

      {explosions.map(exp => (
        <Explosion
          key={exp.id}
          x={exp.x}
          y={exp.y}
          onDone={() => onExplosionDone(exp.id)}
        />
      ))}
    </div>
  )
}
