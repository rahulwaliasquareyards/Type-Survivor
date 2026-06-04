import { useState } from 'react'
import './Screen.css'

export function StartScreen({ onStart }) {
  const [showInput, setShowInput] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState(false)

  function handlePlayClick() {
    if (!showInput) {
      setShowInput(true)
      return
    }
    if (name.trim().length < 2) {
      setError(true)
      setTimeout(() => setError(false), 800)
      return
    }
    onStart(name.trim().slice(0, 12))
  }

  return (
    <div className="screen">
      <h1 className="screen__title">KEYBOARD WARRIOR</h1>
      <p className="screen__subtitle">Defend your base — type words to blast the aliens!</p>

      {showInput && (
        <>
          <input
            className={`screen__name-input${error ? ' screen__name-input--error' : ''}`}
            maxLength={12}
            value={name}
            onChange={e => { setName(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && handlePlayClick()}
            placeholder="Enter your name"
            autoFocus
          />
          {error && (
            <p className="screen__error">Please enter at least 2 characters</p>
          )}
        </>
      )}

      <button className="screen__btn" onClick={handlePlayClick}>
        PLAY
      </button>
    </div>
  )
}
