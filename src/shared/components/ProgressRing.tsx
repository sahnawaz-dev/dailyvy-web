import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface ProgressRingProps {
  /** 0..1 */
  value: number
  size?: number
  stroke?: number
  /** Colour of the filled arc (a text-* class, used via currentColor). */
  className?: string
  label: string
  children?: ReactNode
}

/** Circular progress (SVG) with content in the middle. */
export function ProgressRing({ value, size = 180, stroke = 12, className, label, children }: ProgressRingProps) {
  const radius = (size - stroke) / 2
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${percent} 100`}
          stroke="currentColor"
          className={cn('text-primary transition-[stroke-dasharray] duration-700', percent === 0 && 'opacity-0', className)}
        />
      </svg>
      <div className="relative flex flex-col items-center text-center">{children}</div>
    </div>
  )
}
