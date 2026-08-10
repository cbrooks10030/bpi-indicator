import {
  ALL_QUESTIONS,
  DECISIONS,
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

const BONUS_RULES = [
  { id: 'multiClosure', value: 5, label: 'Candle closure on more than one timeframe' },
  { id: 'pdStack3', value: 6, label: '3+ PD arrays stacked after the CISD' },
  { id: 'esNqAgree', value: 5, label: 'NQ and ES agree on the LTF CISD' },
  { id: 'dxyOpposite', value: 6, label: 'Dollar printing the inverse CISD at the same time' },
  { id: 'breakerMarked', value: 3, label: 'Breaker block marked' },
  { id: 'c2AtDailyPoi', value: 5, label: '4H C2 sitting at a daily POI' },
]

const PENALTY_RULES = [
  { id: 'beforeNineThirty', value: 20, label: 'Entering before 9:30 AM' },
  { id: 'h4C2Swept', value: 15, label: 'C2 has not been swept', when: 'no' },
  { id: 'cisdWickOnly', value: 20, label: 'Entry CISD is wick-only, not a body close' },
  { id: 'rr2', value: 15, label: 'R:R below 2R', when: 'no' },
  { id: 'fightingBias', value: 20, label: 'Setup fights the daily bias' },
  { id: 'dxySameDirection', value: 10, label: 'Dollar moving with NQ/ES instead of against them' },
]

const WARNINGS = [
  { id: 'lastCisdAligned', when: 'no', text: 'Last CISD is against your direction — no entry trigger, wait for it to confirm' },
  { id: 'h4C2', when: 'no', text: 'No C2 on the 4H — there is no fractal leg to trade from' },
  { id: 'h4C2Direction', when: 'no', text: 'C2 opposes the daily bias — fighting structure' },
  { id: 'h4C2Swept', when: 'no', text: 'C2 never swept — the manipulation leg is incomplete' },
  { id: 'entryCisd', when: 'no', text: 'No CISD on the entry timeframe — no entry trigger confirmed' },
  { id: 'cisdWickOnly', when: 'yes', text: 'Entry CISD is wick-only — not a valid body-close trigger' },
  { id: 'oteAtPdArray', when: 'no', text: 'OTE is not at your PD arrays — no precision entry available' },
  { id: 'rr2', when: 'no', text: 'Risk/Reward below 2R — mathematically poor trade' },
  { id: 'fightingBias', when: 'yes', text: 'Daily bias conflicts — fighting structure' },
  { id: 'beforeNineThirty', when: 'yes', text: 'Early in session before 9:30 AM — wait for stabilization' },
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

export function questionScore(question, answers) {
  if (question.weight === 0) return 0
  if (question.type === 'multi') return selected(answers, question.id).length ? question.weight : 0
  if (question.id === 'pdTier') return tierAligned(answers) ? question.weight : 0
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
 * Scores a checklist: base weights, capped confluence bonuses and penalties,
 * mandatory and hard-stop caps, and auto-generated reasoning.
 */
export function calculateScore(answers = {}) {
  let baseScore = 0
  const yesReasons = []
  const noReasons = []

  for (const question of ALL_QUESTIONS) {
    baseScore += questionScore(question, answers)
    if (question.weight === 0) continue
    const label = questionText(question, answers)
    if (question.type === 'multi') {
      const values = selected(answers, question.id)
      if (values.length) yesReasons.push(`${label} ${values.join(', ')}`)
      else if (Array.isArray(answers[question.id])) noReasons.push(`${label} none`)
      continue
    }
    if (question.id === 'pdTier') {
      if (!answers.pdTier) continue
      if (tierAligned(answers)) yesReasons.push(`Trading in ${answers.pdTier.toLowerCase()} with the bias`)
      else noReasons.push(`Trading in ${answers.pdTier.toLowerCase()} — wrong side for a ${answers.dailyBias} bias`)
      continue
    }
    if (isYes(answers, question.id)) yesReasons.push(label)
    else if (isNo(answers, question.id)) noReasons.push(label)
  }

  const derived = deriveEntry(answers)
  const flags = {
    ...answers,
    multiClosure: derived.closures.length >= 2 ? 'yes' : 'no',
    pdStack3: selected(answers, 'pdArrays').length >= 3 ? 'yes' : 'no',
  }

  const bonuses = BONUS_RULES.filter((rule) => isYes(flags, rule.id)).map((rule) => ({
    label: rule.label,
    value: rule.value,
  }))
  const penalties = PENALTY_RULES.filter((rule) =>
    rule.when === 'no' ? isNo(answers, rule.id) : isYes(answers, rule.id),
  ).map((rule) => ({ label: rule.label, value: rule.value }))

  const rawBonus = bonuses.reduce((sum, item) => sum + item.value, 0)
  const rawPenalty = penalties.reduce((sum, item) => sum + item.value, 0)
  const appliedBonus = Math.min(rawBonus, MAX_BONUS)
  const appliedPenalty = Math.min(rawPenalty, MAX_PENALTY)

  const failed = ALL_QUESTIONS.filter(
    (question) => question.mandatory && mandatoryFailed(question, answers),
  )
  const hardStopped = isNo(answers, 'lastCisdAligned')

  const adjusted = clamp(baseScore + appliedBonus - appliedPenalty, 0, 100)
  let finalScore = failed.length ? Math.min(adjusted, MANDATORY_FAIL_CAP) : adjusted
  if (hardStopped) finalScore = Math.min(finalScore, HARD_STOP_CAP)

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
    mandatoryCapped: failed.length > 0 && adjusted > MANDATORY_FAIL_CAP,
    reasons: buildReasons(answers, finalScore, failed.length, hardStopped),
    yesReasons,
    noReasons,
    entryZone: suggestedEntryZone(answers),
    entry: derived,
    prepComplete: isPrepComplete(answers),
    answeredCount: ALL_QUESTIONS.filter((question) => isAnswered(question, answers)).length,
    totalCount: ALL_QUESTIONS.length,
  }
}

function buildReasons(answers, finalScore, failedCount, hardStopped) {
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
    if (isYes(answers, 'esNqAgree') && isYes(answers, 'dxyOpposite')) {
      messages.push('NQ, ES, and an inverse dollar all confirm — full correlation stack')
    }
    return messages
  }

  if (finalScore < 50) {
    const seen = new Set()
    const messages = []
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
