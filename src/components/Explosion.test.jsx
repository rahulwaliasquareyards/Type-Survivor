import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { Explosion } from './Explosion'

describe('Explosion', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders at the given position', () => {
    const { container } = render(<Explosion x={45} y={200} onDone={() => {}} />)
    expect(container.firstChild).toHaveStyle({ left: '45%', top: '200px' })
  })

  it('calls onDone after 600ms', () => {
    const onDone = vi.fn()
    render(<Explosion x={50} y={100} onDone={onDone} />)
    vi.advanceTimersByTime(599)
    expect(onDone).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onDone).toHaveBeenCalledOnce()
  })
})
