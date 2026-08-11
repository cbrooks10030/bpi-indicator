import { describe, expect, it } from 'vitest'
import { macroFor, nyClock, nyParts, sessionState } from './clock'

describe('the New York clock', () => {
  it('reads the exchange wall clock rather than the device timezone', () => {
    // 14:05:09 UTC on a summer date is 10:05:09 in New York.
    const parts = nyParts(new Date('2025-07-15T14:05:09Z'))
    expect(parts).toMatchObject({ hour: 10, minute: 5, second: 9, weekday: 'Tue' })
  })

  it('follows daylight saving through the Intl timezone', () => {
    // Same UTC hour in January is 09:05 New York, an hour behind the summer reading.
    expect(nyClock(new Date('2025-01-15T14:05:09Z'))).toMatchObject({ label: '09:05:09', minutes: 545 })
  })

  it('flags the weekend when the futures session is shut', () => {
    expect(nyClock(new Date('2025-07-13T14:05:00Z')).weekend).toBe(true)
    expect(nyClock(new Date('2025-07-15T14:05:00Z')).weekend).toBe(false)
  })
})

describe('sessionState', () => {
  it('docks anything before the 9:30 open', () => {
    expect(sessionState(9 * 60)).toMatchObject({ phase: 'pre', minutesToOpen: 30 })
  })

  it('opens the window at 9:30 and reports the time left', () => {
    expect(sessionState(9 * 60 + 30)).toMatchObject({ phase: 'window', minutesLeft: 90 })
  })

  it('closes the window at 11:00 — no new trades after it', () => {
    expect(sessionState(11 * 60).phase).toBe('closed')
    expect(sessionState(11 * 60 + 5).macro).toBe(null)
  })

  it('surfaces the AM macros only inside the tradeable window', () => {
    expect(sessionState(9 * 60 + 55).macro).toMatchObject({ label: '9:50–10:10 macro' })
    expect(sessionState(10 * 60 + 55).macro).toMatchObject({ label: '10:50–11:10 macro' })
    expect(macroFor(10 * 60 + 30)).toBe(null)
  })

  it('stays neutral when the clock is unknown', () => {
    expect(sessionState(null).phase).toBe('unknown')
  })
})
