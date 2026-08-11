/**
 * The debrief that runs the moment a trade closes, while the chart is still fresh.
 * Timing answers itself off the entry stamp; the rest is the trader being honest
 * about management so the journal is worth reading back.
 */

import { macroFor, nyClock, sessionState } from './clock'

export const WIN_REASONS = [
  'Model ran clean',
  'C2 sweep worked',
  'CISD held',
  'Macro expansion',
  'Took the draw on liquidity',
  'Managed it well',
]

export const LOSS_REASONS = [
  'Entered before confirmation',
  'Traded against the daily bias',
  'Chased it — no PD array',
  'Stop too tight',
  'Outside my window',
  'Draw already delivered',
  'Model was right, I was early',
  'News / volatility',
]

export const MANAGEMENT_QUESTIONS = [
  { id: 'heldLonger', text: 'Could I have held longer?' },
  { id: 'couldHaveAdded', text: 'Was there a clean place to add?' },
  { id: 'stopTooFast', text: 'Did I move my stop up too fast?' },
  { id: 'followedPlan', text: 'Did I follow the plan I wrote at entry?' },
]

/** Whether the entry itself landed inside the window and a macro, read off the stamp. */
export function timingOf(startedAt) {
  if (!startedAt) return { inWindow: null, macro: null, label: 'No entry time recorded' }
  const clock = nyClock(new Date(startedAt))
  const session = sessionState(clock.minutes)
  const macro = macroFor(clock.minutes)
  const inWindow = session.phase === 'window'
  const label = inWindow
    ? macro
      ? `Entered ${clock.label} NY — inside the window and the ${macro.label}`
      : `Entered ${clock.label} NY — inside the window, outside the macros`
    : session.phase === 'pre'
      ? `Entered ${clock.label} NY — before the 9:30 open`
      : `Entered ${clock.label} NY — after 11:00, outside your window`
  return { inWindow, macro: macro?.label ?? null, label, time: clock.label }
}

export function isReviewComplete(review = {}) {
  if (!review.reason) return false
  return MANAGEMENT_QUESTIONS.every((question) => review[question.id] === 'yes' || review[question.id] === 'no')
}

/** One line per trade for the end-of-day summary. */
export function summarizeDay(records = []) {
  const wins = records.filter((item) => item.outcome === 'WIN')
  const losses = records.filter((item) => item.outcome === 'LOSS')
  const net = records.reduce((sum, item) => {
    const value = Number.parseFloat(item.pnl)
    return Number.isFinite(value) ? sum + value : sum
  }, 0)
  const inMacro = records.filter((item) => item.review?.macro).length
  const outOfWindow = records.filter((item) => item.review && item.review.inWindow === false).length
  const heldLonger = records.filter((item) => item.review?.heldLonger === 'yes').length
  const stopTooFast = records.filter((item) => item.review?.stopTooFast === 'yes').length
  const rs = records
    .map((item) => item.trade?.r)
    .filter((value) => typeof value === 'number' && Number.isFinite(value))
  const totalR = rs.reduce((sum, value) => sum + value, 0)
  return {
    count: records.length,
    wins: wins.length,
    losses: losses.length,
    net: Math.round(net * 100) / 100,
    totalR: Math.round(totalR * 100) / 100,
    inMacro,
    outOfWindow,
    heldLonger,
    stopTooFast,
  }
}

/** The lessons worth reading back, phrased as the trader would say them. */
export function dayLessons(summary) {
  const lines = []
  if (!summary.count) return lines
  if (summary.outOfWindow)
    lines.push(`${summary.outOfWindow} of ${summary.count} were taken outside 9:30–11:00 — that is the first leak to close.`)
  if (summary.heldLonger)
    lines.push(`${summary.heldLonger} could have been held longer — the draw on liquidity was still open.`)
  if (summary.stopTooFast)
    lines.push(`${summary.stopTooFast} had the stop moved up too fast, so the model never got room to work.`)
  if (summary.inMacro && summary.inMacro === summary.count)
    lines.push('Every entry landed in a macro — that is the timing discipline paying you.')
  if (summary.losses && !summary.wins)
    lines.push('No winners today. Read the entry screenshots back before you size up tomorrow.')
  return lines
}
