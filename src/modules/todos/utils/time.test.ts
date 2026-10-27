import { describe, expect, it } from 'vitest'
import { isOverdue, nowInTimezone } from './time'

describe('due time helpers', () => {
  it('nowInTimezone returns HH:mm in that timezone', () => {
    const instant = new Date('2026-10-05T23:30:00Z')
    expect(nowInTimezone('UTC', instant)).toBe('23:30')
    expect(nowInTimezone('Asia/Kolkata', instant)).toBe('05:00')
  })

  it('a task is overdue only when its time has passed and it is not done', () => {
    expect(isOverdue('09:00', false, '09:01')).toBe(true)
    expect(isOverdue('09:00', true, '10:00')).toBe(false)
    expect(isOverdue('18:00', false, '09:00')).toBe(false)
    expect(isOverdue(null, false, '23:59')).toBe(false)
  })
})
