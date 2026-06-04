import './Alien.css'

const ALIEN_TYPES = [
  { sprite: '👾', color: '#00ff88' },
  { sprite: '🛸', color: '#88ccff' },
  { sprite: '👽', color: '#cc88ff' },
  { sprite: '🤖', color: '#ff8844' },
  { sprite: '🦑', color: '#00ffdd' },
  { sprite: '🪲', color: '#ff44aa' },
]

export function Alien({ id, word, x, y, isTargeted }) {
  const type = ALIEN_TYPES[id % ALIEN_TYPES.length]

  return (
    <div
      className={`alien${isTargeted ? ' alien--targeted' : ''}`}
      style={{ left: `${x}%`, top: `${y}px` }}
    >
      <div className="alien__sprite">{type.sprite}</div>
      <div
        className="alien__word"
        style={{ '--alien-color': type.color }}
      >
        {word}
      </div>
    </div>
  )
}
