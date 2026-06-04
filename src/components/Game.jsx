import { useState, useRef, useEffect, useCallback } from 'react'
import { GameCanvas } from './GameCanvas'
import { InputBar } from './InputBar'
import { HUD } from './HUD'
import { StartScreen } from './StartScreen'
import { GameOverScreen } from './GameOverScreen'
import { useGameLoop, TICK_MS } from '../hooks/useGameLoop'
import { useWordBank } from '../hooks/useWordBank'
import { getLevelConfig, CANVAS_HEIGHT } from '../lib/levelConfig'
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
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(INITIAL_LIVES)
  const [aliens, setAliens] = useState([])
  const [explosions, setExplosions] = useState([])
  const [remainingInWave, setRemainingInWave] = useState(0)
  const [muted, setMuted] = useState(false)

  // Refs — always hold current values for use inside the tick callback
  const aliensRef = useRef([])
  const remainingRef = useRef(0)
  const levelRef = useRef(1)
  const mutedRef = useRef(false)
  const alienIdRef = useRef(0)
  const explosionIdRef = useRef(0)

  useEffect(() => { aliensRef.current = aliens }, [aliens])
  useEffect(() => { remainingRef.current = remainingInWave }, [remainingInWave])
  useEffect(() => { levelRef.current = level }, [level])
  useEffect(() => { mutedRef.current = muted }, [muted])

  const getWord = useWordBank(level)
  const getWordRef = useRef(getWord)
  useEffect(() => { getWordRef.current = getWord }, [getWord])

  // Detect wave complete
  useEffect(() => {
    if (gamePhase !== 'playing') return
    if (aliens.length > 0 || remainingInWave > 0) return

    if (!mutedRef.current) sounds.levelUp()
    setGamePhase('levelComplete')

    const nextLevel = levelRef.current + 1
    const nextConfig = getLevelConfig(nextLevel)

    const t = setTimeout(() => {
      levelRef.current = nextLevel
      remainingRef.current = nextConfig.aliensPerWave
      aliensRef.current = []
      setLevel(nextLevel)
      setRemainingInWave(nextConfig.aliensPerWave)
      setAliens([])
      setGamePhase('playing')
    }, 5000)

    return () => clearTimeout(t)
  }, [aliens.length, remainingInWave, gamePhase])

  // Detect game over
  useEffect(() => {
    if (lives <= 0 && gamePhase === 'playing') {
      if (!mutedRef.current) sounds.gameOver()
      setGamePhase('gameOver')
    }
  }, [lives, gamePhase])

  // Tick callback — reassigned each render so interval always calls latest version via ref
  const onTickRef = useRef(null)
  onTickRef.current = () => {
    const { descendDuration, maxSimultaneous } = getLevelConfig(levelRef.current)
    const speed = CANVAS_HEIGHT / (descendDuration / TICK_MS)
    const current = aliensRef.current

    const moved = current.map(a => ({ ...a, y: a.y + speed }))
    const alive = moved.filter(a => a.y < CANVAS_HEIGHT)
    const escaped = moved.filter(a => a.y >= CANVAS_HEIGHT)

    let next = alive
    let spawned = false
    if (alive.length < maxSimultaneous && remainingRef.current > 0) {
      const word = getWordRef.current()
      next = [...alive, makeAlien(++alienIdRef.current, word)]
      remainingRef.current -= 1
      spawned = true
    }

    aliensRef.current = next
    setAliens(next)

    if (spawned) {
      setRemainingInWave(r => r - 1)
    }

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
    const config = getLevelConfig(1)
    alienIdRef.current = 0
    explosionIdRef.current = 0
    levelRef.current = 1
    remainingRef.current = config.aliensPerWave
    aliensRef.current = []
    setLevel(1)
    setScore(0)
    setLives(INITIAL_LIVES)
    setAliens([])
    setExplosions([])
    setRemainingInWave(config.aliensPerWave)
    setGamePhase('playing')
  }

  if (gamePhase === 'start') {
    return <StartScreen onStart={startGame} />
  }

  if (gamePhase === 'gameOver') {
    return <GameOverScreen score={score} level={level} onRestart={() => setGamePhase('start')} />
  }

  return (
    <div className="game">
      <HUD score={score} lives={lives} level={level} muted={muted} onToggleMute={() => setMuted(m => !m)} />
      <div style={{ position: 'relative', flex: 1 }}>
        <GameCanvas aliens={aliens} explosions={explosions} onExplosionDone={handleExplosionDone} />
        {gamePhase === 'levelComplete' && (
          <div className="level-complete-overlay">
            <div className="level-complete-text">LEVEL {level} COMPLETE!</div>
          </div>
        )}
      </div>
      <InputBar aliens={aliens} onTarget={handleTarget} onKill={handleKill} />
    </div>
  )
}
