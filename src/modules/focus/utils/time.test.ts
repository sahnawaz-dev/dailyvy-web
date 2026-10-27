import { describe, expect, it } from 'vitest'
import type { FocusSession } from '../types/focus.types'
import { formatClock, formatMinutes, liveTimes } from './time'

const session = (overrides: Partial<FocusSession> = {}): FocusSession => ({
  id: 's1',
  date: '2026-10-05',
  plannedMinutes: 30,
  label: null,
  link: null,
  status: 'running',
  startedAt: '2026-10-05T10:00:00.000Z',
  endedAt: null,
  elapsedSeconds: 600,
  remainingSeconds: 1200,
  creditedMinutes: 0,
  ...overrides,
})

describe('focus time helpers', () => {
  it('formats minutes as hours and minutes', () => {
    expect(formatMinutes(0)).toBe('0m')
    expect(formatMinutes(45)).toBe('45m')
    expect(formatMinutes(120)).toBe('2h')
    expect(formatMinutes(135)).toBe('2h 15m')
  })

  it('formats a countdown clock', () => {
    expect(formatClock(1499)).toBe('24:59')
    expect(formatClock(3600)).toBe('60:00')
    expect(formatClock(0.2)).toBe('0:01')
    expect(formatClock(-5)).toBe('0:00')
  })

  it('a running session keeps counting from when it was fetched', () => {
    expect(liveTimes(session(), 1_000_000, 1_060_000)).toEqual({ elapsed: 660, remaining: 1140 })
  })

  it('a paused session stands still, and time never passes the planned length', () => {
    expect(liveTimes(session({ status: 'paused' }), 1_000_000, 9_000_000)).toEqual({ elapsed: 600, remaining: 1200 })
    expect(liveTimes(session(), 1_000_000, 99_000_000)).toEqual({ elapsed: 1800, remaining: 0 })
  })
})
