/**
 * Runs on every page (mounted once in the app shell), so a session keeps
 * being tracked wherever the user goes:
 *  - countdown in the browser tab title
 *  - chime + notification + toast when a session or break ends
 *  - "Goal reached 🎯" celebration, once per day
 */
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CelebrationOverlay } from '@/shared/components'
import { setDocumentTitlePrefix } from '@/shared/hooks/useDocumentTitle'
import type { DateString } from '@/shared/types/api'
import { useCurrentUser } from '@/modules/auth'
import { BREAK_MINUTES } from '../constants'
import { useLiveSession } from '../hooks/useLiveSession'
import { useNow } from '../hooks/useNow'
import { focusKeys, useFocusSummary } from '../services/focus.queries'
import { useFocusUiStore } from '../store/focusUiStore'
import { notify, playChime, unlockAudio } from '../utils/alerts'
import { formatClock, formatMinutes } from '../utils/time'

/** A break that ended longer ago than this (e.g. tab was closed) ends silently. */
const STALE_ALERT_MS = 60_000
const CELEBRATED_KEY = 'habit-tracker:focus-celebrated:'

export function FocusWatcher() {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  const { session, remainingSeconds, endsAt } = useLiveSession()
  const summary = useFocusSummary()
  const ui = useFocusUiStore()
  const breakNow = useNow(Boolean(ui.breakEndsAt) && !session)

  // Browsers only play audio after a user gesture — unlock on the first one (also after a reload).
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // ---- Tab title: "⏱ 24:59 · Focus · Dailyvy" ----------------------------------
  let titlePrefix: string | null = null
  if (session) titlePrefix = `${session.status === 'paused' ? '⏸' : '⏱'} ${formatClock(remainingSeconds)}`
  else if (ui.breakEndsAt && breakNow) titlePrefix = `☕ ${formatClock((ui.breakEndsAt - breakNow) / 1000)}`

  useEffect(() => setDocumentTitlePrefix(titlePrefix), [titlePrefix])
  useEffect(() => () => setDocumentTitlePrefix(null), [])

  // ---- Session finished on time --------------------------------------------------------
  // A one-shot timeout (not the 1 s tick) so it still fires on time in a background tab.
  const sessionId = session?.id
  const plannedMinutes = session?.plannedMinutes ?? 0
  const { soundEnabled, setJustCompleted, startBreak, endBreak, showCelebration } = ui
  const alerted = useRef(new Set<string>())

  useEffect(() => {
    if (!sessionId || endsAt === null) return
    const timer = setTimeout(
      () => {
        // A refetch just before the end can reschedule this — alert only once.
        if (alerted.current.has(sessionId)) return
        alerted.current.add(sessionId)
        setJustCompleted({ sessionId, minutes: plannedMinutes })
        if (soundEnabled) playChime()
        notify('Focus session complete 🎉', `${formatMinutes(plannedMinutes)} of focus. Time for a ${BREAK_MINUTES}-minute break?`)
        toast.success(`Focus session complete — ${formatMinutes(plannedMinutes)} added`, {
          action: { label: 'Take a break', onClick: startBreak },
        })
        // The server marks it completed on the next read.
        void queryClient.invalidateQueries({ queryKey: focusKeys.all })
      },
      Math.max(0, endsAt - Date.now()),
    )
    return () => clearTimeout(timer)
  }, [sessionId, endsAt, plannedMinutes, soundEnabled, setJustCompleted, startBreak, queryClient])

  // ---- Break finished --------------------------------------------------------------------
  const { breakEndsAt } = ui
  useEffect(() => {
    if (!breakEndsAt) return
    const timer = setTimeout(
      () => {
        endBreak()
        if (Date.now() - breakEndsAt > STALE_ALERT_MS) return
        if (soundEnabled) playChime()
        notify("Break's over", 'Ready for another focus session?')
        toast("Break's over — ready for another focus session?")
      },
      Math.max(0, breakEndsAt - Date.now()),
    )
    return () => clearTimeout(timer)
  }, [breakEndsAt, soundEnabled, endBreak])

  // ---- Goal reached: celebrate when it flips from "not met" to "met" (once a day) -------
  const lastSeen = useRef<{ date: DateString; met: boolean } | null>(null)
  const today = summary.data?.today
  const met = summary.data?.goal.met
  useEffect(() => {
    if (today === undefined || met === undefined) return
    const previous = lastSeen.current
    lastSeen.current = { date: today, met }
    if (!met || !previous || previous.date !== today || previous.met) return

    try {
      if (localStorage.getItem(CELEBRATED_KEY + user.id) === today) return
      localStorage.setItem(CELEBRATED_KEY + user.id, today)
    } catch {
      // storage unavailable: celebrate anyway
    }
    showCelebration()
  }, [today, met, user.id, showCelebration])

  return (
    <CelebrationOverlay
      visible={ui.celebrationVisible}
      onHide={ui.hideCelebration}
      emoji="🎯"
      title="Goal reached!"
      message={`You hit today's focus goal of ${formatMinutes(summary.data?.goal.dailyGoalMinutes ?? 0)}.`}
    />
  )
}
