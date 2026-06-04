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
