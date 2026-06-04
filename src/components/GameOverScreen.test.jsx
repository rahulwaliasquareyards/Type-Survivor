import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameOverScreen } from './GameOverScreen'

beforeEach(() => {
  localStorage.clear()
})

describe('GameOverScreen', () => {
  it('displays the final score and level', () => {
    render(<GameOverScreen score={340} level={3} onRestart={() => {}} />)
    expect(screen.getByText(/340/)).toBeInTheDocument()
    expect(screen.getByText(/Level 3/)).toBeInTheDocument()
  })

  it('shows initials entry when score qualifies', () => {
    render(<GameOverScreen score={999} level={5} onRestart={() => {}} />)
    expect(screen.getByPlaceholderText('AAA')).toBeInTheDocument()
  })

  it('calls onRestart when Play Again is clicked', () => {
    const onRestart = vi.fn()
    render(<GameOverScreen score={0} level={1} onRestart={onRestart} />)
    fireEvent.click(screen.getByText('PLAY AGAIN'))
    expect(onRestart).toHaveBeenCalledOnce()
  })
})
