import { describe, expect, it } from 'vitest'
import type { ToggleLogResult } from '../types/habits.types'
import { celebrationKey, shouldCelebrate } from './celebration'

const base: ToggleLogResult = {
  habitId: 'h1',
  tabId: 't1',
  date: '2026-10-05',
  completed: true,
  skipped: false,
  dayComplete: true,
  allTabsComplete: false,
}

describe('shouldCelebrate', () => {
  it('fires once when the tab is complete for today', () => {
    expect(shouldCelebrate(base, 'tab', localStorage)).toBe(true)
    expect(localStorage.getItem(celebrationKey('2026-10-05', 'tab', 't1'))).toBe('1')
  })

  it('does not fire again the same day after toggling off and on', () => {
    expect(shouldCelebrate(base, 'tab', localStorage)).toBe(true)
    expect(shouldCelebrate({ ...base, completed: false, dayComplete: false }, 'tab', localStorage)).toBe(false)
    expect(shouldCelebrate(base, 'tab', localStorage)).toBe(false)
  })

  it('fires again on a new day and prunes the old marker', () => {
    shouldCelebrate(base, 'tab', localStorage)
    expect(shouldCelebrate({ ...base, date: '2026-10-06' }, 'tab', localStorage)).toBe(true)
    expect(localStorage.getItem(celebrationKey('2026-10-05', 'tab', 't1'))).toBeNull()
  })

  it('is tracked per tab', () => {
    shouldCelebrate(base, 'tab', localStorage)
    expect(shouldCelebrate({ ...base, tabId: 't2' }, 'tab', localStorage)).toBe(true)
  })

  it('respects the "all tabs" scope', () => {
    expect(shouldCelebrate(base, 'all', localStorage)).toBe(false)
    expect(shouldCelebrate({ ...base, allTabsComplete: true }, 'all', localStorage)).toBe(true)
  })

  it('never fires when unchecking', () => {
    expect(shouldCelebrate({ ...base, completed: false }, 'tab', localStorage)).toBe(false)
  })
})
