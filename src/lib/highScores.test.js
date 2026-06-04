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
    const data = [{ name: 'Rahul', score: 100 }]
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
    const scores = Array.from({ length: 5 }, (_, i) => ({
      name: `Player${i}`,
      score: 500 - i * 40,
    }))
    localStorage.setItem(KEY, JSON.stringify(scores))
    expect(qualifiesForLeaderboard(200)).toBe(true)
    expect(qualifiesForLeaderboard(10)).toBe(false)
  })
})

describe('saveScore', () => {
  it('saves a new score', () => {
    saveScore('Rahul', 200)
    const scores = readScores()
    expect(scores).toHaveLength(1)
    expect(scores[0]).toMatchObject({ name: 'Rahul', score: 200 })
  })

  it('keeps only top 5 sorted by score descending', () => {
    for (let i = 0; i < 7; i++) saveScore(`P${i}`, (i + 1) * 50)
    const scores = readScores()
    expect(scores).toHaveLength(5)
    expect(scores[0].score).toBe(350)
    expect(scores[4].score).toBe(150)
  })

  it('stores the date', () => {
    saveScore('Test', 10)
    expect(readScores()[0].date).toBeTruthy()
  })
})
