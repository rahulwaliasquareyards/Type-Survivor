import './HUD.css'

export function HUD({ score, lives, muted, onToggleMute, voiceEnabled, onToggleVoice }) {
  return (
    <div className="hud">
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
      <button
        className={`hud__voice ${voiceEnabled ? 'hud__voice--on' : ''}`}
        onClick={onToggleVoice}
        aria-label="Toggle voice"
        title={voiceEnabled ? 'Voice: ON — aliens read their word aloud' : 'Voice: OFF'}
      >
        🎤
      </button>
      <button className="hud__mute" onClick={onToggleMute} aria-label="Toggle mute">
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}
