import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HUD } from './HUD'

describe('HUD', () => {
  it('displays the score', () => {
    render(<HUD score={250} lives={3} level={2} muted={false} onToggleMute={() => {}} />)
    expect(screen.getByText(/250/)).toBeInTheDocument()
  })

  it('displays the level', () => {
    render(<HUD score={0} lives={3} level={4} muted={false} onToggleMute={() => {}} />)
    expect(screen.getByText(/Level 4/)).toBeInTheDocument()
  })

  it('shows 3 life icons total', () => {
    const { container } = render(<HUD score={0} lives={2} level={1} muted={false} onToggleMute={() => {}} />)
    const lives = container.querySelectorAll('.hud__life')
    expect(lives).toHaveLength(3)
  })

  it('shows correct number of full vs empty lives', () => {
    const { container } = render(<HUD score={0} lives={2} level={1} muted={false} onToggleMute={() => {}} />)
    expect(container.querySelectorAll('.hud__life--full')).toHaveLength(2)
    expect(container.querySelectorAll('.hud__life--empty')).toHaveLength(1)
  })

  it('calls onToggleMute when mute button clicked', () => {
    const onToggleMute = vi.fn()
    render(<HUD score={0} lives={3} level={1} muted={false} onToggleMute={onToggleMute} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggleMute).toHaveBeenCalledOnce()
  })
})
