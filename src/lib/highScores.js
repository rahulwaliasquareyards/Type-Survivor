const KEY = 'typingGame_highScores'

export function readScores() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function qualifiesForLeaderboard(score) {
  const scores = readScores()
  if (scores.length < 10) return true
  return score > scores[scores.length - 1].score
}

export function saveScore(name, score) {
  const scores = readScores()
  scores.push({ name, score, date: new Date().toLocaleDateString() })
  scores.sort((a, b) => b.score - a.score)
  localStorage.setItem(KEY, JSON.stringify(scores.slice(0, 10)))
}
