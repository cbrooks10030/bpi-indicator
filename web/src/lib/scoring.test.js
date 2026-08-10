import { describe, expect, it } from 'vitest'
import { ALL_QUESTIONS, PREP_ITEMS, deriveEntry, isPrepComplete } from './model'
import { calculateScore } from './scoring'

const NEGATIVE_MODIFIERS = ['cisdWickOnly', 'beforeNineThirty', 'dxySameDirection', 'fightingBias']

const prep = () => ({
  ...Object.fromEntries(PREP_ITEMS.map((item) => [item.id, true])),
  prepOrigin: 'External swing',
  dailyBias: 'Bearish',
})

/** Every weighted question answered in the ideal way for a bearish setup. */
const perfect = () => {
  const answers = { ...prep(), closures: ['1H'], pdArrays: ['FVG'], pdTier: 'Premium' }
  for (const question of ALL_QUESTIONS) {
    if (question.type === 'multi' || question.type === 'select') continue
    answers[question.id] = NEGATIVE_MODIFIERS.includes(question.id) ? 'no' : 'yes'
  }
  return answers
}

describe('calculateScore', () => {
  it('sums the base weights to exactly 100 on a clean setup', () => {
    const result = calculateScore(perfect())
    expect(result.baseScore).toBe(100)
    expect(result.finalScore).toBe(100)
    expect(result.decision.key).toBe('EXECUTE')
  })

  it('caps bonuses at 15 and clamps the total at 100', () => {
    const result = calculateScore({ ...perfect(), closures: ['1H', '15M'], pdArrays: ['FVG', 'Breaker', 'Order block'] })
    expect(result.rawBonus).toBe(43)
    expect(result.appliedBonus).toBe(15)
    expect(result.finalScore).toBe(100)
  })

  it('caps the score at 50 when a mandatory question fails', () => {
    const result = calculateScore({ ...perfect(), oteAtPdArray: 'no' })
    expect(result.mandatoryCapped).toBe(true)
    expect(result.finalScore).toBe(50)
  })

  it('treats an empty closure selection as a mandatory failure', () => {
    const result = calculateScore({ ...perfect(), closures: [] })
    expect(result.failedMandatory.length).toBeGreaterThan(0)
    expect(result.finalScore).toBe(50)
  })

  it('hard stops at 25% when the last CISD is against the direction', () => {
    const result = calculateScore({ ...perfect(), lastCisdAligned: 'no' })
    expect(result.hardStopped).toBe(true)
    expect(result.finalScore).toBe(25)
    expect(result.decision.key).toBe('WAIT')
    expect(result.reasons[0]).toMatch(/against your direction/)
  })

  it('caps penalties at 50', () => {
    const answers = { ...perfect() }
    for (const id of NEGATIVE_MODIFIERS) answers[id] = 'yes'
    answers.rr2 = 'no'
    const result = calculateScore(answers)
    expect(result.rawPenalty).toBe(85)
    expect(result.appliedPenalty).toBe(50)
  })

  it('only scores the premium/discount tier when it agrees with the bias', () => {
    const bearishInDiscount = calculateScore({ ...perfect(), pdTier: 'Discount' })
    expect(bearishInDiscount.baseScore).toBe(94)
    const bullishInDiscount = calculateScore({ ...perfect(), dailyBias: 'Bullish', pdTier: 'Discount' })
    expect(bullishInDiscount.baseScore).toBe(100)
  })

  it('treats the 4H C2 sweep and daily POI as bonuses, never requirements', () => {
    const answers = { ...perfect(), h4C2Sweeping: 'no', h4C2IntoFvg: 'no', c2AtDailyPoi: 'no' }
    const result = calculateScore(answers)
    expect(result.failedMandatory).toEqual([])
    expect(result.baseScore).toBe(100)
    expect(result.penalties).toEqual([])
    expect(result.finalScore).toBe(100)
  })

  it('rewards the full correlation stack', () => {
    const result = calculateScore(perfect())
    expect(result.bonuses.map((bonus) => bonus.label)).toContain('Dollar printing the inverse CISD at the same time')
    expect(result.reasons).toContain('NQ, ES, and an inverse dollar all confirm — full correlation stack')
  })

  it('docks the score when the dollar moves with NQ/ES without blocking the trade', () => {
    const answers = { ...perfect(), pdTier: 'Equilibrium', dxySameDirection: 'yes' }
    const result = calculateScore(answers)
    expect(result.baseScore).toBe(94)
    expect(result.appliedPenalty).toBe(10)
    expect(result.finalScore).toBe(99)
    expect(result.decision.key).toBe('EXECUTE')
  })

  it('generates warnings below 50%', () => {
    const result = calculateScore({ ...prep(), h4C2: 'no', entryCisd: 'no', rr2: 'no' })
    expect(result.reasons).toContain('No C2 on the 4H — there is no fractal leg to trade from')
    expect(result.reasons).toContain('Risk/Reward below 2R — mathematically poor trade')
  })
})

describe('deriveEntry', () => {
  it('maps the highest closure to its confirmation timeframe', () => {
    expect(deriveEntry({ closures: ['1H'] })).toMatchObject({ primary: '1H', entryTf: '5M' })
    expect(deriveEntry({ closures: ['15M'] })).toMatchObject({ primary: '15M', entryTf: '3M' })
    expect(deriveEntry({ closures: ['15M', '1H'] })).toMatchObject({ primary: '1H', entryTf: '5M' })
    expect(deriveEntry({}).entryTf).toBe(null)
  })
})

describe('isPrepComplete', () => {
  it('requires every prep item plus origin and bias', () => {
    expect(isPrepComplete({})).toBe(false)
    expect(isPrepComplete({ ...prep(), dailyBias: undefined })).toBe(false)
    expect(isPrepComplete(prep())).toBe(true)
  })
})
