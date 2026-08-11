import { sessionState } from './clock'
import {
  CLOSURE_QUESTIONS,
  activeQuestions,
  DECISIONS,
  LIVE_FLAGS,
  MANDATORY_IDS,
  QUESTIONS_BY_ID,
  deriveEntry,
  isPrepComplete,
  questionText,
} from './model'

export const MAX_BONUS = 15
export const MAX_PENALTY = 50
export const MANDATORY_FAIL_CAP = 50
export const HARD_STOP_CAP = 25
/** Outside 9:30–11:00 there is no new trade to take, whatever the chart says. */
export const OUT_OF_WINDOW_CAP = 25
export const PRE_OPEN_PENALTY = 20
export const WINDOW_BONUS = 5
export const MACRO_BONUS = 5

const BONUS_RULES = [
  { id: 'h4C2Sweeping', value: 8, label: '4H C2 sweeping liquidity as it builds' },
  { id: 'h4C2IntoFvg', value: 5, label: 'C2 sweeping into an FVG on the same 4H candle' },
  { id: 'multiClosure', value: 5, label: 'Candle closure on more than one timeframe' },
  { id: 'h1ClosureSweep', value: 4, label: '1H closure swept liquidity' },
  { id: 'm30ClosureSweep', value: 4, label: '30M closure swept liquidity' },
  { id: 'm15ClosureSweep', value: 4, label: '15M closure swept liquidity' },
  { id: 'pdStack3', value: 6, label: '3+ PD arrays stacked after the CISD' },
  { id: 'esNqAgree', value: 5, label: 'NQ and ES agree on the LTF CISD' },
  { id: 'dxyOpposite', value: 6, label: 'Dollar printing the inverse CISD at the same time' },
  { id: 'breakerMarked', value: 3, label: 'Breaker block marked' },
  { id: 'c2AtDailyPoi', value: 5, label: '4H C2 sitting at a daily POI' },
]

const PENALTY_RULES = [
  { id: 'cisdWickOnly', value: 20, label: 'Entry CISD is wick-only, not a body close' },
  { id: 'rr2', value: 15, label: 'R:R below 2R', when: 'no' },
  { id: 'ltfCisdOpposed', value: 20, label: 'Current CISD runs against the daily bias' },
  { id: 'dxySameDirection', value: 10, label: 'Dollar moving with NQ/ES instead of against them' },
]

