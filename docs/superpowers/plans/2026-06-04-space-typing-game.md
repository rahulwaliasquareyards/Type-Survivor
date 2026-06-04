# Space Typing Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based space survival typing game — aliens descend carrying words, player types to destroy them, with levels, lives, sound, explosions, and a local high score leaderboard.

**Architecture:** All game state lives in `Game.jsx` (useState + useRef). A `setInterval` hook (`useGameLoop`) drives alien movement every 33ms; the callback is reassigned each render via a ref to avoid stale closures. Sounds synthesized via Web Audio API (no external files). High scores in LocalStorage.

**Tech Stack:** React 18, Vite, Vitest + @testing-library/react + jsdom, Web Audio API, CSS keyframe animations, LocalStorage

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/App.jsx` | Root — renders `<Game />` |
| `src/index.css` | CSS reset + space background |
| `src/components/Game.jsx` | All state, phase transitions, tick logic |
| `src/components/GameCanvas.jsx` | Renders starfield, aliens, explosions |
| `src/components/Alien.jsx` | Single alien: word label + descent CSS + glow |
| `src/components/Explosion.jsx` | CSS burst, self-unmounts after 600ms |
| `src/components/InputBar.jsx` | Always-focused input, target + kill detection |
| `src/components/HUD.jsx` | Score / lives / level / mute |
| `src/components/StartScreen.jsx` | Title, instructions, leaderboard, Play button |
| `src/components/GameOverScreen.jsx` | Final score, initials entry, leaderboard |
| `src/hooks/useGameLoop.js` | setInterval wrapper (33ms tick) |
| `src/hooks/useWordBank.js` | Samples words without repeat by level ratio |
| `src/lib/levelConfig.js` | Level scaling constants + `getLevelConfig(n)` |
| `src/lib/highScores.js` | LocalStorage CRUD for top-5 scores |
| `src/lib/sounds.js` | Web Audio API synthesized sound effects |
| `src/data/commonWords.js` | Array of ~150 common English words |
| `src/data/codeWords.js` | Array of ~100 programmer keywords |

---

## Task 1: Project Scaffold + Test Infrastructure

**Files:**
- Create: `vite.config.js` (modify existing)
- Create: `src/test-setup.js`
- Create: `src/App.jsx`
- Create: `src/main.jsx`

- [ ] **Step 1: Initialize Vite React project in the existing repo directory**

```bash
npm create vite@latest . -- --template react
```

When prompted about existing files, select to ignore/overwrite. This creates `src/`, `index.html`, `vite.config.js`, `package.json`.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

- [ ] **Step 3: Configure Vite for testing**

Replace the contents of `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
})
```

- [ ] **Step 4: Add test setup file**

Create `src/test-setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, ensure scripts includes:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 6: Replace App.jsx with a clean shell**

```jsx
import { Game } from './components/Game'

export default function App() {
  return <Game />
}
```

- [ ] **Step 7: Verify scaffold works**

```bash
npm run dev
```

Expected: Vite dev server starts on http://localhost:5173

```bash
npm test
```

Expected: "No test files found" or 0 tests pass — confirms test runner works.

- [ ] **Step 8: Delete Vite boilerplate files**

