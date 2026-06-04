import { useState } from 'react'
import { readScores, qualifiesForLeaderboard, saveScore } from '../lib/highScores'
import './Screen.css'

export function GameOverScreen({ score, onRestart }) {
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const qualifies = qualifiesForLeaderboard(score)

  function handleSave() {
    if (!name.trim()) return
    saveScore(name.trim().slice(0, 12), score)
    setSaved(true)
  }

  const displayScores = saved ? readScores() : readScores()

  return (
    <div className="screen">
      <h1 className="screen__title">GAME OVER</h1>
      <p className="screen__subtitle">Score: {score}</p>

      {qualifies && !saved && score > 0 && (
        <div className="screen__initials-entry">
          <p>You made the leaderboard! Enter your first name:</p>
          <input
            className="screen__name-input"
            maxLength={12}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="First name"
            autoFocus
          />
          <button className="screen__btn screen__btn--small" onClick={handleSave}>
            Save
          </button>
        </div>
      )}

      {displayScores.length > 0 && (
        <div className="screen__leaderboard">
          <h2>Leaderboard</h2>
          {displayScores.map((s, i) => (
            <div key={i} className="screen__score-row">
              <span className="screen__rank">{i + 1}.</span>
              <span className="screen__name">{s.name || s.initials}</span>
              <span className="screen__score-val">{s.score}</span>
            </div>
          ))}
        </div>
      )}

      <button className="screen__btn" onClick={onRestart}>PLAY AGAIN</button>
    </div>
  )
}
