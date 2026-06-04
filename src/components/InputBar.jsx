import { useRef, useEffect } from 'react'
import './InputBar.css'

export function InputBar({ aliens, onTarget, onKill }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleChange(e) {
    const value = e.target.value
    if (!value) {
      onTarget(null)
      return
    }

    const match = aliens.find(a => a.word.startsWith(value))
    onTarget(match?.id ?? null)

    if (match && value === match.word) {
      onKill(match.id)
      e.target.value = ''
    }
  }

  return (
    <div className="input-bar">
      <span className="input-bar__label">TYPE TO SHOOT</span>
      <input
        ref={inputRef}
        className="input-bar__input"
        onChange={handleChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  )
}
