import { describe, expect, it } from 'vitest'
import { getCellState, isApplicableOn } from './cellState'

// 2026-10-05 is a Monday
const MON_WED_FRI = [true, false, true, false, true, false, false]
const habit = { activeDays: MON_WED_FRI, startDate: '2026-10-05', endDate: null }
const TODAY = '2026-10-07' // Wednesday

describe('getCellState', () => {
  it('today on an applicable day is the only editable cell', () => {
    expect(getCellState(habit, TODAY, TODAY, false)).toEqual({ kind: 'today', checked: false, editable: true })
    expect(getCellState(habit, TODAY, TODAY, true)).toEqual({ kind: 'today', checked: true, editable: true })
  })

  it('skipped days: a muted, read-only marker in the past; today offers "mark done"', () => {
    expect(getCellState(habit, '2026-10-05', TODAY, false, true)).toEqual({ kind: 'skipped', checked: false, editable: false })
    expect(getCellState(habit, TODAY, TODAY, false, true)).toEqual({ kind: 'today', checked: false, editable: true, skipped: true })
    // done wins over skipped
    expect(getCellState(habit, TODAY, TODAY, true, true)).toEqual({ kind: 'today', checked: true, editable: true })
  })

  it('past applicable days are read-only and show their stored state', () => {
    expect(getCellState(habit, '2026-10-05', TODAY, true)).toMatchObject({ kind: 'done', editable: false })
    expect(getCellState(habit, '2026-10-05', TODAY, false)).toMatchObject({ kind: 'missed', editable: false })
  })

  it('future applicable days are locked', () => {
    expect(getCellState(habit, '2026-10-09', TODAY, false)).toMatchObject({ kind: 'future', editable: false })
  })

  it('non-applicable weekdays are never editable — even today', () => {
    const tuesday = '2026-10-06'
    expect(getCellState(habit, tuesday, tuesday, false)).toMatchObject({ kind: 'not-applicable', editable: false })
  })

  it('days before the habit was created are not applicable', () => {
    expect(isApplicableOn({ ...habit, startDate: '2026-10-07' }, '2026-10-05')).toBe(false)
  })

  it('days after a deleted habit ended are not applicable', () => {
    expect(isApplicableOn({ ...habit, endDate: '2026-10-05' }, '2026-10-07')).toBe(false)
  })

  it('a times-per-week habit is never missed — undone past days are just open', () => {
    const gym = { ...habit, activeDays: Array(7).fill(true), frequency: { kind: 'weekly' as const, timesPerWeek: 3 } }
    expect(getCellState(gym, '2026-10-06', '2026-10-08', false)).toMatchObject({ kind: 'open', editable: false })
    expect(getCellState(gym, '2026-10-07', '2026-10-08', true)).toMatchObject({ kind: 'done' })
    expect(getCellState(gym, '2026-10-08', '2026-10-08', false)).toMatchObject({ kind: 'today', editable: true })
  })

  it('days a habit was archived (then restored) are not tracked', () => {
    const paused = { ...habit, activeDays: Array(7).fill(true), pauses: [{ from: '2026-10-06', to: '2026-10-07' }] }
    expect(getCellState(paused, '2026-10-06', '2026-10-08', false)).toMatchObject({ kind: 'not-applicable' })
    expect(getCellState(paused, '2026-10-05', '2026-10-08', false)).toMatchObject({ kind: 'missed' })
  })
})
