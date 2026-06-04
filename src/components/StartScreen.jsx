import { readScores } from '../lib/highScores'
import './Screen.css'

export function StartScreen({ onStart }) {
  const scores = readScores()

  return (
    <div className="screen">
      <h1 className="screen__title">KEYBOARD WARRIOR</h1>
      <p className="screen__subtitle">Defend your base — type words to blast the aliens!</p>

      {scores.length > 0 && (
        <div className="screen__leaderboard">
          <h2>Leaderboard</h2>
          {scores.map((s, i) => (
            <div key={i} className="screen__score-row">
              <span className="screen__rank">{i + 1}.</span>
              <span className="screen__name">{s.name || s.initials}</span>
              <span className="screen__score-val">{s.score}</span>
            </div>
          ))}
        </div>
      )}

      <button className="screen__btn" onClick={onStart}>PLAY</button>
    </div>
  )
}
