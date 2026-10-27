import { beforeEach, describe, expect, it } from 'vitest'
import { reportRequestResult, useConnectionStore } from './connection'

const networkError = { status: 0, code: 'NETWORK_ERROR' }

describe('connection status ("Can\'t reach Dailyvy")', () => {
  beforeEach(() => useConnectionStore.setState({ serverUnreachable: false }))

  it('a network error marks the server unreachable', () => {
    reportRequestResult(networkError)
    expect(useConnectionStore.getState().serverUnreachable).toBe(true)
  })

  it('any answer from the server clears it — success or an error with a status', () => {
    reportRequestResult(networkError)
    reportRequestResult(null)
    expect(useConnectionStore.getState().serverUnreachable).toBe(false)

    reportRequestResult(networkError)
    reportRequestResult({ status: 422, code: 'VALIDATION_ERROR' })
    expect(useConnectionStore.getState().serverUnreachable).toBe(false)
  })
})
