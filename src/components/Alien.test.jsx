import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alien } from './Alien'

describe('Alien', () => {
  it('renders the word label', () => {
    render(<Alien word="function" x={50} y={100} isTargeted={false} />)
    expect(screen.getByText('function')).toBeInTheDocument()
  })

  it('applies targeted class when isTargeted is true', () => {
    const { container } = render(<Alien word="const" x={50} y={100} isTargeted={true} />)
    expect(container.firstChild).toHaveClass('alien--targeted')
  })

  it('does not apply targeted class when isTargeted is false', () => {
    const { container } = render(<Alien word="const" x={50} y={100} isTargeted={false} />)
    expect(container.firstChild).not.toHaveClass('alien--targeted')
  })

  it('positions alien using style left/top', () => {
    const { container } = render(<Alien word="hello" x={30} y={200} isTargeted={false} />)
    expect(container.firstChild).toHaveStyle({ left: '30%', top: '200px' })
  })
})