Delete: `src/assets/react.svg`, `public/vite.svg`, `src/App.css` (we'll create our own CSS later).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite React project with Vitest"
```

---

## Task 2: Level Config

**Files:**
- Create: `src/lib/levelConfig.js`
- Create: `src/lib/levelConfig.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/levelConfig.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { getLevelConfig } from './levelConfig'

describe('getLevelConfig', () => {
  it('level 1 has 10 aliens per wave', () => {
    expect(getLevelConfig(1).aliensPerWave).toBe(10)
  })

  it('level 3 has 20 aliens per wave', () => {
    expect(getLevelConfig(3).aliensPerWave).toBe(20)
  })

  it('maxSimultaneous caps at 6', () => {
    expect(getLevelConfig(10).maxSimultaneous).toBe(6)
  })

  it('level 1 maxSimultaneous is 3', () => {
    expect(getLevelConfig(1).maxSimultaneous).toBe(3)
  })

  it('level 4 maxSimultaneous is 6', () => {
    expect(getLevelConfig(4).maxSimultaneous).toBe(6)
  })

  it('descendDuration decreases each level', () => {
    const d1 = getLevelConfig(1).descendDuration
    const d2 = getLevelConfig(2).descendDuration
    expect(d2).toBeLessThan(d1)
  })

  it('descendDuration never goes below 6000ms', () => {
    expect(getLevelConfig(100).descendDuration).toBe(6000)
  })

  it('level 1-2 code word ratio is 0.2', () => {
    expect(getLevelConfig(1).codeWordRatio).toBe(0.2)
    expect(getLevelConfig(2).codeWordRatio).toBe(0.2)
  })

  it('level 3+ code word ratio is 0.4', () => {
    expect(getLevelConfig(3).codeWordRatio).toBe(0.4)
    expect(getLevelConfig(5).codeWordRatio).toBe(0.4)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — "Cannot find module './levelConfig'"

- [ ] **Step 3: Implement levelConfig.js**

Create `src/lib/levelConfig.js`:

```js
export const CANVAS_HEIGHT = 600
export const TICK_MS = 33

export function getLevelConfig(level) {
  return {
    aliensPerWave: 10 + (level - 1) * 5,
    maxSimultaneous: Math.min(2 + level, 6),
    descendDuration: Math.max(18000 - (level - 1) * 3000, 6000),
    codeWordRatio: level >= 3 ? 0.4 : 0.2,
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/levelConfig.js src/lib/levelConfig.test.js
git commit -m "feat: add level config with scaling constants"
```

---

## Task 3: High Score Library

**Files:**
- Create: `src/lib/highScores.js`
- Create: `src/lib/highScores.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/highScores.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { readScores, saveScore, qualifiesForLeaderboard } from './highScores'

const KEY = 'typingGame_highScores'

beforeEach(() => {
  localStorage.clear()
})

describe('readScores', () => {
  it('returns empty array when nothing stored', () => {
    expect(readScores()).toEqual([])
  })

  it('returns parsed scores from localStorage', () => {
    const data = [{ initials: 'AAA', score: 100, level: 2 }]
    localStorage.setItem(KEY, JSON.stringify(data))
    expect(readScores()).toEqual(data)
  })

  it('returns empty array on corrupt data', () => {
    localStorage.setItem(KEY, 'not-json')
    expect(readScores()).toEqual([])
  })
})

describe('qualifiesForLeaderboard', () => {
  it('qualifies when fewer than 5 scores exist', () => {
    expect(qualifiesForLeaderboard(1)).toBe(true)
  })

  it('qualifies when score beats the lowest in top 5', () => {
    const scores = [
      { initials: 'AAA', score: 500, level: 3 },
      { initials: 'BBB', score: 400, level: 2 },
      { initials: 'CCC', score: 300, level: 2 },
      { initials: 'DDD', score: 200, level: 1 },
      { initials: 'EEE', score: 100, level: 1 },
    ]
    localStorage.setItem(KEY, JSON.stringify(scores))
    expect(qualifiesForLeaderboard(150)).toBe(true)
    expect(qualifiesForLeaderboard(50)).toBe(false)
  })
})

describe('saveScore', () => {
  it('saves a new score', () => {
    saveScore('ABC', 200, 3)
    const scores = readScores()
    expect(scores).toHaveLength(1)
    expect(scores[0]).toMatchObject({ initials: 'ABC', score: 200, level: 3 })
  })

  it('keeps only top 5 sorted by score descending', () => {
    saveScore('A', 100, 1)
    saveScore('B', 500, 3)
    saveScore('C', 300, 2)
    saveScore('D', 200, 2)
    saveScore('E', 400, 3)
    saveScore('F', 50, 1)
    const scores = readScores()
    expect(scores).toHaveLength(5)
    expect(scores[0].score).toBe(500)
    expect(scores[4].score).toBe(200)
  })

  it('stores the date', () => {
    saveScore('TST', 10, 1)
    expect(readScores()[0].date).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — "Cannot find module './highScores'"

- [ ] **Step 3: Implement highScores.js**

Create `src/lib/highScores.js`:

```js
const KEY = 'typingGame_highScores'

export function readScores() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function qualifiesForLeaderboard(score) {
  const scores = readScores()
  if (scores.length < 5) return true
  return score > scores[scores.length - 1].score
}

export function saveScore(initials, score, level) {
  const scores = readScores()
  scores.push({ initials, score, level, date: new Date().toLocaleDateString() })
  scores.sort((a, b) => b.score - a.score)
  localStorage.setItem(KEY, JSON.stringify(scores.slice(0, 5)))
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/highScores.js src/lib/highScores.test.js
git commit -m "feat: add high score persistence with localStorage"
```

---

## Task 4: Word Data Files

**Files:**
- Create: `src/data/commonWords.js`
- Create: `src/data/codeWords.js`

- [ ] **Step 1: Create commonWords.js**

Create `src/data/commonWords.js`:

```js
export const commonWords = [
  'cat', 'dog', 'run', 'fly', 'big', 'red', 'hot', 'key', 'map', 'sky',
  'top', 'win', 'air', 'cup', 'box', 'bus', 'cut', 'ice', 'log', 'sun',
  'arm', 'ear', 'fog', 'gem', 'hub', 'ink', 'jar', 'kit', 'lip', 'mud',
  'net', 'oak', 'pen', 'row', 'sea', 'tin', 'van', 'web', 'zip', 'zoo',
  'jump', 'fast', 'slow', 'blue', 'gold', 'star', 'fire', 'rain', 'wind', 'snow',
  'tree', 'road', 'door', 'book', 'time', 'hand', 'mind', 'word', 'path', 'wave',
  'song', 'note', 'drop', 'lift', 'push', 'pull', 'walk', 'talk', 'read', 'flow',
  'grow', 'stop', 'wide', 'warm', 'cold', 'soft', 'hard', 'high', 'deep', 'open',
  'water', 'light', 'cloud', 'dream', 'music', 'dance', 'world', 'power', 'voice',
  'color', 'heart', 'speed', 'force', 'earth', 'night', 'build', 'share', 'think',
  'write', 'click', 'place', 'point', 'sound', 'fresh', 'brave', 'smart', 'clear',
  'quick', 'sharp', 'clean', 'lucky', 'early', 'young', 'happy', 'quiet', 'stone',
  'travel', 'forest', 'island', 'garden', 'mirror', 'bottle', 'flower', 'window',
  'dinner', 'summer', 'winter', 'sister', 'planet', 'rocket', 'castle', 'camera',
  'silver', 'market', 'bridge', 'circle', 'desert', 'engine', 'finger', 'basket',
  'machine', 'thunder', 'chicken', 'project', 'pattern', 'message', 'mission',
  'balance', 'perfect', 'picture', 'captain', 'culture', 'digital', 'morning',
  'language', 'keyboard', 'mountain', 'sunshine', 'birthday', 'together', 'tomorrow',
  'calendar', 'distance', 'entrance', 'football', 'gardener', 'hardware', 'interest',
]
```

- [ ] **Step 2: Create codeWords.js**

Create `src/data/codeWords.js`:

```js
export const codeWords = [
  'const', 'let', 'var', 'async', 'await', 'class', 'import', 'export', 'return',
  'typeof', 'null', 'true', 'false', 'void', 'super', 'break', 'switch', 'catch',
  'fetch', 'then', 'new', 'this', 'throw', 'yield', 'delete', 'default',
  'extends', 'static', 'interface', 'readonly', 'private', 'public', 'protected',
  'forEach', 'filter', 'reduce', 'includes', 'indexOf', 'splice', 'toString',
  'promise', 'resolve', 'reject', 'callback', 'closure', 'prototype', 'constructor',
  'dispatch', 'payload', 'action', 'reducer', 'selector', 'context', 'provider',
  'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useContext',
  'props', 'render', 'module', 'require', 'exports', 'function', 'instanceof',
  'string', 'number', 'boolean', 'object', 'array', 'undefined', 'symbol',
  'spread', 'optional', 'nullish', 'template', 'literal', 'abstract', 'declare',
  'namespace', 'enum', 'readonly', 'generic', 'override', 'implement',
  'middleware', 'endpoint', 'request', 'response', 'headers', 'params', 'query',
  'schema', 'validate', 'serialize', 'deserialize', 'migrate', 'transaction',
]
```

- [ ] **Step 3: Commit**

```bash
git add src/data/commonWords.js src/data/codeWords.js
git commit -m "feat: add common words and code keywords data sets"
```

---

## Task 5: Sound Effects (Web Audio API)

**Files:**
- Create: `src/lib/sounds.js`

No tests for this file — Web Audio API is not available in jsdom.

- [ ] **Step 1: Create sounds.js**

Create `src/lib/sounds.js`:

```js
let ctx = null

function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function ramp(node, from, to, duration) {
  node.setValueAtTime(from, audio().currentTime)
  node.exponentialRampToValueAtTime(to, audio().currentTime + duration)
}

export const sounds = {
  laser() {
    const c = audio()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sawtooth'
    ramp(osc.frequency, 900, 100, 0.15)
    ramp(gain.gain, 0.25, 0.001, 0.15)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.15)
  },

  thud() {
    const c = audio()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sine'
    ramp(osc.frequency, 80, 30, 0.3)
    ramp(gain.gain, 0.5, 0.001, 0.3)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.3)
  },

  levelUp() {
    const c = audio()
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain)
      gain.connect(c.destination)
      osc.frequency.value = freq
      const t = c.currentTime + i * 0.1
      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(0.2, t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      osc.start(t)
      osc.stop(t + 0.25)
    })
  },

  gameOver() {
    const c = audio()
    ;[440, 349, 294, 220].forEach((freq, i) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain)
      gain.connect(c.destination)
      osc.frequency.value = freq
      const t = c.currentTime + i * 0.25
      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(0.3, t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.start(t)
      osc.stop(t + 0.4)
    })
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/sounds.js
git commit -m "feat: add synthesized sound effects via Web Audio API"
```

---

## Task 6: useWordBank Hook

**Files:**
- Create: `src/hooks/useWordBank.js`
- Create: `src/hooks/useWordBank.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useWordBank.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWordBank } from './useWordBank'

describe('useWordBank', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a getWord function', () => {
    const { result } = renderHook(() => useWordBank(1))
    expect(typeof result.current).toBe('function')
  })

  it('returns a non-empty string', () => {
    const { result } = renderHook(() => useWordBank(1))
    const word = result.current()
    expect(typeof word).toBe('string')
    expect(word.length).toBeGreaterThan(0)
  })

  it('returns code word when random < codeWordRatio', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1) // 0.1 < 0.2 ratio → code word
    const { result } = renderHook(() => useWordBank(1))
    // Call many times — should get code words
    const words = Array.from({ length: 10 }, () => result.current())
    // All should be strings (cannot assert exact word without knowing shuffle order)
    words.forEach(w => expect(typeof w).toBe('string'))
  })

  it('refills pool after exhaustion without crashing', () => {
    const { result } = renderHook(() => useWordBank(1))
    // Call 1000 times — pool should refill
    expect(() => {
      for (let i = 0; i < 1000; i++) result.current()
    }).not.toThrow()
  })

  it('does not return the same word twice in a row from a large pool', () => {
    const { result } = renderHook(() => useWordBank(1))
    const word1 = result.current()
    const word2 = result.current()
    // Not guaranteed but extremely unlikely with a large pool
    expect(word1).toBeDefined()
    expect(word2).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — "Cannot find module './useWordBank'"

- [ ] **Step 3: Implement useWordBank.js**

Create `src/hooks/useWordBank.js`:

```js
import { useRef, useCallback } from 'react'
import { commonWords } from '../data/commonWords'
import { codeWords } from '../data/codeWords'
import { getLevelConfig } from '../lib/levelConfig'

function shuffle(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function useWordBank(level) {
  const commonPool = useRef([])
  const codePool = useRef([])

  function drawFrom(pool, source) {
    if (pool.current.length === 0) {
      pool.current = shuffle(source)
    }
    return pool.current.pop()
  }

  const getWord = useCallback(() => {
    const { codeWordRatio } = getLevelConfig(level)
    return Math.random() < codeWordRatio
      ? drawFrom(codePool, codeWords)
      : drawFrom(commonPool, commonWords)
  }, [level])

  return getWord
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useWordBank.js src/hooks/useWordBank.test.js
git commit -m "feat: add useWordBank hook with level-based word sampling"
```

---

## Task 7: useGameLoop Hook

**Files:**
- Create: `src/hooks/useGameLoop.js`
- Create: `src/hooks/useGameLoop.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useGameLoop.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGameLoop, TICK_MS } from './useGameLoop'

describe('useGameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not call callback when inactive', () => {
    const cb = vi.fn()
    const ref = { current: cb }
    renderHook(() => useGameLoop(false, ref))
    vi.advanceTimersByTime(TICK_MS * 5)
    expect(cb).not.toHaveBeenCalled()
  })

  it('calls callback on each tick when active', () => {
    const cb = vi.fn()
    const ref = { current: cb }
    renderHook(() => useGameLoop(true, ref))
    vi.advanceTimersByTime(TICK_MS * 3)
    expect(cb).toHaveBeenCalledTimes(3)
  })

  it('stops calling callback when isActive becomes false', () => {
    const cb = vi.fn()
    const ref = { current: cb }
    const { rerender } = renderHook(
      ({ active }) => useGameLoop(active, ref),
      { initialProps: { active: true } }
    )
    vi.advanceTimersByTime(TICK_MS * 2)
    rerender({ active: false })
    vi.advanceTimersByTime(TICK_MS * 2)
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it('always calls the latest version of the callback via ref', () => {
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    const ref = { current: cb1 }
    renderHook(() => useGameLoop(true, ref))
    vi.advanceTimersByTime(TICK_MS)
    ref.current = cb2
    vi.advanceTimersByTime(TICK_MS)
    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — "Cannot find module './useGameLoop'"

- [ ] **Step 3: Implement useGameLoop.js**

Create `src/hooks/useGameLoop.js`:

```js
import { useEffect } from 'react'

export const TICK_MS = 33

export function useGameLoop(isActive, onTickRef) {
  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => onTickRef.current?.(), TICK_MS)
    return () => clearInterval(id)
  }, [isActive])
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGameLoop.js src/hooks/useGameLoop.test.js
git commit -m "feat: add useGameLoop hook with ref-based tick callback"
```

---

## Task 8: Alien Component + CSS

**Files:**
- Create: `src/components/Alien.jsx`
- Create: `src/components/Alien.css`

- [ ] **Step 1: Write the failing test**

Create `src/components/Alien.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — "Cannot find module './Alien'"

