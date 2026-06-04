# Space Typing Game — Design Spec

**Date:** 2026-06-04  
**Status:** Approved

---

## Overview

A browser-based typing practice game with a space survival theme. Alien ships descend from the top of the screen, each labeled with a word. The player types words to destroy aliens before they reach the bottom. The game features level-based waves, sound effects, visual explosions, and a local high score leaderboard.

---

## Stack

| Concern | Choice |
|---------|--------|
| Framework | React 18 |
| Build tool | Vite |
| Audio | Howler.js |
| Styling | Plain CSS (CSS keyframe animations) |
| Persistence | LocalStorage |

No external state library. `useState` + `useRef` inside `Game.jsx` is sufficient.

---

## Project Structure

```
src/
  components/
    Game.jsx            ← main game shell, owns all state
    GameCanvas.jsx      ← space area where aliens descend
    Alien.jsx           ← single alien with word label
    InputBar.jsx        ← bottom input field
    HUD.jsx             ← score, lives, level display
    Explosion.jsx       ← CSS burst animation on kill
    StartScreen.jsx     ← title + high scores before game
    GameOverScreen.jsx  ← final score + leaderboard
  hooks/
    useGameLoop.js      ← setInterval tick: spawns & moves aliens
    useWordBank.js      ← loads and samples from word lists
  data/
    commonWords.js      ← ~500 common English words
    codeWords.js        ← ~200 programmer keywords + symbols
  sounds/               ← laser.mp3, thud.mp3, levelup.mp3, gameover.mp3
  App.jsx
```

---

## Architecture

State lives entirely in `Game.jsx` and flows down as props. No external state library needed.

**Game phases:** `start | playing | levelComplete | gameOver`

**Core state shape:**
```js
{
  gamePhase: 'start',
  level: 1,
  score: 0,
  lives: 3,
  aliens: [{ id, word, x, y, isTargeted }],
  explosions: [{ id, x, y }],
}
```

---

## Core Game Loop & Mechanics

1. Player sees **Start Screen** → clicks "Play" → Level 1 begins
2. Aliens spawn from the top at random horizontal positions and descend
3. Player types in **InputBar** — the matching alien highlights in real time
4. Full word typed correctly → alien **explodes**, score increases
5. Alien reaches the bottom → player loses 1 life, alien disappears
6. Player starts with **3 lives** (displayed as ship icons in HUD)
7. All aliens in wave cleared → **Level Complete** → next level starts
8. All 3 lives lost → **Game Over** screen with score + high score entry

### Level Scaling

| Level | Aliens per wave | Descend speed | Max simultaneous |
|-------|----------------|---------------|-----------------|
| 1 | 10 | Slow (60s to cross) | 3 |
| 2 | 15 | Medium (45s to cross) | 4 |
| 3+ | +5 per level | +10% faster per level | up to 6 |

### Word Selection

- Levels 1–2: 80% common English words, 20% code keywords
- Level 3+: 60% common English words, 40% code keywords
- Words are sampled without repetition within a wave; shuffled each wave

---

## Components

### `Game.jsx`
Owns all state. Passes handlers and state down as props. Manages phase transitions (start → playing → levelComplete → gameOver). Renders the correct screen based on `gamePhase`.

### `GameCanvas.jsx`
Renders starfield background + maps `aliens[]` to `<Alien>` components. Pure display — no logic. Also renders active `<Explosion>` components.

### `Alien.jsx`
Displays a word label on a pixel-art alien sprite (CSS/SVG, no external images). Accepts `isTargeted` prop — when true, renders with a pulsing yellow glow border. Position set via absolute CSS using `x` and `y` from state. Downward movement handled by `useGameLoop` updating `y` each tick.

### `InputBar.jsx`
A single `<input>` always focused. On each keystroke:
- Finds the alien whose word starts with the current input value
- Fires `onTarget(alienId)` to mark it as targeted
- On full word match (input === alien.word), **auto-fires** `onKill(alienId)` and clears input immediately — no Enter key required. This keeps the game flow fast.

