import './Alien.css'

export function Alien({ word, x, y, isTargeted }) {
  return (
    <div
      className={`alien${isTargeted ? ' alien--targeted' : ''}`}
      style={{ left: `${x}%`, top: `${y}px` }}
    >
      <div className="alien__sprite">👾</div>
      <div className="alien__word">{word}</div>
    </div>
  )
}
