import { describe, expect, it } from 'vitest'
import { featuresOf, findSimilar, missingFromWinners, similarity } from './recall'

const answers = {
  dailyBias: 'Bullish',
  prepLiquidity: 'yes',
  prepPdhPdl: 'yes',
  h4C2: 'yes',
  h4C2Direction: 'yes',
  h4C2Sweeping: 'no',
}

const keysOf = (value) => featuresOf(value).map((feature) => feature.key)

describe('similar-trade recall', () => {
  it('fingerprints only the criteria that were actually true', () => {
    const keys = keysOf(answers)
    expect(keys).toContain('bias:Bullish')
    expect(keys).toContain('q:h4C2')
    expect(keys).not.toContain('q:h4C2Sweeping')
    expect(keys.some((key) => key.startsWith('q:h4C2Sweeping'))).toBe(false)
  })

  it('scores an identical read above a partial one', () => {
    const today = { features: featuresOf(answers), score: 70, minutes: 603 }
    const same = { features: featuresOf(answers), score: 70, minutes: 603 }
    const partial = { features: featuresOf({ dailyBias: 'Bullish', h4C2: 'yes' }), score: 70, minutes: 603 }
    expect(similarity(today, same).score).toBeGreaterThan(similarity(today, partial).score)
    expect(similarity(today, same).shared).toHaveLength(featuresOf(answers).length)
  })

  it('ranks the past days and keeps the far-off ones out', () => {
    const matches = findSimilar(answers, 70, [
      { id: 'a', outcome: 'WIN', score: 72, answers, timestamp: '2026-01-05T15:03:00.000Z' },
      { id: 'b', outcome: 'LOSS', score: 40, answers: { dailyBias: 'Bearish' }, timestamp: '2026-01-06T15:03:00.000Z' },
    ])
    expect(matches.map((match) => match.record.id)).toEqual(['a'])
    expect(matches[0].sharedLabels.some((label) => label.includes('C2'))).toBe(true)
  })

  it('needs three criteria before it recalls anything', () => {
    expect(findSimilar({ dailyBias: 'Bullish' }, 70, [{ id: 'a', score: 70, answers }])).toEqual([])
  })

  it('lists what every winner had and today does not', () => {
    const winner = { ...answers, h4C2Sweeping: 'yes', c2AtDailyPoi: 'yes' }
    const waiting = missingFromWinners(answers, [
      { record: { outcome: 'WIN', answers: winner } },
      { record: { outcome: 'WIN', answers: { ...answers, h4C2Sweeping: 'yes' } } },
      { record: { outcome: 'LOSS', answers: { ...answers, prepNextFvgs: 'yes' } } },
    ])
    expect(waiting.map((item) => item.key)).toEqual(['q:h4C2Sweeping'])
  })
})
