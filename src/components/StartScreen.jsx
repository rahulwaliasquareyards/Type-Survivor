import { useState } from 'react'
import './Screen.css'

export function StartScreen({ onStart }) {
  const [showInput, setShowInput] = useState(false)
  const [name, setName] = useState('')

  function handlePlayClick() {
    if (!showInput) {
      setShowInput(true)
      return
    }
    onStart(name.trim().slice(0, 12) || 'Player')
  }

  return (
    <div className="screen">
      <h1 className="screen__title">KEYBOARD WARRIOR</h1>
      {showInput && (
        <input
          className="screen__name-input"
          maxLength={12}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePlayClick()}
          placeholder="Name"
          autoFocus
        />
      )}

      <button className="screen__btn" onClick={handlePlayClick}>
        PLAY
      </button>
    </div>
  )
}
