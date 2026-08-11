/**
 * Confluences the trader adds and removes while the setup develops. Each entry is
 * a type + timeframe + direction, so the same array on the 1H counts for more than
 * one on the 1M, and anything pointing against the daily bias costs score.
 */

/** Higher timeframes carry more authority, exactly as they do in the walk-down. */
export const TIMEFRAME_WEIGHTS = {
  Daily: 1.6,
  '4H': 1.4,
  '1H': 1.2,
  '30M': 1,
  '15M': 1,
  '5M': 0.8,
  '3M': 0.7,
  '1M': 0.6,
}

export const CONFLUENCE_TIMEFRAMES = Object.keys(TIMEFRAME_WEIGHTS)

export const DIRECTIONS = ['Bullish', 'Bearish']

/** Correlated markets the trader watches for SMT divergence. */
export const SMT_ASSETS = ['NQ', 'ES', 'YM', 'DXY']

/**
 * Every tab in the confluence row. `stageId` is the page the item belongs to, so
 * a chip can walk the trader straight to the question behind it.
 */
export const CONFLUENCE_GROUPS = [
  {
    id: 'pdArray',
    label: 'PD arrays',
    stageId: 'm53',
    hint: 'The arrays price is delivering from after the CISD.',
    items: [
      { id: 'fvg', label: 'FVG', base: 4 },
      { id: 'ifvg', label: 'Inversion FVG', base: 4 },
      { id: 'volumeImbalance', label: 'Volume imbalance', base: 3 },
      { id: 'orderBlock', label: 'Order block', base: 3 },
      { id: 'breaker', label: 'Breaker block', base: 4 },
      { id: 'rejectionBlock', label: 'Rejection block', base: 3 },
      { id: 'swingPoint', label: 'Swing point', base: 3 },
      { id: 'quarterBlock', label: 'Quarter block', base: 2 },
      { id: 'unicorn', label: 'Unicorn (breaker + FVG)', base: 6 },
      { id: 'breakawayGap', label: 'Breakaway gap', base: 3 },
    ],
  },
  {
    id: 'cisd',
    label: 'CISD',
    stageId: 'm53',
    hint: 'Where delivery last changed state, and which way.',
    items: [
      { id: 'cisd', label: 'Change in state of delivery', base: 6 },
      { id: 'mss', label: 'Market structure shift', base: 5 },
      { id: 'bos', label: 'Break of structure', base: 4 },
    ],
  },
  {
    id: 'smt',
    label: 'SMT',
    stageId: 'm53',
    hint: 'Divergence against a correlated market.',
    asset: true,
    items: [
      { id: 'smt', label: 'SMT divergence', base: 6 },
      { id: 'psp', label: 'PSP (precision swing point)', base: 5 },
    ],
  },
  {
    id: 'fractal',
    label: 'C2 / C3 / C4',
    stageId: 'h4',
    hint: 'Which leg of the power of three is printing.',
    items: [
      { id: 'c2', label: 'C2 manipulation', base: 6 },
      { id: 'c3', label: 'C3 continuation', base: 5 },
      { id: 'c4', label: 'C4 distribution', base: 3 },
    ],
  },
  {
    id: 'liquidity',
    label: 'Liquidity',
    stageId: 'm53',
    hint: 'The pools taken before the move you want.',
    items: [
      { id: 'sweep', label: 'Liquidity sweep', base: 5 },
      { id: 'pdhPdl', label: 'PDH / PDL taken', base: 4 },
      { id: 'sessionHighLow', label: 'Session high/low taken', base: 3 },
      { id: 'equalHighsLows', label: 'Equal highs/lows taken', base: 3 },
    ],
  },
  {
    id: 'violation',
    label: 'Violations',
    stageId: 'live',
    hint: 'Anything that damages the idea. These always cost score.',
    violation: true,
    items: [
      { id: 'cisdAgainst', label: 'CISD against me', base: 8 },
      { id: 'sweptMyStop', label: 'My protected swing taken', base: 9 },
      { id: 'drawDelivered', label: 'Draw on liquidity already delivered', base: 7 },
      { id: 'arrayFailed', label: 'PD array failed to hold', base: 6 },
      { id: 'oppositeSmt', label: 'SMT flipped against me', base: 6 },
    ],
  },
]

export const GROUPS_BY_ID = Object.fromEntries(CONFLUENCE_GROUPS.map((group) => [group.id, group]))

export const CONFLUENCE_ITEMS = Object.fromEntries(
  CONFLUENCE_GROUPS.flatMap((group) =>
    group.items.map((item) => [`${group.id}:${item.id}`, { ...item, groupId: group.id, stageId: group.stageId }]),
  ),
)

export const entryKey = (entry) => `${entry.groupId}:${entry.itemId}:${entry.timeframe}:${entry.asset ?? ''}`

/** The page a chip belongs to, so the rail can walk the trader to it. */
export function entryStage(entry) {
  return GROUPS_BY_ID[entry.groupId]?.stageId ?? null
}

export function describeEntry(entry) {
  const item = CONFLUENCE_ITEMS[`${entry.groupId}:${entry.itemId}`]
  const label = item?.label ?? entry.itemId
  const asset = entry.asset ? ` vs ${entry.asset}` : ''
  return `${entry.timeframe} ${label}${asset}`
}

/**
 * Score impact of one entry. Aligned with the bias it adds, against it subtracts,
 * and a violation always subtracts however it is pointed.
 */
export function entryValue(entry, bias) {
  const item = CONFLUENCE_ITEMS[`${entry.groupId}:${entry.itemId}`]
  if (!item) return 0
  const weight = TIMEFRAME_WEIGHTS[entry.timeframe] ?? 1
  const raw = Math.round(item.base * weight)
  if (GROUPS_BY_ID[entry.groupId]?.violation) return -raw
  if (!bias || !entry.direction) return 0
  return entry.direction === bias ? raw : -raw
}

/** Confluence entries are stored on the answers object so they persist with the draft. */
export function readEntries(answers = {}) {
  return Array.isArray(answers.confluence) ? answers.confluence : []
}

/**
 * SMT is the one confluence that can point at a different instrument to trade,
 * so it gets an explicit read rather than just a number.
 */
export function smtInsight(answers = {}, symbol = 'MNQ') {
  const bias = answers.dailyBias
  const smt = readEntries(answers).filter((entry) => entry.groupId === 'smt' && entry.direction && entry.asset)
  if (!bias || !smt.length) return null
  const aligned = smt.filter((entry) => entry.direction === bias)
  if (!aligned.length) {
    const against = smt[0]
    return `SMT on ${against.timeframe} is ${against.direction.toLowerCase()} against your ${bias.toLowerCase()} bias — the correlated market is not confirming.`
  }
  const strongest = aligned[0]
  const family = symbol.includes('NQ') ? 'NQ' : 'ES'
  const other = strongest.asset
  if (other === 'DXY') {
    return `${strongest.timeframe} SMT against the dollar agrees with your ${bias.toLowerCase()} bias — inverse correlation is confirming ${symbol}.`
  }
  if (other === family) {
    return `${strongest.timeframe} SMT is inside your own family (${other}) — treat it as confirmation, not a second trade.`
  }
  return `${strongest.timeframe} SMT vs ${other} agrees with your ${bias.toLowerCase()} bias — ${other} is the one showing the divergence, so it is the cleaner instrument if you are willing to leave ${symbol}.`
}