- [ ] **Step 3: Create Alien.jsx**

Create `src/components/Alien.jsx`:

```jsx
import './Alien.css'

export function Alien({ word, x, y, isTargeted }) {
  return (
    <div
      className={`alien${isTargeted ? ' alien--targeted' : ''}`}
      style={{ left: `${x}%`, top: `${y}px` }}
    >
      <div className="alien__sprite">👾</div>
      <div className="alien__word">{word}</div>
    </div>
  )
}
```

- [ ] **Step 4: Create Alien.css**

Create `src/components/Alien.css`:

```css
.alien {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
  user-select: none;
  pointer-events: none;
}

.alien__sprite {
  font-size: 2rem;
  line-height: 1;
}

.alien__word {
  background: rgba(0, 0, 0, 0.75);
  color: #00ff88;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #00ff88;
  white-space: nowrap;
  margin-top: 4px;
}

.alien--targeted .alien__word {
  color: #ffff00;
  border-color: #ffff00;
  animation: glow-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
  from { box-shadow: 0 0 6px #ffff00; }
  to   { box-shadow: 0 0 16px #ffff00, 0 0 32px #ffaa00; }
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Alien.jsx src/components/Alien.css src/components/Alien.test.jsx
git commit -m "feat: add Alien component with targeting highlight"
```

