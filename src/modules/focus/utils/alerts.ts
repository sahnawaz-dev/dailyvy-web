/**
 * End-of-session alerts: a short chime (Web Audio, no sound file) and a
 * browser notification. Browsers only allow audio after a user gesture, so
 * `primeAlerts()` is called from the Start button.
 */
let audioContext: AudioContext | null = null

/** Must run inside a user gesture (click / key press) — after a reload too. */
export function unlockAudio() {
  try {
    audioContext ??= new AudioContext()
    if (audioContext.state === 'suspended') void audioContext.resume()
  } catch {
    // no Web Audio: alerts stay silent
  }
}

/** Call from the Start button: unlocks audio and asks for notification permission once. */
export function primeAlerts() {
  unlockAudio()
  if ('Notification' in window && Notification.permission === 'default') {
    void Notification.requestPermission()
  }
}

/** Three soft rising notes. */
export function playChime() {
  if (!audioContext) return
  const start = audioContext.currentTime
  ;[660, 880, 1046].forEach((frequency, i) => {
    const osc = audioContext!.createOscillator()
    const gain = audioContext!.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    const t = start + i * 0.18
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
    osc.connect(gain).connect(audioContext!.destination)
    osc.start(t)
    osc.stop(t + 0.55)
  })
}

/** Shows a system notification when the page isn't visible (toasts cover the visible case). */
export function notify(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if (document.visibilityState === 'visible') return
  try {
    const notification = new Notification(title, { body, tag: 'habit-tracker-focus' })
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch {
    // some mobile browsers only allow notifications from a service worker
  }
}
