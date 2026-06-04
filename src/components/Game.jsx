import { useState, useRef, useEffect, useCallback } from 'react'
import { GameCanvas } from './GameCanvas'
import { InputBar } from './InputBar'
import { HUD } from './HUD'
import { StartScreen } from './StartScreen'
import { GameOverScreen } from './GameOverScreen'
import { useGameLoop, TICK_MS } from '../hooks/useGameLoop'
import { useWordBank } from '../hooks/useWordBank'
import { getDifficultyConfig, CANVAS_HEIGHT } from '../lib/levelConfig'
import { sounds } from '../lib/sounds'
import './Game.css'

const INITIAL_LIVES = 3

function makeAlien(id, word) {
  return {
    id,
    word,
    x: 10 + Math.random() * 80,
    y: -50,
    isTargeted: false,
  }
}

export function Game() {
  const [gamePhase, setGamePhase] = useState('start')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(INITIAL_LIVES)
  const [aliens, setAliens] = useState([])
  const [explosions, setExplosions] = useState([])
  const [muted, setMuted] = useState(false)

  const aliensRef = useRef([])
  const scoreRef = useRef(0)
  const mutedRef = useRef(false)
  const alienIdRef = useRef(0)
  const explosionIdRef = useRef(0)

  useEffect(() => { aliensRef.current = aliens }, [aliens])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { mutedRef.current = muted }, [muted])

  const tier = Math.floor(score / 150) + 1
  const getWord = useWordBank(tier)
  const getWordRef = useRef(getWord)
  useEffect(() => { getWordRef.current = getWord }, [getWord])

  useEffect(() => {
    if (lives <= 0 && gamePhase === 'playing') {
      if (!mutedRef.current) sounds.gameOver()
      setGamePhase('gameOver')
    }
  }, [lives, gamePhase])

  const onTickRef = useRef(null)
  onTickRef.current = () => {
    const { descendDuration, maxSimultaneous } = getDifficultyConfig(scoreRef.current)
    const speed = CANVAS_HEIGHT / (descendDuration / TICK_MS)
    const current = aliensRef.current

    const moved = current.map(a => ({ ...a, y: a.y + speed }))
    const alive = moved.filter(a => a.y < CANVAS_HEIGHT)
    const escaped = moved.filter(a => a.y >= CANVAS_HEIGHT)

    let next = alive
    if (alive.length < maxSimultaneous) {
      const word = getWordRef.current()
      next = [...alive, makeAlien(++alienIdRef.current, word)]
    }

    aliensRef.current = next
    setAliens(next)

    if (escaped.length > 0) {
      setLives(l => Math.max(0, l - escaped.length))
      if (!mutedRef.current) sounds.thud()
    }
  }

  useGameLoop(gamePhase === 'playing', onTickRef)

  const handleTarget = useCallback((alienId) => {
    setAliens(prev => {
      const next = prev.map(a => ({ ...a, isTargeted: a.id === alienId }))
      aliensRef.current = next
      return next
    })
  }, [])

  const handleKill = useCallback((alienId) => {
    setAliens(prev => {
      const alien = prev.find(a => a.id === alienId)
      if (!alien) return prev

      const expId = ++explosionIdRef.current
      setExplosions(exps => [...exps, { id: expId, x: alien.x, y: alien.y }])
      setScore(s => s + alien.word.length * 10)
      if (!mutedRef.current) sounds.laser()

      const next = prev.filter(a => a.id !== alienId).map(a => ({ ...a, isTargeted: false }))
      aliensRef.current = next
      return next
    })
  }, [])

  const handleExplosionDone = useCallback((expId) => {
    setExplosions(prev => prev.filter(e => e.id !== expId))
  }, [])

  function startGame() {
    alienIdRef.current = 0
    explosionIdRef.current = 0
    scoreRef.current = 0
    aliensRef.current = []
    setScore(0)
    setLives(INITIAL_LIVES)
    setAliens([])
    setExplosions([])
    setGamePhase('playing')
  }

  if (gamePhase === 'start') {
    return <StartScreen onStart={startGame} />
  }

  if (gamePhase === 'gameOver') {
    return <GameOverScreen score={score} onRestart={() => setGamePhase('start')} />
  }

  return (
    <div className="game">
      <HUD score={score} lives={lives} muted={muted} onToggleMute={() => setMuted(m => !m)} />
      <div style={{ position: 'relative', flex: 1 }}>
        <GameCanvas aliens={aliens} explosions={explosions} onExplosionDone={handleExplosionDone} />
      </div>
      <InputBar aliens={aliens} onTarget={handleTarget} onKill={handleKill} />
    </div>
  )
}