### `HUD.jsx`
Displays score, level number, and 3 life icons (filled/empty ship icons). Includes a mute toggle button. Pure display.

### `Explosion.jsx`
Rendered at the killed alien's `(x, y)` position. CSS `@keyframes` radial burst (orange → red → transparent). Lasts 600ms then unmounts. Triggered by `Game.jsx` when `onKill` fires.

### `StartScreen.jsx`
Title, brief instructions ("Type the words to destroy the aliens!"), and top 5 high scores from LocalStorage. "Play" button transitions to `playing` phase.

### `GameOverScreen.jsx`
Displays final score and level reached. If score qualifies for top 5, prompts for 3-character initials, saves to LocalStorage, then displays updated leaderboard. "Play Again" button resets to `start` phase.

---

## Data Flow

```
Game.jsx (state owner)
  ├── → GameCanvas → Alien[]  (render aliens at positions)
  ├── → GameCanvas → Explosion[] (render active explosions)
  ├── → HUD  (score, lives, level, mute)
  ├── → InputBar → onTarget(id) / onKill(id) → Game.jsx updates state
  ├── → StartScreen → onStart() → Game.jsx sets phase = 'playing'
  └── → GameOverScreen → onRestart() → Game.jsx resets state
```

---

## Hooks

### `useGameLoop({ aliens, level, isActive, remainingInWave, onAliensUpdate, onAlienEscaped, onSpawnAlien, getWord })`
Runs a `setInterval` at 50ms when `isActive` is true. Each tick:
1. Moves each alien down by `speed` px (speed derived from level) → calls `onAliensUpdate(updatedAliens)`
2. Checks if any alien's `y >= bottomBoundary` → calls `onAlienEscaped(alienId)`
3. If active alien count < wave max AND `remainingInWave > 0`, calls `onSpawnAlien(getWord())` to add a new alien at random `x`

### `useWordBank(level)`
Returns a `getWord()` function. Maintains an internal pool — samples without replacement within a wave, refills and reshuffles when exhausted. Mix ratio adjusts based on level (see Word Selection above).

---

## Audio

All sounds loaded once at game start via Howler.js. Mute state stored in component state (not persisted).

| Event | Sound file |
|-------|-----------|
| Alien destroyed | `laser.mp3` — short zap |
| Alien reaches bottom | `thud.mp3` — low warning tone |
| Level complete | `levelup.mp3` — upbeat chime |
| Game over | `gameover.mp3` — descending tone |

---

## Visual Effects

| Effect | Implementation |
|--------|---------------|
| Starfield | 80–100 absolutely-positioned `<div>` dots with randomised CSS animation durations/positions |
| Alien sprite | Pixel-art style SVG inline in `Alien.jsx` — no external image files |
| Targeting highlight | `box-shadow` pulsing yellow glow via `@keyframes` on `isTargeted` alien |
| Explosion | CSS `@keyframes` radial burst: orange → red → transparent, 600ms, then unmount |
| Level transition | Full-screen overlay with "LEVEL X" text, fades in/out over 1.5s |

---

## High Scores

**Storage key:** `typingGame_highScores`  
**Format:** `Array<{ initials: string, score: number, level: number, date: string }>` — max 5 entries, sorted descending by score.

**Flow:**
1. On game over, read current top 5 from LocalStorage
2. If `score > lowestTopScore` (or fewer than 5 entries exist), prompt for 3-char initials
3. Insert, re-sort, trim to 5, write back to LocalStorage
4. Display updated leaderboard on Game Over screen and Start screen

---

## Error Handling

- LocalStorage read failures (quota, private mode): catch silently, treat as empty leaderboard
- Audio load failures: catch silently, game continues without sound
- No network calls — fully offline capable

---

## Out of Scope

- Multiplayer
- User accounts / cloud sync
- Mobile/touch support
- Custom word list upload (can be added later)
