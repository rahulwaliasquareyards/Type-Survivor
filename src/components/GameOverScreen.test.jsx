import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameOverScreen } from './GameOverScreen'

beforeEach(() => {
  localStorage.clear()
})

describe('GameOverScreen', () => {
  it('displays the final score', () => {
    render(<GameOverScreen score={340} playerName="Rahul" onRestart={() => {}} />)
    expect(screen.getByText(/340/)).toBeInTheDocument()
  })

  it('displays the player name', () => {
    render(<GameOverScreen score={100} playerName="Rahul" onRestart={() => {}} />)
    expect(screen.getByText(/Rahul/)).toBeInTheDocument()
  })

  it('calls onRestart when Play Again is clicked', () => {
    const onRestart = vi.fn()
    render(<GameOverScreen score={0} playerName="" onRestart={onRestart} />)
    fireEvent.click(screen.getByText('PLAY AGAIN'))
    expect(onRestart).toHaveBeenCalledOnce()
  })
})
