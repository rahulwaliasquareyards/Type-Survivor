import { describe, it, expect, beforeEach } from 'vitest'
import { readScores, saveScore, qualifiesForLeaderboard } from './highScores'

const KEY = 'typingGame_highScores'

beforeEach(() => {
  localStorage.clear()
})

describe('readScores', () => {
  it('returns empty array when nothing stored', () => {
    expect(readScores()).toEqual([])
  })

  it('returns parsed scores from localStorage', () => {
    const data = [{ initials: 'AAA', score: 100, level: 2 }]
    localStorage.setItem(KEY, JSON.stringify(data))
    expect(readScores()).toEqual(data)
  })

  it('returns empty array on corrupt data', () => {
    localStorage.setItem(KEY, 'not-json')
    expect(readScores()).toEqual([])
  })
})

describe('qualifiesForLeaderboard', () => {
  it('qualifies when fewer than 5 scores exist', () => {
    expect(qualifiesForLeaderboard(1)).toBe(true)
  })

  it('qualifies when score beats the lowest in top 5', () => {
    const scores = [
      { initials: 'AAA', score: 500, level: 3 },
      { initials: 'BBB', score: 400, level: 2 },
      { initials: 'CCC', score: 300, level: 2 },
      { initials: 'DDD', score: 200, level: 1 },
      { initials: 'EEE', score: 100, level: 1 },
    ]
    localStorage.setItem(KEY, JSON.stringify(scores))
    expect(qualifiesForLeaderboard(150)).toBe(true)
    expect(qualifiesForLeaderboard(50)).toBe(false)
  })
})

describe('saveScore', () => {
  it('saves a new score', () => {
    saveScore('ABC', 200, 3)
    const scores = readScores()
    expect(scores).toHaveLength(1)
    expect(scores[0]).toMatchObject({ initials: 'ABC', score: 200, level: 3 })
  })

  it('keeps only top 5 sorted by score descending', () => {
    saveScore('A', 100, 1)
    saveScore('B', 500, 3)
    saveScore('C', 300, 2)
    saveScore('D', 200, 2)
    saveScore('E', 400, 3)
    saveScore('F', 50, 1)
    const scores = readScores()
    expect(scores).toHaveLength(5)
    expect(scores[0].score).toBe(500)
    expect(scores[4].score).toBe(100)
  })

  it('stores the date', () => {
    saveScore('TST', 10, 1)
    expect(readScores()[0].date).toBeTruthy()
  })
})