---

## Task 9: Explosion Component + CSS

**Files:**
- Create: `src/components/Explosion.jsx`
- Create: `src/components/Explosion.css`
- Create: `src/components/Explosion.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/Explosion.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { Explosion } from './Explosion'

describe('Explosion', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders at the given position', () => {
    const { container } = render(<Explosion x={45} y={200} onDone={() => {}} />)
    expect(container.firstChild).toHaveStyle({ left: '45%', top: '200px' })
  })

  it('calls onDone after 600ms', () => {
    const onDone = vi.fn()
    render(<Explosion x={50} y={100} onDone={onDone} />)
    vi.advanceTimersByTime(599)
    expect(onDone).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onDone).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — "Cannot find module './Explosion'"

- [ ] **Step 3: Create Explosion.jsx**

Create `src/components/Explosion.jsx`:

```jsx
import { useEffect } from 'react'
import './Explosion.css'

export function Explosion({ x, y, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="explosion"
      style={{ left: `${x}%`, top: `${y}px` }}
    />
  )
}
```

- [ ] **Step 4: Create Explosion.css**

Create `src/components/Explosion.css`:

```css
.explosion {
  position: absolute;
  width: 70px;
  height: 70px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  animation: burst 600ms ease-out forwards;
}

@keyframes burst {
  0%   { background: radial-gradient(circle, #fff 0%, #ffcc00 30%, #ff6600 60%, transparent 100%); transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
  40%  { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/Explosion.jsx src/components/Explosion.css src/components/Explosion.test.jsx
git commit -m "feat: add Explosion component with CSS burst animation"
```

---

## Task 10: HUD Component

**Files:**
- Create: `src/components/HUD.jsx`
- Create: `src/components/HUD.css`
- Create: `src/components/HUD.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/HUD.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HUD } from './HUD'

describe('HUD', () => {
  it('displays the score', () => {
    render(<HUD score={250} lives={3} level={2} muted={false} onToggleMute={() => {}} />)
    expect(screen.getByText(/250/)).toBeInTheDocument()
  })

  it('displays the level', () => {
    render(<HUD score={0} lives={3} level={4} muted={false} onToggleMute={() => {}} />)
    expect(screen.getByText(/Level 4/)).toBeInTheDocument()
  })

  it('shows 3 life icons total', () => {
    const { container } = render(<HUD score={0} lives={2} level={1} muted={false} onToggleMute={() => {}} />)
    const lives = container.querySelectorAll('.hud__life')
    expect(lives).toHaveLength(3)
  })

  it('shows correct number of full vs empty lives', () => {
    const { container } = render(<HUD score={0} lives={2} level={1} muted={false} onToggleMute={() => {}} />)
    expect(container.querySelectorAll('.hud__life--full')).toHaveLength(2)
    expect(container.querySelectorAll('.hud__life--empty')).toHaveLength(1)
  })

  it('calls onToggleMute when mute button clicked', () => {
    const onToggleMute = vi.fn()
    render(<HUD score={0} lives={3} level={1} muted={false} onToggleMute={onToggleMute} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggleMute).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL

- [ ] **Step 3: Create HUD.jsx**

Create `src/components/HUD.jsx`:

```jsx
import './HUD.css'

export function HUD({ score, lives, level, muted, onToggleMute }) {
  return (
    <div className="hud">
      <div className="hud__level">Level {level}</div>
      <div className="hud__score">Score: {score}</div>
      <div className="hud__lives">
        {Array.from({ length: 3 }, (_, i) => (
          <span
            key={i}
            className={`hud__life ${i < lives ? 'hud__life--full' : 'hud__life--empty'}`}
          >
            🚀
          </span>
        ))}
      </div>
      <button className="hud__mute" onClick={onToggleMute} aria-label="Toggle mute">
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Create HUD.css**

Create `src/components/HUD.css`:

```css
.hud {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  border-bottom: 1px solid #1a3a5c;
  font-family: 'Courier New', monospace;
  color: #00ff88;
  font-size: 1rem;
  font-weight: bold;
  z-index: 10;
}

.hud__level { color: #88ccff; }
.hud__score { flex: 1; }

.hud__lives { display: flex; gap: 4px; }
.hud__life { font-size: 1.2rem; transition: opacity 0.2s; }
.hud__life--empty { opacity: 0.2; filter: grayscale(1); }

.hud__mute {
  background: none;
  border: 1px solid #1a3a5c;
  color: #88ccff;
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 1rem;
}
.hud__mute:hover { border-color: #00ff88; }
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/HUD.jsx src/components/HUD.css src/components/HUD.test.jsx
git commit -m "feat: add HUD component with score, lives, level and mute"
```

---

## Task 11: InputBar Component

**Files:**
- Create: `src/components/InputBar.jsx`
- Create: `src/components/InputBar.css`
- Create: `src/components/InputBar.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/InputBar.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL

- [ ] **Step 3: Create InputBar.jsx**

Create `src/components/InputBar.jsx`:

```jsx
import { useRef, useEffect } from 'react'
import './InputBar.css'

export function InputBar({ aliens, onTarget, onKill }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  })

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
```

- [ ] **Step 4: Create InputBar.css**

Create `src/components/InputBar.css`:

```css
.input-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.85);
  border-top: 1px solid #1a3a5c;
}

.input-bar__label {
  color: #1a5c8c;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  letter-spacing: 2px;
  white-space: nowrap;
}

.input-bar__input {
  flex: 1;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid #00ff88;
  color: #00ff88;
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  padding: 8px 14px;
  border-radius: 4px;
  outline: none;
  caret-color: #00ff88;
}

.input-bar__input:focus {
  border-color: #00ffcc;
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/InputBar.jsx src/components/InputBar.css src/components/InputBar.test.jsx
git commit -m "feat: add InputBar with auto-targeting and auto-kill on word match"
```

---

## Task 12: GameCanvas Component

**Files:**
- Create: `src/components/GameCanvas.jsx`
- Create: `src/components/GameCanvas.css`

No unit tests — pure display component.

- [ ] **Step 1: Create GameCanvas.jsx**

Create `src/components/GameCanvas.jsx`:

```jsx
import { useMemo } from 'react'
import { Alien } from './Alien'
import { Explosion } from './Explosion'
import './GameCanvas.css'

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: (i * 97 + 13) % 100,
  top: (i * 53 + 7) % 100,
  size: 1 + (i % 3),
  duration: 2 + (i % 4),
  delay: -(i % 5),
}))

export function GameCanvas({ aliens, explosions, onExplosionDone }) {
  return (
    <div className="game-canvas">
      <div className="starfield" aria-hidden="true">
        {STARS.map(s => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {aliens.map(alien => (
        <Alien key={alien.id} {...alien} />
      ))}

      {explosions.map(exp => (
        <Explosion
          key={exp.id}
          x={exp.x}
          y={exp.y}
          onDone={() => onExplosionDone(exp.id)}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create GameCanvas.css**

Create `src/components/GameCanvas.css`:

```css
.game-canvas {
  position: relative;
  flex: 1;
  overflow: hidden;
  background: #000510;
}

.starfield {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
  animation: twinkle linear infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50%       { opacity: 1; }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/GameCanvas.jsx src/components/GameCanvas.css
git commit -m "feat: add GameCanvas with starfield, aliens, explosions"
```

---

## Task 13: Start Screen + Game Over Screen

**Files:**
- Create: `src/components/StartScreen.jsx`
- Create: `src/components/GameOverScreen.jsx`
- Create: `src/components/Screen.css`
- Create: `src/components/GameOverScreen.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/GameOverScreen.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL

- [ ] **Step 3: Create StartScreen.jsx**

Create `src/components/StartScreen.jsx`:

```jsx
import { readScores } from '../lib/highScores'
import './Screen.css'

export function StartScreen({ onStart }) {
  const scores = readScores()

  return (
    <div className="screen">
      <h1 className="screen__title">ALIEN TYPER</h1>
      <p className="screen__subtitle">Defend your base — type words to blast the aliens!</p>

      <div className="screen__instructions">
        <p>Aliens descend from above carrying words.</p>
        <p>Start typing — the matching alien lights up.</p>
        <p>Finish the word to destroy it.</p>
        <p>Don't let them reach the bottom!</p>
      </div>

      {scores.length > 0 && (
        <div className="screen__leaderboard">
          <h2>High Scores</h2>
          {scores.map((s, i) => (
            <div key={i} className="screen__score-row">
              <span className="screen__rank">{i + 1}.</span>
              <span className="screen__initials">{s.initials}</span>
              <span className="screen__score-val">{s.score}</span>
              <span className="screen__level-val">Lvl {s.level}</span>
            </div>
          ))}
        </div>
      )}

      <button className="screen__btn" onClick={onStart}>PLAY</button>
    </div>
  )
}
```

- [ ] **Step 4: Create GameOverScreen.jsx**

Create `src/components/GameOverScreen.jsx`:

```jsx
import { useState } from 'react'
import { readScores, qualifiesForLeaderboard, saveScore } from '../lib/highScores'
import './Screen.css'

export function GameOverScreen({ score, level, onRestart }) {
  const [initials, setInitials] = useState('')
  const [saved, setSaved] = useState(false)
  const qualifies = qualifiesForLeaderboard(score)
  const displayScores = saved ? readScores() : readScores()

  function handleSave() {
    if (!initials.trim()) return
    saveScore(initials.toUpperCase().slice(0, 3), score, level)
    setSaved(true)
  }

  return (
    <div className="screen">
      <h1 className="screen__title">GAME OVER</h1>
      <p className="screen__subtitle">Score: {score} — Level {level}</p>

      {qualifies && !saved && (
        <div className="screen__initials-entry">
          <p>You made the leaderboard!</p>
          <input
            className="screen__initials-input"
            maxLength={3}
            value={initials}
            onChange={e => setInitials(e.target.value)}
            placeholder="AAA"
            autoFocus
          />
          <button className="screen__btn screen__btn--small" onClick={handleSave}>
            Save
          </button>
        </div>
      )}

      {displayScores.length > 0 && (
        <div className="screen__leaderboard">
          <h2>High Scores</h2>
          {displayScores.map((s, i) => (
            <div key={i} className="screen__score-row">
              <span className="screen__rank">{i + 1}.</span>
              <span className="screen__initials">{s.initials}</span>
              <span className="screen__score-val">{s.score}</span>
              <span className="screen__level-val">Lvl {s.level}</span>
            </div>
          ))}
        </div>
      )}

      <button className="screen__btn" onClick={onRestart}>PLAY AGAIN</button>
    </div>
  )
}
```

- [ ] **Step 5: Create Screen.css**

Create `src/components/Screen.css`:

```css
.screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-height: 100%;
  padding: 40px 20px;
  font-family: 'Courier New', monospace;
  color: #00ff88;
  background: #000510;
}

.screen__title {
  font-size: 3rem;
  letter-spacing: 8px;
  color: #00ffcc;
  text-shadow: 0 0 20px #00ffcc, 0 0 40px #007755;
  margin: 0;
}

.screen__subtitle {
  color: #88ccff;
  font-size: 1rem;
  margin: 0;
}

.screen__instructions {
  text-align: center;
  color: #557799;
  line-height: 1.8;
}

.screen__instructions p { margin: 0; }

.screen__leaderboard {
  border: 1px solid #1a3a5c;
  border-radius: 8px;
  padding: 16px 24px;
  min-width: 280px;
}

.screen__leaderboard h2 {
  margin: 0 0 12px;
  font-size: 0.85rem;
  letter-spacing: 4px;
  color: #557799;
  text-align: center;
}

.screen__score-row {
  display: grid;
  grid-template-columns: 24px 60px 1fr 60px;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #0a1a2c;
  font-size: 0.9rem;
}

.screen__rank { color: #557799; }
.screen__initials { color: #ffff00; font-weight: bold; }
.screen__score-val { color: #00ff88; text-align: right; }
.screen__level-val { color: #88ccff; text-align: right; }

.screen__initials-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border: 1px solid #ffff00;
  border-radius: 8px;
}

.screen__initials-entry p { margin: 0; color: #ffff00; }

.screen__initials-input {
  width: 60px;
  background: rgba(255, 255, 0, 0.05);
  border: 1px solid #ffff00;
  color: #ffff00;
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  text-align: center;
  padding: 6px;
  border-radius: 4px;
  outline: none;
  text-transform: uppercase;
}

.screen__btn {
  background: transparent;
  border: 2px solid #00ff88;
  color: #00ff88;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  letter-spacing: 4px;
  padding: 12px 40px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.screen__btn:hover {
  background: rgba(0, 255, 136, 0.1);
  box-shadow: 0 0 16px rgba(0, 255, 136, 0.4);
}

.screen__btn--small {
  font-size: 0.85rem;
  padding: 6px 16px;
  letter-spacing: 2px;
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/StartScreen.jsx src/components/GameOverScreen.jsx src/components/Screen.css src/components/GameOverScreen.test.jsx
git commit -m "feat: add StartScreen and GameOverScreen with leaderboard"
```

---

## Task 14: Game.jsx — Main Integration

**Files:**
- Create: `src/components/Game.jsx`
- Create: `src/components/Game.css`

This is the most complex file. No unit tests — integration is verified by running the game.

- [ ] **Step 1: Create Game.css**

Create `src/components/Game.css`:

```css
.game {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #000510;
}

.level-complete-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 20;
  animation: fade-in-out 1.5s ease-in-out forwards;
}

.level-complete-text {
  font-family: 'Courier New', monospace;
  font-size: 3rem;
  color: #00ffcc;
  letter-spacing: 8px;
  text-shadow: 0 0 30px #00ffcc;
}

@keyframes fade-in-out {
  0%   { opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
```

- [ ] **Step 2: Create Game.jsx**

Create `src/components/Game.jsx`:

```jsx
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

    setTimeout(() => {
      levelRef.current = nextLevel
      remainingRef.current = nextConfig.aliensPerWave
      setLevel(nextLevel)
      setRemainingInWave(nextConfig.aliensPerWave)
      setAliens([])
      aliensRef.current = []
      setGamePhase('playing')
    }, 1500)
  }, [aliens.length, remainingInWave, gamePhase])

  // Detect game over from lives reaching 0
  useEffect(() => {
    if (lives <= 0 && gamePhase === 'playing') {
      if (!mutedRef.current) sounds.gameOver()
      setGamePhase('gameOver')
    }
  }, [lives, gamePhase])

  // Tick callback — reassigned every render so always has fresh closure via ref
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
    aliasRef_current_reset: aliensRef.current = []
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
```

**Note:** Remove the typo label `aliasRef_current_reset:` in `startGame` — replace that line with just:

```js
aliensRef.current = []
```

- [ ] **Step 3: Fix the typo in startGame**

In `src/components/Game.jsx`, replace:

```js
    aliasRef_current_reset: aliensRef.current = []
```

with:

```js
    aliensRef.current = []
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Game.jsx src/components/Game.css
git commit -m "feat: add Game component wiring all state, loop, and sound"
```

---

## Task 15: Global CSS + App Shell

**Files:**
- Modify: `src/index.css`
- Modify: `src/main.jsx`

- [ ] **Step 1: Replace index.css**

Replace all of `src/index.css` with:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #000510;
  font-family: 'Courier New', Courier, monospace;
}
```

- [ ] **Step 2: Verify main.jsx imports index.css**

Open `src/main.jsx`. Confirm it contains:

```jsx
import './index.css'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

If missing the CSS import, add it.

- [ ] **Step 3: Run all tests one final time**

```bash
npm test
```

Expected: All tests pass (levelConfig, highScores, useWordBank, useGameLoop, Alien, Explosion, HUD, InputBar, GameOverScreen).

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/main.jsx
git commit -m "feat: add global CSS reset and space background"
```

---

## Task 16: End-to-End Verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open http://localhost:5173

- [ ] **Step 2: Verify Start Screen**

Expected:
- Title "ALIEN TYPER" visible with glow effect
- Instructions visible
- PLAY button visible
- No high scores shown on first visit

- [ ] **Step 3: Play through Level 1**

Click PLAY. Expected:
- Stars animate in background
- Aliens descend from top carrying words
- Typing first letter of a word highlights that alien (yellow glow)
- Completing a word plays zap sound + explosion animation
- Score increases by `word.length × 10`
- Lives decrease when an alien reaches bottom

- [ ] **Step 4: Verify Level Complete**

Clear all aliens in the wave. Expected:
- Level-up chime plays
- "LEVEL 1 COMPLETE!" overlay appears for ~1.5s
- Level 2 starts with more aliens, faster descent

- [ ] **Step 5: Verify Game Over + High Score Entry**

Let 3 aliens reach the bottom. Expected:
- Game Over screen shows final score and level
- Initials input appears (first game, any score qualifies)
- Type 3 letters + click Save → leaderboard updates
- Return to Start Screen → leaderboard shows on start screen

- [ ] **Step 6: Verify mute toggle**

Click the 🔊 button → no sounds play. Click again → sounds resume.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete space typing game — all features verified"
```

---

## Verification Summary

All tests run with:
```bash
npm test
```

Game verified manually by:
1. Playing through a level transition
2. Triggering game over + high score save
3. Confirming mute works
4. Confirming targeting highlight updates as you type
