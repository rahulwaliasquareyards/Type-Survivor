import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGameLoop, TICK_MS } from './useGameLoop'

describe('useGameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not call callback when inactive', () => {
    const cb = vi.fn()
    const ref = { current: cb }
    renderHook(() => useGameLoop(false, ref))
    vi.advanceTimersByTime(TICK_MS * 5)
    expect(cb).not.toHaveBeenCalled()
  })

  it('calls callback on each tick when active', () => {
    const cb = vi.fn()
    const ref = { current: cb }
    renderHook(() => useGameLoop(true, ref))
    vi.advanceTimersByTime(TICK_MS * 3)
    expect(cb).toHaveBeenCalledTimes(3)
  })

  it('stops calling callback when isActive becomes false', () => {
    const cb = vi.fn()
    const ref = { current: cb }
    const { rerender } = renderHook(
      ({ active }) => useGameLoop(active, ref),
      { initialProps: { active: true } }
    )
    vi.advanceTimersByTime(TICK_MS * 2)
    rerender({ active: false })
    vi.advanceTimersByTime(TICK_MS * 2)
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it('always calls the latest version of the callback via ref', () => {
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    const ref = { current: cb1 }
    renderHook(() => useGameLoop(true, ref))
    vi.advanceTimersByTime(TICK_MS)
    ref.current = cb2
    vi.advanceTimersByTime(TICK_MS)
    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(1)
  })
})
