/**
 * The live trade: what was risked, where it is now, and what came out of it.
 * Prices are entered by hand — a browser-only page has no futures feed — but every
 * number derived from them (stop, 2R target, R multiple, dollars) is calculated.
 */

/** Dollars per full index point, per contract. */
export const CONTRACT_SPECS = {
  MNQ: { pointValue: 2, tick: 0.25 },
  NQ: { pointValue: 20, tick: 0.25 },
  MES: { pointValue: 5, tick: 0.25 },
  ES: { pointValue: 50, tick: 0.25 },
}

export const DEFAULT_CONTRACTS = 2
/** Every trade in this model is taken for at least two times the risk. */
export const DEFAULT_R = 2

export const pointValue = (symbol) => CONTRACT_SPECS[symbol]?.pointValue ?? 1

const num = (value) => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function newTrade({ symbol = 'MNQ', direction = 'Bullish', contracts = DEFAULT_CONTRACTS, entry, stop, startedAt }) {
  return {
    symbol,
    direction,
    contracts,
    entry: num(entry),
    stop: num(stop),
    startedAt: startedAt ?? new Date().toISOString(),
    stopMovedToBreakEven: false,
    tp1Hit: false,
    tp2Hit: false,
    exit: null,
    exitAt: null,
  }
}

/** Risk in points between entry and stop. */
export function riskPoints(trade) {
  const entry = num(trade?.entry)
  const stop = num(trade?.stop)
  if (entry === null || stop === null) return null
  const risk = Math.abs(entry - stop)
  return risk > 0 ? risk : null
}

/** The R-multiple target, projected the way the trade is pointed. */
export function targetPrice(trade, r = DEFAULT_R) {
  const risk = riskPoints(trade)
  const entry = num(trade?.entry)
  if (risk === null || entry === null) return null
  return trade.direction === 'Bearish' ? entry - risk * r : entry + risk * r
}

/** Points made or lost at a given price, signed for the trade's direction. */
export function pointsAt(trade, price) {
  const entry = num(trade?.entry)
  const mark = num(price)
  if (entry === null || mark === null) return null
  return trade.direction === 'Bearish' ? entry - mark : mark - entry
}

export function dollarsAt(trade, price) {
  const points = pointsAt(trade, price)
  if (points === null) return null
  return points * pointValue(trade.symbol) * (trade.contracts || 1)
}

export function rMultiple(trade, price) {
  const points = pointsAt(trade, price)
  const risk = riskPoints(trade)
  if (points === null || risk === null) return null
  return points / risk
}

/** Everything the journal needs once the trade is closed out. */
export function closeTrade(trade, { exit, exitAt } = {}) {
  const closed = { ...trade, exit: num(exit), exitAt: exitAt ?? new Date().toISOString() }
  return {
    ...closed,
    pnl: dollarsAt(closed, closed.exit),
    r: rMultiple(closed, closed.exit),
  }
}

export function outcomeOf(pnl) {
  if (pnl === null || pnl === undefined) return ''
  if (pnl > 0) return 'WIN'
  if (pnl < 0) return 'LOSS'
  return 'BREAK'
}

/** Wall time the trade has been running, as mm:ss / h:mm:ss. */
export function elapsedLabel(startedAt, now = new Date()) {
  const start = new Date(startedAt).getTime()
  if (!Number.isFinite(start)) return '—'
  const seconds = Math.max(0, Math.floor((now.getTime() - start) / 1000))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  const pad = (value) => String(value).padStart(2, '0')
  return hours ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${pad(minutes)}:${pad(rest)}`
}
