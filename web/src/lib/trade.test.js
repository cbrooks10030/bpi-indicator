import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CONTRACTS,
  closeTrade,
  dollarsAt,
  elapsedLabel,
  newTrade,
  outcomeOf,
  rMultiple,
  riskPoints,
  targetPrice,
} from './trade'

describe('trade ticket', () => {
  it('defaults to two contracts and stamps a start time', () => {
    const trade = newTrade({ symbol: 'MNQ', entry: 20000, stop: 19980 })
    expect(trade.contracts).toBe(DEFAULT_CONTRACTS)
    expect(Number.isFinite(new Date(trade.startedAt).getTime())).toBe(true)
  })

  it('projects the 2R target from the stop, both directions', () => {
    const long = newTrade({ entry: 20000, stop: 19980 })
    expect(riskPoints(long)).toBe(20)
    expect(targetPrice(long)).toBe(20040)

    const short = newTrade({ direction: 'Bearish', entry: 20000, stop: 20020 })
    expect(targetPrice(short)).toBe(19960)
  })

  it('converts points to dollars per contract for each symbol', () => {
    const mnq = newTrade({ symbol: 'MNQ', entry: 20000, stop: 19980, contracts: 2 })
    expect(dollarsAt(mnq, 20040)).toBe(160)

    const nq = newTrade({ symbol: 'NQ', entry: 20000, stop: 19980, contracts: 1 })
    expect(dollarsAt(nq, 20040)).toBe(800)
  })

  it('closes out with the R multiple and a graded outcome', () => {
    const closed = closeTrade(newTrade({ entry: 20000, stop: 19980, contracts: 2 }), { exit: 20040 })
    expect(closed.r).toBe(2)
    expect(closed.pnl).toBe(160)
    expect(outcomeOf(closed.pnl)).toBe('WIN')

    const stopped = closeTrade(newTrade({ entry: 20000, stop: 19980 }), { exit: 19980 })
    expect(rMultiple(stopped, stopped.exit)).toBe(-1)
    expect(outcomeOf(stopped.pnl)).toBe('LOSS')
  })

  it('reads out how long the trade has been running', () => {
    const start = new Date('2026-01-05T14:30:00Z')
    expect(elapsedLabel(start.toISOString(), new Date('2026-01-05T14:32:05Z'))).toBe('02:05')
    expect(elapsedLabel(start.toISOString(), new Date('2026-01-05T15:32:05Z'))).toBe('1:02:05')
  })
})
