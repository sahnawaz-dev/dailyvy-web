import { describe, expect, it } from 'vitest'
import { addDays, addMonths, monthDays, startOfWeek, weekdayIndex } from './date'

describe('date utils', () => {
  it('weekdayIndex: 0 = Monday ... 6 = Sunday', () => {
    expect(weekdayIndex('2026-10-05')).toBe(0)
    expect(weekdayIndex('2026-10-11')).toBe(6)
  })

  it('startOfWeek returns Monday', () => {
    expect(startOfWeek('2026-10-11')).toBe('2026-10-05')
  })

  it('addDays crosses month and DST boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30')
  })

  it('addMonths wraps years', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
  })

  it('monthDays handles leap years', () => {
    expect(monthDays('2028-02')).toHaveLength(29)
    expect(monthDays('2026-02')).toHaveLength(28)
  })
})
