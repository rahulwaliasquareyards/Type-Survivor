import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameOverScreen } from './GameOverScreen'

beforeEach(() => {
  localStorage.clear()
})

describe('GameOverScreen', () => {
  it('displays the final score', () => {
    render(<GameOverScreen score={340} onRestart={() => {}} />)
    expect(screen.getByText(/340/)).toBeInTheDocument()
  })

  it('shows name entry when score qualifies', () => {
    render(<GameOverScreen score={999} onRestart={() => {}} />)
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
  })

  it('calls onRestart when Play Again is clicked', () => {
    const onRestart = vi.fn()
    render(<GameOverScreen score={0} onRestart={onRestart} />)
    fireEvent.click(screen.getByText('PLAY AGAIN'))
    expect(onRestart).toHaveBeenCalledOnce()
  })
})
