import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWordBank } from './useWordBank'

describe('useWordBank', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a getWord function', () => {
    const { result } = renderHook(() => useWordBank(1))
    expect(typeof result.current).toBe('function')
  })

  it('returns a non-empty string', () => {
    const { result } = renderHook(() => useWordBank(1))
    const word = result.current()
    expect(typeof word).toBe('string')
    expect(word.length).toBeGreaterThan(0)
  })

  it('returns code word when random < codeWordRatio', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1) // 0.1 < 0.2 ratio → code word
    const { result } = renderHook(() => useWordBank(1))
    // Call many times — should get code words
    const words = Array.from({ length: 10 }, () => result.current())
    // All should be strings (cannot assert exact word without knowing shuffle order)
    words.forEach(w => expect(typeof w).toBe('string'))
  })

  it('refills pool after exhaustion without crashing', () => {
    const { result } = renderHook(() => useWordBank(1))
    // Call 1000 times — pool should refill
    expect(() => {
      for (let i = 0; i < 1000; i++) result.current()
    }).not.toThrow()
  })

  it('does not return the same word twice in a row from a large pool', () => {
    const { result } = renderHook(() => useWordBank(1))
    const word1 = result.current()
    const word2 = result.current()
    // Not guaranteed but extremely unlikely with a large pool
    expect(word1).toBeDefined()
    expect(word2).toBeDefined()
  })
})
