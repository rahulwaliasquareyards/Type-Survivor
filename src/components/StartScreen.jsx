import './Screen.css'

export function StartScreen({ onStart }) {
  return (
    <div className="screen">
      <h1 className="screen__title">KEYBOARD WARRIOR</h1>
      <p className="screen__subtitle">Defend your base — type words to blast the aliens!</p>
      <button className="screen__btn" onClick={onStart}>PLAY</button>
    </div>
  )
}
