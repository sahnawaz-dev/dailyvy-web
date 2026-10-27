/** Must match server/src/modules/challenges (validators + challengeRules). */
export const PRESET_LENGTHS = [21, 45, 90] as const
export const MIN_DAYS = 2
export const MAX_DAYS = 365
export const LATE_TICK_UNTIL = '10:00'

/** One-click ideas in the start dialog. */
export const CHALLENGE_IDEAS = [
  { title: 'Work out for 30 minutes', icon: '💪' },
  { title: 'No sugar', icon: '🍬' },
  { title: 'Read 20 pages', icon: '📖' },
  { title: 'Wake up at 6 AM', icon: '⏰' },
  { title: 'Walk 10,000 steps', icon: '🚶' },
  { title: 'No social media', icon: '📵' },
] as const

/** The rules shown before starting (`days` = the chosen length, if valid). */
export const CHALLENGE_RULES = (days: number | null) => [
  `Show up every single day${days ? ` for ${days} days` : ''}, weekends too. No days off, no excuses.`,
  'Day 1 starts today. Tick it on the Today page and watch your progress grow.',
  `Busy day? If you forget to tick, you've got until ${LATE_TICK_UNTIL} the next morning.`,
  'Miss a day and you start again from Day 1. Your best run is saved, so every restart is a chance to beat it.',
  'Cross the finish line and claim your trophy, or push further to 45 or 90 days.',
  'One challenge at a time: full focus, full commitment.',
]
