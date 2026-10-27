import { describe, expect, it } from 'vitest'
import { describeReminder, formatDays, formatEvery } from './schedule'

describe('reminder schedule descriptions', () => {
  it('describes intervals in plain words', () => {
    expect(formatEvery(30)).toBe('30 min')
    expect(formatEvery(60)).toBe('1 hour')
    expect(formatEvery(90)).toBe('1.5 hours')
    expect(formatEvery(120)).toBe('2 hours')
  })

  it('names common day sets', () => {
    expect(formatDays(Array(7).fill(true))).toBe('Every day')
    expect(formatDays([true, true, true, true, true, false, false])).toBe('Weekdays')
    expect(formatDays([false, false, false, false, false, true, true])).toBe('Weekends')
    expect(formatDays([true, false, true, false, true, false, false])).toBe('Mon, Wed, Fri')
  })

  it('combines schedule and days', () => {
    const text = describeReminder({
      schedule: { kind: 'times', times: ['13:00', '08:00'] },
      days: Array(7).fill(true),
    })
    // times are sorted; exact clock format depends on the locale
    expect(text).toMatch(/^8.*00.*, 1.*00.* · Every day$/)
  })
})
