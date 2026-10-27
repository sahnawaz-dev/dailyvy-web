/**
 * Input sensors for drag to reorder (dnd-kit):
 *  - mouse: starts after moving 5px, so a plain click still clicks
 *  - touch: press and hold ~¼s, so a swipe still scrolls the page
 *  - keyboard (optional): focus the drag handle, Space to pick up, arrows to move, Space to drop
 */
import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

export function useReorderSensors({ keyboard = true } = {}) {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      // Off for elements whose keys already mean something (e.g. tabs: Enter/Space select)
      keyboardCodes: keyboard
        ? { start: ['Space'], cancel: ['Escape'], end: ['Space'] }
        : { start: [], cancel: ['Escape'], end: [] },
    }),
  )
}
