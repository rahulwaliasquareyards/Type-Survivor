import './HUD.css'

export function HUD({ score, lives, level, muted, onToggleMute }) {
  return (
    <div className="hud">
      <div className="hud__level">Level {level}</div>
      <div className="hud__score">Score: {score}</div>
      <div className="hud__lives">
        {Array.from({ length: 3 }, (_, i) => (
          <span
            key={i}
            className={`hud__life ${i < lives ? 'hud__life--full' : 'hud__life--empty'}`}
          >
            🚀
          </span>
        ))}
      </div>
      <button className="hud__mute" onClick={onToggleMute} aria-label="Toggle mute">
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}
