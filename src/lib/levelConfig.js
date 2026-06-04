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
