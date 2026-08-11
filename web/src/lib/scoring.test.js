import { describe, expect, it } from 'vitest'
import { ALL_QUESTIONS, PREP_ITEMS, STAGES, deriveEntry, isPrepComplete } from './model'
import { calculateScore } from './scoring'

const NEGATIVE_MODIFIERS = ['cisdWickOnly', 'dxySameDirection']

/** Minutes past midnight in New York, used to drive the session-aware scoring. */
const AT = { preOpen: 9 * 60, window: 9 * 60 + 35, macro: 9 * 60 + 55, closed: 11 * 60 + 30 }

const prep = () => ({
  ...Object.fromEntries(PREP_ITEMS.map((item) => [item.id, true])),
  prepOrigin: 'External swing',
  dailyBias: 'Bearish',
})

/** Every weighted question answered the ideal way for a bearish setup. */
const perfect = () => {
  const answers = {
    ...prep(),
    pdArrays: ['FVG'],
    pdTier: 'Premium',
    opensLocation: 'Below both',
    ltfCisdDirection: 'Bearish',
  }
  for (const question of ALL_QUESTIONS) {
    if (question.type === 'multi' || question.type === 'select') continue
    answers[question.id] = NEGATIVE_MODIFIERS.includes(question.id) ? 'no' : 'yes'
  }
  return answers
}

describe('the question model', () => {
  it('walks the timeframes in order with base weights summing to 100', () => {
    expect(STAGES.map((stage) => stage.timeframe)).toEqual(['4H', '1H', '30M', '15M', '5M + 3M', '1M'])
    const declared = STAGES.reduce((sum, stage) => sum + stage.total, 0)
    const actual = ALL_QUESTIONS.reduce((sum, question) => sum + question.weight, 0)
    expect(declared).toBe(100)
    expect(actual).toBe(100)
    for (const stage of STAGES) {
      const stageWeight = stage.questions.reduce((sum, question) => sum + question.weight, 0)
      expect(stageWeight).toBe(stage.total)
    }
  })
})

