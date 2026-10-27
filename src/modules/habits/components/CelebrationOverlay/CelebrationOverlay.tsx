/**
 * "Hoorah! 🎉" shown when all of today's habits are done.
 * When it fires is decided in habits.queries.ts (useToggleLog) + utils/celebration.ts.
 */
import { CelebrationOverlay as Celebration } from '@/shared/components'
import { useHabitsUiStore } from '../../store/habitsUiStore'

export function CelebrationOverlay() {
  const visible = useHabitsUiStore((state) => state.celebrationVisible)
  const hide = useHabitsUiStore((state) => state.hideCelebration)

  return (
    <Celebration
      visible={visible}
      onHide={hide}
      title="Hoorah!"
      message="Accomplished — every habit for today is done."
    />
  )
}
