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
