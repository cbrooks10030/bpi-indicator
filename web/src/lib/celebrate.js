import confetti from 'canvas-confetti'

export function celebrate(level) {
  const options =
    level === 'green'
      ? { particleCount: 140, spread: 90, colors: ['#10b981', '#6d4aff', '#ffffff'] }
      : { particleCount: 70, spread: 65, colors: ['#fbbf24', '#6d4aff', '#ffffff'] }

  confetti({ ...options, origin: { y: 0.7 }, disableForReducedMotion: true })
}
