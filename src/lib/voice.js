export function speak(word) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.rate = 1.0
  utterance.pitch = 1.0
  utterance.volume = 1.0
  window.speechSynthesis.speak(utterance)
}

export function cancelSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
