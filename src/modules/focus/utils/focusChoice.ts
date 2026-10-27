/** The "Focusing on…" picker value and how it becomes a session's label / link. */
import type { FocusLink } from '../types/focus.types'

export interface FocusChoice {
  /** 'none' | 'custom' | 'task:<id>' | 'habit:<id>' */
  value: string
  customText: string
}

export interface FocusOption {
  value: string
  label: string
}

export const NO_FOCUS_CHOICE: FocusChoice = { value: 'none', customText: '' }

export function resolveFocusChoice(
  choice: FocusChoice,
  options: FocusOption[],
): { label: string | null; link: FocusLink | null } {
  if (choice.value === 'none') return { label: null, link: null }
  if (choice.value === 'custom') return { label: choice.customText.trim() || null, link: null }

  const [kind, refId] = choice.value.split(':') as [FocusLink['kind'], string]
  const option = options.find((o) => o.value === choice.value)
  return option ? { label: option.label, link: { kind, refId } } : { label: null, link: null }
}
