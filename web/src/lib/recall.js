/**
 * "You have traded this before." Every saved run is reduced to the criteria that
 * were actually true, so today's read can be matched against the days that looked
 * like it — with what they cost or paid. Telling it a match is wrong decays the
 * weight of whatever made it match, so the recall sharpens with use.
 */

import { PREP_ITEMS, PREP_SELECTS, STAGES } from './model'
import { readEntries } from './confluence'
import { nyClock } from './clock'

const WEIGHTS_KEY = 'teg.recall.weights'
const MIN_WEIGHT = 0.05
const DECAY = 0.6

const QUESTIONS_BY_ID = new Map()
for (const stage of STAGES) {
  for (const question of stage.questions) QUESTIONS_BY_ID.set(question.id, { question, stage })
}
for (const item of [...PREP_ITEMS, ...PREP_SELECTS]) {
  QUESTIONS_BY_ID.set(item.id, { question: item, stage: null })
}

/** Only truthy, decision-carrying answers become features — a NO is not a fingerprint. */
export function featuresOf(answers = {}) {
  const features = []
  if (answers.dailyBias) features.push({ key: `bias:${answers.dailyBias}`, label: `${answers.dailyBias} bias` })
  if (answers.entryTimeframe)
    features.push({ key: `entryTf:${answers.entryTimeframe}`, label: `Entry on the ${answers.entryTimeframe}` })

  for (const [id, value] of Object.entries(answers)) {
    if (id === 'confluence' || id === 'dailyBias' || id === 'entryTimeframe') continue
    const known = QUESTIONS_BY_ID.get(id)
    if (!known) continue
    const text = known.question.text ?? id
    const prefix = known.stage ? `${known.stage.timeframe} · ` : 'Daily · '
    if (value === 'yes' || value === true) features.push({ key: `q:${id}`, label: `${prefix}${text}` })
    else if (typeof value === 'string' && value !== 'no')
      features.push({ key: `q:${id}=${value}`, label: `${prefix}${text} → ${value}` })
    else if (Array.isArray(value))
      for (const option of value) features.push({ key: `q:${id}=${option}`, label: `${prefix}${text} → ${option}` })
  }

  for (const entry of readEntries(answers)) {
    features.push({
      key: `conf:${entry.groupId}:${entry.itemId}:${entry.direction ?? ''}`,
      label: `${entry.timeframe} ${entry.itemId} ${entry.direction ?? ''}`.trim(),
    })
  }
  return features
}

function readWeights() {
  try {
    const raw = window.localStorage.getItem(WEIGHTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeWeights(weights) {
  try {
    window.localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights))
  } catch {
    // Private mode: the recall simply stops learning, matching still works.
  }
}

export function weightOf(key, weights = readWeights()) {
  const value = weights[key]
  return typeof value === 'number' ? value : 1
}

/** Marking a match "not the same" pulls down every criterion the two runs shared. */
export function dismissMatch(sharedKeys = []) {
  const weights = readWeights()
  for (const key of sharedKeys) {
    weights[key] = Math.max(MIN_WEIGHT, weightOf(key, weights) * DECAY)
  }
  writeWeights(weights)
  return weights
}

export function resetRecallLearning() {
  writeWeights({})
}

const hourOf = (timestamp) => {
  if (!timestamp) return null
  const clock = nyClock(new Date(timestamp))
  return clock.minutes
}

/**
 * Weighted overlap of the two reads, nudged by how close the scores and the time
 * of day were — the same criteria at 10:03 is a closer memory than at 15:00.
 */
export function similarity(current, past, weights = readWeights()) {
  const currentKeys = new Set(current.features.map((feature) => feature.key))
  const pastKeys = new Set(past.features.map((feature) => feature.key))
  if (!currentKeys.size || !pastKeys.size) return { score: 0, shared: [] }

  let sharedWeight = 0
  let unionWeight = 0
  const shared = []
  for (const key of new Set([...currentKeys, ...pastKeys])) {
    const weight = weightOf(key, weights)
    unionWeight += weight
    if (currentKeys.has(key) && pastKeys.has(key)) {
      sharedWeight += weight
      shared.push(key)
    }
  }
  let score = unionWeight ? sharedWeight / unionWeight : 0

  if (Number.isFinite(current.score) && Number.isFinite(past.score)) {
    score *= 1 - Math.min(Math.abs(current.score - past.score), 60) / 200
  }
  if (current.minutes !== null && past.minutes !== null) {
    score *= 1 - Math.min(Math.abs(current.minutes - past.minutes), 240) / 800
  }
  return { score, shared }
}

/** The past runs worth showing beside today's, best first. */
export function findSimilar(answers, currentScore, records = [], { now = new Date(), limit = 4, floor = 0.25 } = {}) {
  const weights = readWeights()
  const current = {
    features: featuresOf(answers),
    score: currentScore,
    minutes: nyClock(now).minutes,
  }
  if (current.features.length < 3) return []

  return records
    .map((record) => {
      const past = {
        features: featuresOf(record.answers ?? {}),
        score: record.score,
        minutes: hourOf(record.trade?.startedAt ?? record.timestamp),
      }
      const { score, shared } = similarity(current, past, weights)
      const labels = new Map(past.features.map((feature) => [feature.key, feature.label]))
      return {
        record,
        score,
        shared,
        sharedLabels: shared.map((key) => labels.get(key) ?? key),
      }
    })
    .filter((match) => match.score >= floor)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * What the winning versions of this setup had that today's read does not — the
 * "it has not happened yet, this is what you are waiting for" list.
 */
export function missingFromWinners(answers, matches = []) {
  const held = new Set(featuresOf(answers).map((feature) => feature.key))
  const winners = matches.filter((match) => match.record.outcome === 'WIN')
  if (!winners.length) return []

  const counts = new Map()
  for (const match of winners) {
    for (const feature of featuresOf(match.record.answers ?? {})) {
      if (held.has(feature.key)) continue
      const seen = counts.get(feature.key) ?? { label: feature.label, days: 0 }
      seen.days += 1
      counts.set(feature.key, seen)
    }
  }
  return [...counts.entries()]
    .filter(([, seen]) => seen.days === winners.length)
    .map(([key, seen]) => ({ key, label: seen.label, days: seen.days }))
    .slice(0, 5)
}
