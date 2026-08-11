import { describe, expect, it } from 'vitest'
import { dayLessons, isReviewComplete, summarizeDay, timingOf } from './review'

/** 14:05 UTC in January is 09:05 in New York. */
const nyAt = (hour, minute) => {
  const date = new Date(Date.UTC(2026, 0, 5, hour + 5, minute))
  return date.toISOString()
}

describe('trade debrief', () => {
  it('reads the entry stamp for the window and the macro', () => {
    expect(timingOf(nyAt(10, 3)).macro).toBe('9:50–10:10 macro')
    expect(timingOf(nyAt(10, 3)).inWindow).toBe(true)
    expect(timingOf(nyAt(10, 30)).macro).toBe(null)
    expect(timingOf(nyAt(10, 30)).inWindow).toBe(true)
    expect(timingOf(nyAt(11, 30)).inWindow).toBe(false)
    expect(timingOf(nyAt(9, 5)).inWindow).toBe(false)
    expect(timingOf(null).inWindow).toBe(null)
  })

  it('needs a reason and every management answer before it saves', () => {
    expect(isReviewComplete({ reason: 'Stop too tight' })).toBe(false)
    expect(
      isReviewComplete({
        reason: 'Stop too tight',
        heldLonger: 'yes',
        couldHaveAdded: 'no',
        stopTooFast: 'yes',
        followedPlan: 'no',
      }),
    ).toBe(true)
  })

  it('adds the day up and calls out the leaks', () => {
    const summary = summarizeDay([
      { outcome: 'WIN', pnl: '160', trade: { r: 2 }, review: { macro: '9:50–10:10 macro', inWindow: true } },
      { outcome: 'LOSS', pnl: '-80', trade: { r: -1 }, review: { inWindow: false, stopTooFast: 'yes' } },
    ])
    expect(summary).toMatchObject({ count: 2, wins: 1, losses: 1, net: 80, totalR: 1, inMacro: 1, outOfWindow: 1 })
    const lessons = dayLessons(summary)
    expect(lessons.some((line) => line.includes('outside 9:30–11:00'))).toBe(true)
    expect(lessons.some((line) => line.includes('stop moved up too fast'))).toBe(true)
  })
})
