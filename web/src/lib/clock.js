/**
 * New York session clock. Everything in the fractal model is timed off the NY
 * exchange day, so the app reads the wall clock in America/New_York rather than
 * whatever timezone the device happens to be in.
 */

const NY_TIME = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  weekday: 'short',
})

/** Trading window the trader actually takes entries in. */
export const WINDOW = { start: 9 * 60 + 30, end: 11 * 60 }

/** ICT AM macros — the highest-probability delivery windows inside the session. */
export const MACROS = [
  { label: '9:50–10:10 macro', start: 9 * 60 + 50, end: 10 * 60 + 10 },
  { label: '10:50–11:10 macro', start: 10 * 60 + 50, end: 11 * 60 + 10 },
]

export const KEY_LEVEL_TIMES = ['Midnight open', '7AM hour', '8AM hour', '8:30 open', '9:30 open']

export function nyParts(date = new Date()) {
  const parts = NY_TIME.formatToParts(date)
  const get = (type) => parts.find((part) => part.type === type)?.value ?? '00'
  const hour = Number(get('hour')) % 24
  const minute = Number(get('minute'))
  const second = Number(get('second'))
  return { hour, minute, second, weekday: get('weekday') }
}

export function nyClock(date = new Date()) {
  const { hour, minute, second, weekday } = nyParts(date)
  const minutes = hour * 60 + minute
  const pad = (value) => String(value).padStart(2, '0')
  return {
    minutes,
    second,
    weekday,
    label: `${pad(hour)}:${pad(minute)}:${pad(second)}`,
    weekend: weekday === 'Sat' || weekday === 'Sun',
  }
}

export function macroFor(minutes) {
  return MACROS.find((macro) => minutes >= macro.start && minutes < macro.end) ?? null
}

/**
 * Where the clock sits relative to the trading window: `pre` (dock the score),
 * `window` (tradeable, macros add on top), or `closed` (no new trades).
 */
export function sessionState(minutes) {
  if (minutes === null || minutes === undefined) return { phase: 'unknown', macro: null }
  if (minutes < WINDOW.start) return { phase: 'pre', macro: null, minutesToOpen: WINDOW.start - minutes }
  if (minutes >= WINDOW.end) return { phase: 'closed', macro: null }
  return { phase: 'window', macro: macroFor(minutes), minutesLeft: WINDOW.end - minutes }
}
