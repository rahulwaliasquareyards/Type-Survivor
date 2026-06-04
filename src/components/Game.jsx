import { useState, useRef, useEffect, useCallback } from 'react'
import { GameCanvas } from './GameCanvas'
import { InputBar } from './InputBar'
import { HUD } from './HUD'
import { StartScreen } from './StartScreen'
import { GameOverScreen } from './GameOverScreen'
import { useGameLoop, TICK_MS } from '../hooks/useGameLoop'
import { useWordBank } from '../hooks/useWordBank'
import { getDifficultyConfig, CANVAS_HEIGHT } from '../lib/levelConfig'
import { saveScore, qualifiesForLeaderboard } from '../lib/highScores'
import { sounds } from '../lib/sounds'
import { speak, cancelSpeech } from '../lib/voice'
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
  const [laserBeams, setLaserBeams] = useState([])
  const [muted, setMuted] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [shaking, setShaking] = useState(false)
  const shakeTimerRef = useRef(null)

  const aliensRef = useRef([])
  const scoreRef = useRef(0)
  const mutedRef = useRef(false)
  const voiceEnabledRef = useRef(false)
  const playerNameRef = useRef('')
  const alienIdRef = useRef(0)
  const explosionIdRef = useRef(0)
  const laserBeamIdRef = useRef(0)

  useEffect(() => { aliensRef.current = aliens }, [aliens])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { mutedRef.current = muted }, [muted])
  useEffect(() => { voiceEnabledRef.current = voiceEnabled }, [voiceEnabled])

  const tier = Math.floor(score / 150) + 1
  const getWord = useWordBank(tier)
  const getWordRef = useRef(getWord)
  useEffect(() => { getWordRef.current = getWord }, [getWord])

  useEffect(() => {
    if (lives <= 0 && gamePhase === 'playing') {
      if (!mutedRef.current) sounds.gameOver()
      cancelSpeech()
      if (scoreRef.current > 0 && playerNameRef.current) {
        saveScore(playerNameRef.current, scoreRef.current)
      }
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
      if (voiceEnabledRef.current) speak(word)
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
      const beamId = ++laserBeamIdRef.current
      setLaserBeams(beams => [...beams, { id: beamId, x: alien.x, y: alien.y }])
      setScore(s => s + alien.word.length * 10)
      if (!mutedRef.current) sounds.laser()
      clearTimeout(shakeTimerRef.current)
      setShaking(true)
      shakeTimerRef.current = setTimeout(() => setShaking(false), 280)

      const next = prev.filter(a => a.id !== alienId).map(a => ({ ...a, isTargeted: false }))
      aliensRef.current = next
      return next
    })
  }, [])

  const handleExplosionDone = useCallback((expId) => {
    setExplosions(prev => prev.filter(e => e.id !== expId))
  }, [])

  const handleBeamDone = useCallback((beamId) => {
    setLaserBeams(prev => prev.filter(b => b.id !== beamId))
  }, [])

  function startGame(name = playerName) {
    playerNameRef.current = name
    setPlayerName(name)
    alienIdRef.current = 0
    explosionIdRef.current = 0
    scoreRef.current = 0
    aliensRef.current = []
    cancelSpeech()
    setScore(0)
    setLives(INITIAL_LIVES)
    setAliens([])
    setExplosions([])
    setLaserBeams([])
    setGamePhase('playing')
  }

  if (gamePhase === 'start') {
    return <StartScreen onStart={startGame} />
  }

  if (gamePhase === 'gameOver') {
    return <GameOverScreen score={score} playerName={playerName} onRestart={() => setGamePhase('start')} />
  }

  return (
    <div className={`game${shaking ? ' game--shake' : ''}`}>
      <HUD
        score={score}
        lives={lives}
        muted={muted}
        onToggleMute={() => setMuted(m => !m)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(v => !v)}
      />
      <div style={{ position: 'relative', flex: 1 }}>
        <GameCanvas
          aliens={aliens}
          explosions={explosions}
          onExplosionDone={handleExplosionDone}
          laserBeams={laserBeams}
          onBeamDone={handleBeamDone}
        />
      </div>
      <InputBar aliens={aliens} onTarget={handleTarget} onKill={handleKill} />
    </div>
  )
}
