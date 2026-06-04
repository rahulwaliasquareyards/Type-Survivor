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
