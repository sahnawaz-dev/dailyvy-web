/**
 * Full-screen "🎉" overlay with falling confetti (habits: all done today;
 * focus: daily goal reached). Auto-dismisses after a few seconds, or on
 * click / Escape. When it shows is up to the caller.
 */
import { useEffect } from 'react'
import { Card, CardContent } from '@/shared/components/ui/card'

const DURATION_MS = 2600
const CONFETTI = ['🎉', '✨', '🎊', '⭐', '💪', '🔥', '🎉', '✨', '🎊', '⭐', '🏆', '🌟']

interface CelebrationOverlayProps {
  visible: boolean
  onHide: () => void
  title: string
  message: string
  emoji?: string
}

export function CelebrationOverlay({ visible, onHide, title, message, emoji = '🎉' }: CelebrationOverlayProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onHide, DURATION_MS)
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onHide()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [visible, onHide])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 grid cursor-pointer place-items-center bg-black/40 animate-in fade-in-0"
      onClick={onHide}
      role="status"
      aria-live="assertive"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {CONFETTI.map((piece, i) => (
          <span
            key={i}
            className="absolute -top-10 animate-confetti-fall text-2xl motion-reduce:hidden"
            style={{ left: `${4 + i * 8}%`, animationDelay: `${i * 80}ms` }}
          >
            {piece}
          </span>
        ))}
      </div>
      <Card className="px-10 text-center duration-300 animate-in zoom-in-75">
        <CardContent className="flex flex-col items-center gap-1">
          <span className="text-6xl motion-safe:animate-bounce" aria-hidden="true">
            {emoji}
          </span>
          <p className="mt-2 font-heading text-3xl font-bold">{title}</p>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}
