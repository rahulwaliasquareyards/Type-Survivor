import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputBar } from './InputBar'

const aliens = [
  { id: 1, word: 'hello', x: 20, y: 100, isTargeted: false },
  { id: 2, word: 'world', x: 60, y: 200, isTargeted: false },
]

describe('InputBar', () => {
  it('renders a text input', () => {
    render(<InputBar aliens={aliens} onTarget={() => {}} onKill={() => {}} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onTarget with matching alien id as user types', async () => {
    const user = userEvent.setup()
    const onTarget = vi.fn()
    render(<InputBar aliens={aliens} onTarget={onTarget} onKill={() => {}} />)
    await user.type(screen.getByRole('textbox'), 'h')
    expect(onTarget).toHaveBeenCalledWith(1)
  })

  it('calls onTarget with null when input matches nothing', async () => {
    const user = userEvent.setup()
    const onTarget = vi.fn()
    render(<InputBar aliens={aliens} onTarget={onTarget} onKill={() => {}} />)
    await user.type(screen.getByRole('textbox'), 'z')
    expect(onTarget).toHaveBeenCalledWith(null)
  })

  it('calls onKill and clears input when full word is typed', async () => {
    const user = userEvent.setup()
    const onKill = vi.fn()
    render(<InputBar aliens={aliens} onTarget={() => {}} onKill={onKill} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'hello')
    expect(onKill).toHaveBeenCalledWith(1)
    expect(input).toHaveValue('')
  })

  it('does not call onKill for partial matches', async () => {
    const user = userEvent.setup()
    const onKill = vi.fn()
    render(<InputBar aliens={aliens} onTarget={() => {}} onKill={onKill} />)
    await user.type(screen.getByRole('textbox'), 'hel')
    expect(onKill).not.toHaveBeenCalled()
  })
})
