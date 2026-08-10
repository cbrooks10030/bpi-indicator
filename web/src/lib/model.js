export const SYMBOLS = ['MNQ', 'NQ', 'MES', 'ES']

export const DECISIONS = {
  EXECUTE: { key: 'EXECUTE', label: 'EXECUTE TRADE NOW', emoji: '✅', band: 'green' },
  WATCH: { key: 'WATCH', label: 'WATCH CLOSELY', emoji: '⚡', band: 'yellow' },
  WAIT: { key: 'WAIT', label: 'WAIT - NOT VALID SETUP', emoji: '❌', band: 'red' },
}

/**
 * Daily prep. Unscored and unskippable: nothing downstream unlocks until every
 * item is marked, because these are the levels the later questions refer back to.
 */
export const PREP_ITEMS = [
  { id: 'prepLiquidity', text: 'External and internal liquidity identified' },
  { id: 'prepPdhPdl', text: 'Previous day high and low marked' },
  { id: 'prepNextFvgs', text: 'Next FVGs mapped' },
  { id: 'prepVolumeImbalance', text: 'Volume imbalances marked' },
]

export const PREP_SELECTS = [
  {
    id: 'prepOrigin',
    text: 'Coming from',
    options: ['External swing', 'Internal FVG'],
  },
  {
    id: 'dailyBias',
    text: 'Daily bias',
    options: ['Bullish', 'Bearish'],
  },
]

export const STAGES = [
  {
    id: 'h4',
    title: '4H Power of Three',
    subtitle: 'C2 manipulation leg',
    total: 25,
    questions: [
      {
        id: 'h4C2',
        text: 'C2 formed or forming on the 4H?',
        weight: 8,
        mandatory: true,
        hint: 'Either is fine — formed already or still building.',
      },
      {
        id: 'h4C2Direction',
        text: 'Is the C2 in the direction of the daily bias?',
        weight: 9,
        mandatory: true,
      },
      {
        id: 'h4C2Swept',
        text: 'Has the C2 been swept?',
        weight: 8,
        mandatory: true,
        hint: 'A sweep of C2 is required whether the candle is still forming or already closed.',
      },
    ],
  },
  {
    id: 'cisd',
    title: 'CISD & Closure Scan',
    subtitle: '1H / 30M / 15M',
    total: 20,
    questions: [
      {
        id: 'lastCisdAligned',
        text: 'Is the last change in state of delivery in our direction?',
        weight: 12,
        mandatory: true,
        hardStop: true,
        hint: 'If not, there is nothing to trade yet — wait for it to confirm.',
      },
      {
        id: 'closures',
        text: 'Which timeframes have a candle closure?',
        weight: 8,
        mandatory: true,
        type: 'multi',
        options: ['1H', '30M', '15M'],
        hint: 'Check every one that applies — the highest one sets your entry timeframe.',
      },
    ],
  },
  {
    id: 'entry',
    title: 'Entry Function',
    subtitle: 'C3 continuation',
    total: 35,
    questions: [
      {
        id: 'entryCisd',
        text: 'CISD confirmed on the entry timeframe?',
        weight: 10,
        mandatory: true,
        dynamic: true,
      },
      { id: 'entryMss', text: 'Market structure shift on the entry timeframe?', weight: 4, dynamic: true },
      { id: 'entryFvg', text: 'Is there an FVG near the latest CISD?', weight: 4 },
      {
        id: 'pdArrays',
        text: 'Which PD arrays are present after the CISD?',
        weight: 4,
        type: 'multi',
        options: ['FVG', 'Inversion FVG', 'Breaker', 'Order block', 'Volume imbalance', 'Rejection block'],
        hint: 'You mark them on your chart — this just records what you have. 3 or more earns a bonus.',
      },
      {
        id: 'oteAtPdArray',
        text: 'Is the OTE sitting at those PD arrays?',
        weight: 8,
        mandatory: true,
        hint: '62–79% retracement overlapping the arrays you just listed.',
      },
      { id: 'rr2', text: 'R:R ≥ 2R to the next draw on liquidity?', weight: 5, mandatory: true },
      { id: 'breakerMarked', text: 'Breaker block marked out?', weight: 0, modifier: '+3%' },
      { id: 'cisdWickOnly', text: 'Is the entry CISD wick-only rather than a body close?', weight: 0, modifier: '-20%' },
    ],
  },
  {
    id: 'liquidity',
    title: 'Time & Liquidity',
    subtitle: 'Session levels',
    total: 20,
    questions: [
      { id: 'swept7am', text: '7AM hour high/low taken out?', weight: 4 },
      { id: 'swept8am', text: '8AM hour high/low taken out?', weight: 4 },
      { id: 'sweptAsia', text: 'Asia high/low taken out?', weight: 3 },
      { id: 'sweptLondon', text: 'London high/low taken out?', weight: 3 },
      {
        id: 'pdTier',
        text: 'Where is price trading?',
        weight: 6,
        type: 'select',
        options: ['Premium', 'Equilibrium', 'Discount'],
        hint: 'Scores when the tier agrees with your bias: discount for bullish, premium for bearish.',
      },
      { id: 'beforeNineThirty', text: 'Entering before 9:30 AM?', weight: 0, modifier: '-20%' },
    ],
  },
  {
    id: 'correlation',
    title: 'Correlation',
    subtitle: 'Confluence only — never a gate',
    total: 0,
    questions: [
      {
        id: 'esNqAgree',
        text: 'NQ and ES showing the same CISD on the 3M/5M?',
        weight: 0,
        modifier: '+5%',
        hint: 'Correlated agreement supports the trade but never decides it.',
      },
      {
        id: 'dxyOpposite',
        text: 'Is the dollar printing the opposite CISD at the same time?',
        weight: 0,
        modifier: '+6%',
        hint: 'DXY inverse to NQ/ES at the same moment is the full triple confirmation.',
      },
      {
        id: 'dxySameDirection',
        text: 'Is the dollar moving with NQ/ES instead of against them?',
        weight: 0,
        modifier: '-10%',
      },
      { id: 'c2AtDailyPoi', text: 'Is the 4H C2 sitting at a daily POI?', weight: 0, modifier: '+5%' },
      { id: 'fightingBias', text: 'Does this setup fight the daily bias?', weight: 0, modifier: '-20%' },
    ],
  },
]