describe('calculateScore', () => {
  it('scores a clean setup at 100 and calls the execution', () => {
    const result = calculateScore(perfect())
    expect(result.baseScore).toBe(100)
    expect(result.finalScore).toBe(100)
    expect(result.decision.key).toBe('EXECUTE')
    expect(result.cautions).toEqual([])
  })

  it('caps bonuses at 15 and clamps the total at 100', () => {
    const result = calculateScore({ ...perfect(), pdArrays: ['FVG', 'Breaker', 'Order block'] })
    expect(result.rawBonus).toBe(55)
    expect(result.appliedBonus).toBe(15)
    expect(result.finalScore).toBe(100)
  })

  it('caps the score at 50 when a mandatory question fails', () => {
    const result = calculateScore({ ...perfect(), oteAtPdArray: 'no' })
    expect(result.mandatoryCapped).toBe(true)
    expect(result.finalScore).toBe(50)
  })

  it('caps the score at 50 and cautions when no timeframe has a closure', () => {
    const result = calculateScore({ ...perfect(), h1Closure: 'no', m30Closure: 'no', m15Closure: 'no' })
    expect(result.noClosure).toBe(true)
    expect(result.finalScore).toBe(50)
    expect(result.entry.entryTf).toBe(null)
    expect(result.cautions.map((caution) => caution.stageId)).toContain('m15')
  })

  it('hard stops at 25% when the last CISD is against the direction', () => {
    const result = calculateScore({ ...perfect(), lastCisdAligned: 'no' })
    expect(result.hardStopped).toBe(true)
    expect(result.finalScore).toBe(25)
    expect(result.decision.key).toBe('WAIT')
    expect(result.cautions[0]).toMatchObject({ stageId: 'h1' })
  })

  it('cautions and penalises when the live CISD opposes the bias', () => {
    const result = calculateScore({ ...perfect(), ltfCisdDirection: 'Bullish' })
    expect(result.penalties.map((penalty) => penalty.label)).toContain('Current CISD runs against the daily bias')
    expect(result.cautions.map((caution) => caution.stageId)).toContain('m53')
    expect(result.finalScore).toBeLessThan(100)
  })

  it('caps penalties at 50', () => {
    const answers = { ...perfect(), ltfCisdDirection: 'Bullish' }
    for (const id of NEGATIVE_MODIFIERS) answers[id] = 'yes'
    answers.rr2 = 'no'
    const result = calculateScore(answers)
    expect(result.rawPenalty).toBe(65)
    expect(result.appliedPenalty).toBe(50)
  })

  it('only scores the tier and the opens when they agree with the bias', () => {
    const wrongTier = calculateScore({ ...perfect(), pdTier: 'Discount' })
    expect(wrongTier.baseScore).toBe(96)
    const wrongOpens = calculateScore({ ...perfect(), opensLocation: 'In between' })
    expect(wrongOpens.baseScore).toBe(96)
    const bullish = calculateScore({ ...perfect(), dailyBias: 'Bullish', pdTier: 'Discount', opensLocation: 'Above both', ltfCisdDirection: 'Bullish' })
    expect(bullish.baseScore).toBe(100)
  })

  it('treats the 4H C2 sweep and daily POI as bonuses, never requirements', () => {
    const result = calculateScore({ ...perfect(), h4C2Sweeping: 'no', h4C2IntoFvg: 'no', c2AtDailyPoi: 'no' })
    expect(result.failedMandatory).toEqual([])
    expect(result.penalties).toEqual([])
    expect(result.finalScore).toBe(100)
  })

  it('docks the score when the dollar moves with NQ/ES without blocking the trade', () => {
    const result = calculateScore({ ...perfect(), pdTier: 'Equilibrium', dxySameDirection: 'yes' })
    expect(result.baseScore).toBe(96)
    expect(result.appliedPenalty).toBe(10)
    expect(result.finalScore).toBe(100)
    expect(result.decision.key).toBe('EXECUTE')
  })

  it('re-weights the score around the timeframe the entry is taken on', () => {
    const onOneMinute = calculateScore({ ...perfect(), entryOn: '1M', m1Cisd: 'no', m1Precision: 'no' })
    expect(onOneMinute.baseScore).toBe(92)

    const onThreeMinute = calculateScore({ ...perfect(), entryOn: '3M', m1Cisd: 'no', m1Precision: 'no' })
    expect(onThreeMinute.baseScore).toBe(100)
    expect(onThreeMinute.totalCount).toBe(onOneMinute.totalCount - 2)
  })

  it('scores the New York session: docked pre-open, bonused in window and macro, capped after 11:00', () => {
    const answers = perfect()
    const pre = calculateScore(answers, { nowMinutes: AT.preOpen })
    expect(pre.penalties.map((penalty) => penalty.label)).toContain('Before the 9:30 open')
    expect(pre.cautions.some((caution) => caution.text.includes('9:30 open'))).toBe(true)

    const inWindow = calculateScore(answers, { nowMinutes: AT.window })
    expect(inWindow.bonuses.map((bonus) => bonus.label)).toContain('Inside the 9:30–11:00 window')

    const inMacro = calculateScore(answers, { nowMinutes: AT.macro })
    expect(inMacro.bonuses.map((bonus) => bonus.label)).toContain('Inside the 9:50–10:10 macro')

    const closed = calculateScore(answers, { nowMinutes: AT.closed })
    expect(closed.finalScore).toBe(25)
    expect(closed.decision.key).toBe('WAIT')
  })

  it('re-rates instantly when delivery turns against a running trade', () => {
    const result = calculateScore({ ...perfect(), liveCisd15M: true, liveSweptStop: true })
    expect(result.appliedPenalty).toBe(25)
    expect(result.finalScore).toBeLessThan(100)
    expect(result.cautions.map((caution) => caution.stageId)).toContain('live')
    expect(result.inFavour).toContain('FVG in play after the CISD')
  })

  it('generates warnings below 50%', () => {
    const result = calculateScore({ ...prep(), h4C2: 'no', entryCisd: 'no', rr2: 'no' })
    expect(result.reasons).toContain('No C2 on the 4H — there is no fractal leg to trade from')
    expect(result.reasons).toContain('Risk/Reward below 2R — mathematically poor trade')
  })
})

describe('deriveEntry', () => {
  it('lets the highest closure pick the confirmation timeframe', () => {
    expect(deriveEntry({ h1Closure: 'yes' })).toMatchObject({ primary: '1H', entryTf: '5M' })
    expect(deriveEntry({ m30Closure: 'yes' })).toMatchObject({ primary: '30M', entryTf: '5M' })
    expect(deriveEntry({ m15Closure: 'yes' })).toMatchObject({ primary: '15M', entryTf: '3M' })
    expect(deriveEntry({ m15Closure: 'yes', h1Closure: 'yes' })).toMatchObject({
      primary: '1H',
      entryTf: '5M',
      closures: ['1H', '15M'],
    })
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
