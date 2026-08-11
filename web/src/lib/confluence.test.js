import { describe, expect, it } from 'vitest'
import { describeEntry, entryStage, entryValue, smtInsight } from './confluence'
import { calculateScore } from './scoring'

const chip = (over = {}) => ({
  groupId: 'pdArray',
  itemId: 'fvg',
  timeframe: '1H',
  direction: 'Bullish',
  asset: null,
  ...over,
})

describe('confluence entries', () => {
  it('adds when it agrees with the bias and subtracts when it fights it', () => {
    expect(entryValue(chip(), 'Bullish')).toBeGreaterThan(0)
    expect(entryValue(chip(), 'Bearish')).toBeLessThan(0)
  })

  it('weights higher timeframes above lower ones', () => {
    expect(entryValue(chip({ timeframe: '4H' }), 'Bullish')).toBeGreaterThan(
      entryValue(chip({ timeframe: '1M' }), 'Bullish'),
    )
  })

  it('always costs score for a violation, whichever way it points', () => {
    const violation = chip({ groupId: 'violation', itemId: 'sweptMyStop', direction: 'Bullish' })
    expect(entryValue(violation, 'Bullish')).toBeLessThan(0)
    expect(entryValue(violation, 'Bearish')).toBeLessThan(0)
  })

  it('names the chip and the page behind it', () => {
    expect(describeEntry(chip())).toBe('1H FVG')
    expect(describeEntry(chip({ groupId: 'smt', itemId: 'smt', asset: 'ES' }))).toBe('1H SMT divergence vs ES')
    expect(entryStage(chip({ groupId: 'fractal', itemId: 'c2' }))).toBe('h4')
  })

  it('moves the score and shows up in the rail lists', () => {
    const base = { dailyBias: 'Bullish' }
    const helped = calculateScore({ ...base, confluence: [chip()] })
    const hurt = calculateScore({ ...base, confluence: [chip({ direction: 'Bearish' })] })
    expect(helped.finalScore).toBeGreaterThan(hurt.finalScore)
    expect(helped.inFavour.some((item) => item.text === '1H FVG')).toBe(true)
    expect(hurt.cautions.some((item) => item.text.includes('1H FVG'))).toBe(true)
  })

  it('points SMT at the instrument showing the divergence', () => {
    const answers = {
      dailyBias: 'Bullish',
      confluence: [chip({ groupId: 'smt', itemId: 'smt', asset: 'ES' })],
    }
    expect(smtInsight(answers, 'MNQ')).toContain('ES')
    expect(smtInsight({ dailyBias: 'Bullish' }, 'MNQ')).toBe(null)
  })
})
