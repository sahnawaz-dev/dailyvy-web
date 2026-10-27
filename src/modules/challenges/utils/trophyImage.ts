/**
 * A square "trophy card" image (1080×1080 PNG) for a completed challenge, drawn
 * on a canvas, and a helper that shares it (phone share sheet) or downloads it.
 */
import { formatDisplay } from '@/shared/utils/date'
import type { ChallengeBase } from '../types/challenges.types'

const SIZE = 1080
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null) // the card still works without the logo
    img.src = src
  })
}

/** Splits `text` into at most `maxLines` lines that fit `width`. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number, maxLines: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > width && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s+\S*$/, '')}…`
  }
  return lines
}

export async function drawTrophyImage(challenge: ChallengeBase): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const center = SIZE / 2

  // Deep green background with a warm glow behind the trophy
  const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE)
  bg.addColorStop(0, '#0f2a1f')
  bg.addColorStop(1, '#07130d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, SIZE, SIZE)
  const glow = ctx.createRadialGradient(center, 380, 20, center, 380, 420)
  glow.addColorStop(0, 'rgba(245, 158, 11, 0.45)')
  glow.addColorStop(1, 'rgba(245, 158, 11, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, SIZE, SIZE)
  const corner = ctx.createRadialGradient(SIZE, 0, 0, SIZE, 0, 700)
  corner.addColorStop(0, 'rgba(34, 197, 94, 0.25)')
  corner.addColorStop(1, 'rgba(34, 197, 94, 0)')
  ctx.fillStyle = corner
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Confetti dots
  const colors = ['#f59e0b', '#22c55e', '#fde68a', '#86efac', '#fbbf24']
  for (let i = 0; i < 40; i += 1) {
    ctx.fillStyle = colors[i % colors.length]
    ctx.globalAlpha = 0.5
    const x = (i * 197) % SIZE
    const y = (i * 131) % 330
    ctx.beginPath()
    ctx.arc(x, y + 20, 5 + (i % 4) * 2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `240px ${FONT}`
  ctx.fillText('🏆', center, 380)

  ctx.fillStyle = '#f59e0b'
  ctx.font = `700 34px ${FONT}`
  ctx.fillText('CHALLENGE COMPLETE', center, 590)

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 104px ${FONT}`
  ctx.fillText(`${challenge.lengthDays} days`, center, 690)

  ctx.font = `600 48px ${FONT}`
  ctx.fillStyle = '#e5f4ec'
  const title = `${challenge.icon ? `${challenge.icon} ` : ''}${challenge.title}`
  wrap(ctx, title, SIZE - 200, 2).forEach((line, i) => ctx.fillText(line, center, 790 + i * 60))

  if (challenge.reachedOn) {
    ctx.font = `400 34px ${FONT}`
    ctx.fillStyle = '#9fbfae'
    const range = `${formatDisplay(challenge.startDate, { day: 'numeric', month: 'short' })} → ${formatDisplay(
      challenge.reachedOn,
      { day: 'numeric', month: 'short', year: 'numeric' },
    )} · every single day`
    ctx.fillText(range, center, 920)
  }

  // Brand
  const logo = await loadImage('/icons/icon-192.png')
  ctx.font = `700 38px ${FONT}`
  ctx.fillStyle = '#ffffff'
  const brand = 'Dailyvy'
  const brandWidth = ctx.measureText(brand).width
  const logoSize = 52
  const startX = center - (brandWidth + logoSize + 16) / 2
  if (logo) ctx.drawImage(logo, startX, 1000 - logoSize / 2, logoSize, logoSize)
  ctx.textAlign = 'left'
  ctx.fillText(brand, startX + (logo ? logoSize + 16 : 0), 1002)

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image'))), 'image/png'),
  )
}

/** Opens the share sheet (phones) or downloads the trophy image. */
export async function shareTrophy(challenge: ChallengeBase) {
  const blob = await drawTrophyImage(challenge)
  const fileName = `dailyvy-${challenge.lengthDays}-day-trophy.png`
  const file = new File([blob], fileName, { type: 'image/png' })
  const text = `I completed a ${challenge.lengthDays}-day challenge: ${challenge.title}! 🏆 #Dailyvy`

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'My Dailyvy trophy', text })
      return 'shared' as const
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'cancelled' as const
      // fall through to a download
    }
  }
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded' as const
}
