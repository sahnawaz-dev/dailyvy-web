import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HabitGridCell } from './HabitGridCell'

describe('HabitGridCell', () => {
  it("renders today's cell as a clickable checkbox", async () => {
    const onToggle = vi.fn()
    render(<HabitGridCell state={{ kind: 'today', checked: false, editable: true }} label="Run, Monday" onToggle={onToggle} />)

    const checkbox = screen.getByRole('checkbox', { name: /run, monday: not done yet today/i })
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(checkbox)
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it.each([
    ['done', /completed/],
    ['missed', /missed/],
    ['future', /upcoming/],
    ['not-applicable', /not tracked/],
    ['skipped', /skipped/],
  ] as const)('renders a read-only %s cell', (kind, text) => {
    const onToggle = vi.fn()
    render(<HabitGridCell state={{ kind, checked: kind === 'done', editable: false }} label="Run" onToggle={onToggle} />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: text })).toBeInTheDocument()
  })

  it("today's skipped cell is a button that marks it done", async () => {
    const onToggle = vi.fn()
    render(
      <HabitGridCell state={{ kind: 'today', checked: false, editable: true, skipped: true }} label="Run" onToggle={onToggle} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /run: skipped today/i }))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
