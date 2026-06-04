import { useState } from 'react'
import { readScores, qualifiesForLeaderboard, saveScore } from '../lib/highScores'
import './Screen.css'

export function GameOverScreen({ score, level, onRestart }) {
  const [initials, setInitials] = useState('')
  const [saved, setSaved] = useState(false)
  const qualifies = qualifiesForLeaderboard(score)

  function handleSave() {
    if (!initials.trim()) return
    saveScore(initials.toUpperCase().slice(0, 3), score, level)
    setSaved(true)
  }

  const displayScores = readScores()

  return (
    <div className="screen">
      <h1 className="screen__title">GAME OVER</h1>
      <p className="screen__subtitle">Score: {score} — Level {level}</p>

      {qualifies && !saved && score > 0 && (
        <div className="screen__initials-entry">
          <p>You made the leaderboard!</p>
          <input
            className="screen__initials-input"
            maxLength={3}
            value={initials}
            onChange={e => setInitials(e.target.value)}
            placeholder="AAA"
            autoFocus
          />
          <button className="screen__btn screen__btn--small" onClick={handleSave}>
            Save
          </button>
        </div>
      )}

      {displayScores.length > 0 && (
        <div className="screen__leaderboard">
          <h2>High Scores</h2>
          {displayScores.map((s, i) => (
            <div key={i} className="screen__score-row">
              <span className="screen__rank">{i + 1}.</span>
              <span className="screen__initials">{s.initials}</span>
              <span className="screen__score-val">{s.score}</span>
              <span className="screen__level-val">Lvl {s.level}</span>
            </div>
          ))}
        </div>
      )}

      <button className="screen__btn" onClick={onRestart}>PLAY AGAIN</button>
    </div>
  )
}
