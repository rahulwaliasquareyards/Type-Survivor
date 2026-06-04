import { readScores } from '../lib/highScores'
import './Screen.css'

export function GameOverScreen({ score, playerName, onRestart }) {
  const scores = readScores()

  return (
    <div className="screen">
      <h1 className="screen__title" style={{ fontSize: '2.5rem' }}>GAME OVER</h1>
      <p className="screen__subtitle">
        {playerName ? `${playerName} — ` : ''}Score: {score}
      </p>

      {scores.length > 0 && (
        <div className="screen__leaderboard">
          <h2>Leaderboard</h2>
          <div className="screen__leaderboard-header">
            <span>RANK</span>
            <span>NAME</span>
            <span>SCORE</span>
          </div>
          {scores.map((s, i) => (
            <div key={i} className={`screen__score-row ${i === 0 ? 'screen__score-row--top' : ''}`}>
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