const WARNINGS = [
  { id: 'lastCisdAligned', when: 'no', text: 'Last CISD is against your direction — no entry trigger, wait for it to confirm' },
  { id: 'h4C2', when: 'no', text: 'No C2 on the 4H — there is no fractal leg to trade from' },
  { id: 'h4C2Direction', when: 'no', text: 'C2 opposes the daily bias — fighting structure' },
  { id: 'entryCisd', when: 'no', text: 'No CISD on the entry timeframe — no entry trigger confirmed' },
  { id: 'cisdWickOnly', when: 'yes', text: 'Entry CISD is wick-only — not a valid body-close trigger' },
  { id: 'oteAtPdArray', when: 'no', text: 'OTE is not at your PD arrays — no precision entry available' },
  { id: 'rr2', when: 'no', text: 'Risk/Reward below 2R — mathematically poor trade' },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const isYes = (answers, id) => answers[id] === 'yes'
const isNo = (answers, id) => answers[id] === 'no'
const selected = (answers, id) => (Array.isArray(answers[id]) ? answers[id] : [])

export function isAnswered(question, answers) {
  const value = answers[question.id]
  if (question.type === 'multi') return Array.isArray(value)
  if (question.type === 'select') return Boolean(value)
  return value === 'yes' || value === 'no'
}

function tierAligned(answers) {
  const tier = answers.pdTier
  if (answers.dailyBias === 'Bullish') return tier === 'Discount'
  if (answers.dailyBias === 'Bearish') return tier === 'Premium'
  return false
}

function opensAligned(answers) {
  const location = answers.opensLocation
  if (answers.dailyBias === 'Bullish') return location === 'Above both'
  if (answers.dailyBias === 'Bearish') return location === 'Below both'
  return false
}

/** The live LTF delivery has to match the bias, otherwise the trade waits for confirmation. */
export function ltfCisdOpposed(answers) {
  return Boolean(answers.ltfCisdDirection && answers.dailyBias && answers.ltfCisdDirection !== answers.dailyBias)
}

/** No closure anywhere on the 1H/30M/15M means there is no fractal leg to enter from. */
export function closureMissing(answers) {
  return CLOSURE_QUESTIONS.every((item) => isNo(answers, item.id))
}

export function questionScore(question, answers) {
  if (question.weight === 0) return 0
  if (question.type === 'multi') return selected(answers, question.id).length ? question.weight : 0
  if (question.id === 'pdTier') return tierAligned(answers) ? question.weight : 0
  if (question.id === 'opensLocation') return opensAligned(answers) ? question.weight : 0
  if (question.id === 'ltfCisdDirection') return ltfCisdOpposed(answers) || !answers.ltfCisdDirection ? 0 : question.weight
  return isYes(answers, question.id) ? question.weight : 0
}

export function decisionFor(score) {
  if (score >= 80) return DECISIONS.EXECUTE
  if (score >= 50) return DECISIONS.WATCH
  return DECISIONS.WAIT
}

export function bandFor(score) {
  return decisionFor(score).band
}

function mandatoryFailed(question, answers) {
  if (question.type === 'multi') return Array.isArray(answers[question.id]) && answers[question.id].length === 0
  return isNo(answers, question.id)
}

export function suggestedEntryZone(answers) {
  const { entryTf, label } = deriveEntry(answers)
  if (!entryTf) return 'No entry timeframe yet — you need a candle closure on the 1H, 30M, or 15M first.'
  if (isNo(answers, 'oteAtPdArray')) {
    return `No entry zone — OTE is not overlapping your PD arrays. Wait for a retracement into them on the ${entryTf}.`
  }
  const arrays = selected(answers, 'pdArrays')
  const parts = [`${label}: take the entry on the ${entryTf} OTE`]
  if (arrays.length) parts.push(`at the ${arrays.join(' / ')}`)
  if (isYes(answers, 'entryFvg')) parts.push('anchored to the FVG beside the latest CISD')
  if (answers.pdTier) parts.push(`price trading in ${answers.pdTier.toLowerCase()}`)
  return `${parts.join(', ')}. Stop beyond the CISD swing, target the next ${
    answers.dailyBias === 'Bearish' ? 'sell-side' : 'buy-side'
  } liquidity.`
}

/**
 * Reasons the trader has to wait rather than execute. These surface as a caution
 * banner on every page after the one that produced them.
 */
export function cautions(answers, nowMinutes = null) {
  const list = []
  const session = sessionState(nowMinutes)
  if (session.phase === 'pre') {
    list.push({
      stageId: 'm53',
      text: `The 9:30 open is ${session.minutesToOpen} minutes away — you do not take entries before it.`,
    })
  }
  if (session.phase === 'closed') {
    list.push({ stageId: 'm53', text: 'Past 11:00 in New York — your window is done, no new trades today.' })
  }
  for (const flag of LIVE_FLAGS) {
    if (answers[flag.id] === true) list.push({ stageId: 'live', text: `${flag.text} — the setup is degrading.` })
  }
  if (isNo(answers, 'lastCisdAligned')) {
    list.push({
      stageId: 'h1',
      text: 'The last change in state of delivery is against your bias — wait for delivery to confirm before entering.',
    })
  }
  if (ltfCisdOpposed(answers)) {
    list.push({
      stageId: 'm53',
      text: `Current CISD is ${answers.ltfCisdDirection.toLowerCase()} against a ${answers.dailyBias.toLowerCase()} bias — you do not have your trigger yet.`,
    })
  }
  if (closureMissing(answers)) {
    list.push({
      stageId: 'm15',
      text: 'No candle closure on the 1H, 30M, or 15M — there is no fractal leg to take a continuation entry from.',
    })
  }
  return list
}

/** What is still working for the trade — the rail lists these next to the cautions. */
export function inFavour(answers) {
  const list = []
  for (const array of selected(answers, 'pdArrays')) list.push(`${array} in play after the CISD`)
  if (isYes(answers, 'oteAtPdArray')) list.push('OTE overlapping those arrays')
  if (isYes(answers, 'entryFvg')) list.push('FVG beside the latest CISD')
  if (isYes(answers, 'breakerMarked')) list.push('Breaker block marked')
  if (isYes(answers, 'h4C2Sweeping')) list.push('4H C2 swept liquidity')
  for (const item of CLOSURE_QUESTIONS) {
    if (isYes(answers, `${item.id}Sweep`)) list.push(`${item.timeframe} closure swept liquidity`)
  }
  if (isYes(answers, 'h4C2IntoFvg')) list.push('4H C2 delivered into an FVG')
  if (isYes(answers, 'c2AtDailyPoi')) list.push('4H C2 at a daily POI')
  if (isYes(answers, 'esNqAgree')) list.push('NQ and ES agreeing')
  if (isYes(answers, 'dxyOpposite')) list.push('Dollar inverse at the same time')
  if (opensAligned(answers)) list.push(`Price ${answers.opensLocation.toLowerCase()} the midnight and 8:30 opens`)
  if (tierAligned(answers)) list.push(`Trading in ${answers.pdTier.toLowerCase()}`)
  if (isYes(answers, 'rr2')) list.push('R:R at 2R or better')
  return list
}

/**
 * Scores a checklist: base weights, capped confluence bonuses and penalties,
 * mandatory and hard-stop caps, and auto-generated reasoning.
 */
export function calculateScore(answers = {}, { nowMinutes = null } = {}) {
  const session = sessionState(nowMinutes)
  const active = activeQuestions(answers)
  const activeTotal = active.reduce((sum, question) => sum + question.weight, 0)
  let earned = 0
  const yesReasons = []
  const noReasons = []

  for (const question of active) {
    earned += questionScore(question, answers)
    if (question.weight === 0) continue
    const label = questionText(question, answers)
    if (question.type === 'multi') {
      const values = selected(answers, question.id)
      if (values.length) yesReasons.push(`${label} ${values.join(', ')}`)
      else if (Array.isArray(answers[question.id])) noReasons.push(`${label} none`)
      continue
    }
    if (question.type === 'select') {
      const value = answers[question.id]
      if (!value) continue
      if (questionScore(question, answers)) yesReasons.push(`${label}: ${value}`)
      else noReasons.push(`${label}: ${value} — wrong side for a ${answers.dailyBias ?? 'set'} bias`)
      continue
    }
    if (isYes(answers, question.id)) yesReasons.push(label)
    else if (isNo(answers, question.id)) noReasons.push(label)
  }

  // Skipping a timeframe re-weights the rest rather than shrinking the ceiling.
  const baseScore = activeTotal ? Math.round((100 * earned) / activeTotal) : 0
  const derived = deriveEntry(answers)
  const flags = {
    ...answers,
    multiClosure: derived.closures.length >= 2 ? 'yes' : 'no',
    pdStack3: selected(answers, 'pdArrays').length >= 3 ? 'yes' : 'no',
    ltfCisdOpposed: ltfCisdOpposed(answers) ? 'yes' : 'no',
  }

  const bonuses = BONUS_RULES.filter((rule) => isYes(flags, rule.id)).map((rule) => ({
    label: rule.label,
    value: rule.value,
  }))
  const penalties = PENALTY_RULES.filter((rule) =>
    rule.when === 'no' ? isNo(flags, rule.id) : isYes(flags, rule.id),
  ).map((rule) => ({ label: rule.label, value: rule.value }))

  if (session.phase === 'window') {
    bonuses.push({ label: 'Inside the 9:30–11:00 window', value: WINDOW_BONUS })
    if (session.macro) bonuses.push({ label: `Inside the ${session.macro.label}`, value: MACRO_BONUS })
  }
  if (session.phase === 'pre') penalties.push({ label: 'Before the 9:30 open', value: PRE_OPEN_PENALTY })
  for (const flag of LIVE_FLAGS) {
    if (answers[flag.id] === true) penalties.push({ label: flag.text, value: flag.value })
  }

  const rawBonus = bonuses.reduce((sum, item) => sum + item.value, 0)
  const rawPenalty = penalties.reduce((sum, item) => sum + item.value, 0)
  const appliedBonus = Math.min(rawBonus, MAX_BONUS)
  const appliedPenalty = Math.min(rawPenalty, MAX_PENALTY)

  const failed = active.filter((question) => question.mandatory && mandatoryFailed(question, answers))
  const noClosure = closureMissing(answers)
  const hardStopped = isNo(answers, 'lastCisdAligned')

  const adjusted = clamp(baseScore + appliedBonus - appliedPenalty, 0, 100)
  const capped = failed.length > 0 || noClosure
  let finalScore = capped ? Math.min(adjusted, MANDATORY_FAIL_CAP) : adjusted
  if (hardStopped) finalScore = Math.min(finalScore, HARD_STOP_CAP)
  if (session.phase === 'closed') finalScore = Math.min(finalScore, OUT_OF_WINDOW_CAP)

  const decision = decisionFor(finalScore)

  return {
    baseScore,
    rawBonus,
    rawPenalty,
    appliedBonus,
    appliedPenalty,
    bonuses,
    penalties,
    finalScore,
    decision,
    band: decision.band,
    hardStopped,
    failedMandatory: failed.map((question) => questionText(question, answers)),
    mandatoryCapped: capped && adjusted > MANDATORY_FAIL_CAP,
    noClosure,
    session,
    inFavour: inFavour(answers),
    cautions: cautions(answers, nowMinutes),
    reasons: buildReasons(answers, finalScore, failed.length, hardStopped, cautions(answers, nowMinutes)),
    yesReasons,
    noReasons,
    entryZone: suggestedEntryZone(answers),
    entry: derived,
    prepComplete: isPrepComplete(answers),
    answeredCount: active.filter((question) => isAnswered(question, answers)).length,
    totalCount: active.length,
  }
}

function buildReasons(answers, finalScore, failedCount, hardStopped, cautionList) {
  if (hardStopped) {
    return [
      'Last CISD is against your direction — hard stop, there is nothing to enter yet',
      'Wait for delivery to change in your favour, then re-run the checklist',
    ]
  }

  if (finalScore >= 80) {
    const messages = ['This setup has strong framework alignment']
    if (!failedCount) messages.push('All mandatory conditions met — execution ready')
    if (isYes(answers, 'h4C2Direction') && deriveEntry(answers).primary) {
      messages.push('Strong confluence from multiple timeframes')
    }
    if (isYes(answers, 'oteAtPdArray')) messages.push('OTE zone aligned with PD arrays — precision entry available')
    if (isYes(answers, 'h4C2Sweeping') && isYes(answers, 'h4C2IntoFvg')) {
      messages.push('C2 sweeping liquidity into an FVG — the strongest version of the 4H leg')
    }
    if (isYes(answers, 'esNqAgree') && isYes(answers, 'dxyOpposite')) {
      messages.push('NQ, ES, and an inverse dollar all confirm — full correlation stack')
    }
    return messages
  }

  if (finalScore < 50) {
    const seen = new Set()
    const messages = []
    for (const caution of cautionList) {
      seen.add(caution.text)
      messages.push(caution.text)
    }
    for (const rule of WARNINGS) {
      const triggered = rule.when === 'no' ? isNo(answers, rule.id) : isYes(answers, rule.id)
      if (triggered && !seen.has(rule.text)) {
        seen.add(rule.text)
        messages.push(rule.text)
      }
    }
    if (!messages.length) messages.push('Not enough confluence checked to justify risk')
    return messages
  }

  const messages = ['Partial alignment — treat as a watchlist setup, not an execution']
  if (failedCount) {
    const names = MANDATORY_IDS.filter((id) => isNo(answers, id)).map((id) => QUESTIONS_BY_ID[id].text)
    messages.push(`Score capped at ${MANDATORY_FAIL_CAP}% — mandatory condition failed: ${names.join(', ')}`)
  }
  return messages
}