export const ALL_QUESTIONS = STAGES.flatMap((stage) =>
  stage.questions.map((question) => ({ ...question, stageId: stage.id, stageTitle: stage.title })),
)

export const QUESTIONS_BY_ID = Object.fromEntries(ALL_QUESTIONS.map((question) => [question.id, question]))

export const MANDATORY_IDS = ALL_QUESTIONS.filter((question) => question.mandatory).map((question) => question.id)

const ENTRY_MAP = {
  '1H': { entryTf: '5M', label: 'C3 continuation of the 1H' },
  '30M': { entryTf: '5M', label: 'C3 continuation of the 30M' },
  '15M': { entryTf: '3M', label: 'C3 continuation of the 15M' },
}

const CLOSURE_PRIORITY = ['1H', '30M', '15M']

/** The highest closure carries the most authority and picks the confirmation timeframe. */
export function deriveEntry(answers = {}) {
  const closures = Array.isArray(answers.closures) ? answers.closures : []
  const primary = CLOSURE_PRIORITY.find((timeframe) => closures.includes(timeframe))
  if (!primary) return { closures, primary: null, entryTf: null, label: null }
  return { closures, primary, ...ENTRY_MAP[primary] }
}

export function questionText(question, answers) {
  if (!question.dynamic) return question.text
  const { entryTf } = deriveEntry(answers)
  return entryTf ? question.text.replace('the entry timeframe', `the ${entryTf}`) : question.text
}

export function isPrepComplete(answers = {}) {
  return (
    PREP_ITEMS.every((item) => answers[item.id] === true) &&
    PREP_SELECTS.every((item) => Boolean(answers[item.id]))
  )
}
