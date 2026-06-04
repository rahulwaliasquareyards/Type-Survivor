import { Alien } from './Alien'
import { Explosion } from './Explosion'
import './GameCanvas.css'

const STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  left: (i * 97 + 13) % 100,
  size: 1 + (i % 3),
  fallDuration: 6 + (i % 8) * 2,
  fallDelay: -((i * 37 + 11) % 22),
  twinkleDuration: 1.5 + (i % 4) * 0.5,
  twinkleDelay: -(i % 4),
}))

export function GameCanvas({ aliens = [], explosions = [], onExplosionDone }) {
  return (
    <div className="game-canvas">
      <div className="starfield" aria-hidden="true">
        {STARS.map(s => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDuration: `${s.fallDuration}s, ${s.twinkleDuration}s`,
              animationDelay: `${s.fallDelay}s, ${s.twinkleDelay}s`,
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
