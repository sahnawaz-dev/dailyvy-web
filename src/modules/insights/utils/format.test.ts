import { describe, expect, it } from 'vitest'
import { amountTrend, formatMinutes, percent, rateTrend } from './format'

describe('weekly review formatting', () => {
  it('percent and minutes', () => {
    expect(percent(0.825)).toBe('83%')
    expect(percent(null)).toBe('—')
    expect(formatMinutes(125)).toBe('2h 5m')
    expect(formatMinutes(0)).toBe('0m')
  })

  it('trends compare with last week', () => {
    expect(rateTrend(0.82, 0.7)).toEqual({ text: '+12 pts vs last week', direction: 'up' })
    expect(rateTrend(0.5, 0.5)).toEqual({ text: 'same as last week', direction: 'same' })
    expect(rateTrend(0.5, null)).toBeNull()
    expect(amountTrend(90, 150, formatMinutes)).toEqual({ text: '−1h vs last week', direction: 'down' })
    expect(amountTrend(0, 0)).toBeNull()
  })
})
