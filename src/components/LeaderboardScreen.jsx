import { readScores } from '../lib/highScores'
import './Screen.css'

export function LeaderboardScreen({ onPlay }) {
  const scores = readScores()

  return (
    <div className="screen">
      <h1 className="screen__title" style={{ fontSize: '2rem', letterSpacing: '6px' }}>
        LEADERBOARD
      </h1>

      {scores.length > 0 ? (
        <div className="screen__leaderboard">
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
      ) : (
        <p className="screen__empty">No scores yet — be the first!</p>
      )}

      <button className="screen__btn" onClick={onPlay}>PLAY</button>
    </div>
  )
}
