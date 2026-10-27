import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { WeekdaySelector } from './WeekdaySelector'

function Harness() {
  const [days, setDays] = useState(Array(7).fill(true))
  return (
    <>
      <WeekdaySelector value={days} onChange={setDays} />
      <output data-testid="value">{JSON.stringify(days)}</output>
    </>
  )
}

describe('WeekdaySelector', () => {
  it('starts with Mon–Sun all checked', () => {
    render(<Harness />)
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(7)
    boxes.forEach((box) => expect(box).toBeChecked())
  })

  it('lets the user uncheck any combination of days (not just weekends)', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByLabelText('Tue'))
    await userEvent.click(screen.getByLabelText('Thu'))

    expect(screen.getByTestId('value').textContent).toBe(JSON.stringify([true, false, true, false, true, true, true]))
  })

  it('shows an error message when given one', () => {
    render(<WeekdaySelector value={Array(7).fill(false)} onChange={() => {}} error="Select at least one day" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Select at least one day')
  })
})
