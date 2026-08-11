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

/** Where the trader actually pulls the trigger. Anything below it stops counting. */
export const ENTRY_TIMEFRAMES = ['3M', '1M']

/**
 * One page per timeframe, walked in chronological order from the daily down to
 * the 1M. Only one is on screen at a time and base weights total 100.
 */
export const STAGES = [
  {
    id: 'h4',
    timeframe: '4H',
    title: 'Power of three',
    subtitle: 'C2 manipulation leg',
    total: 20,
    questions: [
      {
        id: 'h4C2',
        text: 'C2 formed or forming?',
        weight: 10,
        mandatory: true,
        hint: 'Either counts. A CISD plus candle closure on the timeframe below is what tells you a C2 is coming — it does not have to be 10:00 yet.',
      },
      { id: 'h4C2Direction', text: 'Is the C2 in the direction of the daily bias?', weight: 10, mandatory: true },
      {
        id: 'h4C2Sweeping',
        text: 'Is this C2 sweeping liquidity?',
        weight: 0,
        modifier: '+8%',
        hint: 'A swing point or resting stops taken out while the candle builds. A NO costs you nothing.',
      },
      {
        id: 'h4C2IntoFvg',
        text: 'Is the C2 delivering into an FVG while it sweeps?',
        weight: 0,
        modifier: '+5%',
        hint: 'Sweeping liquidity into an FVG on the same candle is the most powerful version of this leg.',
      },
      { id: 'c2AtDailyPoi', text: 'Is the C2 sitting at a daily POI?', weight: 0, modifier: '+5%' },
    ],
  },
  {
    id: 'h1',
    timeframe: '1H',
    title: 'Delivery check',
    subtitle: 'Where the last CISD is',
    total: 16,
    questions: [
      {
        id: 'lastCisdAligned',
        text: 'Is the last change in state of delivery in our direction?',
        weight: 10,
        mandatory: true,
        hardStop: true,
        hint: 'If not, there is nothing to trade yet — wait for delivery to confirm.',
      },
      { id: 'h1Closure', text: 'Candle closure on the 1H?', weight: 3, closure: '1H' },
      { id: 'h1Poi', text: 'Has the 1H delivered into a POI?', weight: 3 },
      {
        id: 'h1ClosureSweep',
        text: 'Did that closure sweep liquidity?',
        weight: 0,
        modifier: '+4%',
        hint: 'A closure that sweeps is always an extra plus. A NO costs you nothing.',
      },
    ],
  },
  {
    id: 'm30',
    timeframe: '30M',
    title: 'Continuation scan',
    subtitle: 'Fractal step down',
    total: 8,
    questions: [
      { id: 'm30Closure', text: 'Candle closure on the 30M?', weight: 4, closure: '30M' },
      { id: 'm30Cisd', text: 'CISD on the 30M in our direction?', weight: 4 },
      {
        id: 'm30ClosureSweep',
        text: 'Did that closure sweep liquidity?',
        weight: 0,
        modifier: '+4%',
        hint: 'A closure that sweeps is always an extra plus. A NO costs you nothing.',
      },
    ],
  },
  {
    id: 'm15',
    timeframe: '15M',
    title: 'Continuation scan',
    subtitle: 'Last HTF step',
    total: 8,
    questions: [
      { id: 'm15Closure', text: 'Candle closure on the 15M?', weight: 4, closure: '15M' },
      { id: 'm15Cisd', text: 'CISD on the 15M in our direction?', weight: 4 },
      {
        id: 'm15ClosureSweep',
        text: 'Did that closure sweep liquidity?',
        weight: 0,
        modifier: '+4%',
        hint: 'A closure that sweeps is always an extra plus. A NO costs you nothing.',
      },
    ],
  },
  {
    id: 'm53',
    timeframe: '5M + 3M',
    title: 'Time, liquidity & entry function',
    subtitle: 'Session levels and the C3 trigger',
    total: 40,
    questions: [
      { id: 'swept7am', text: '7AM hour high/low taken out?', weight: 2 },
      { id: 'swept8am', text: '8AM hour high/low taken out?', weight: 2 },
      { id: 'sweptAsia', text: 'Asia high/low taken out?', weight: 1 },
      { id: 'sweptLondon', text: 'London high/low taken out?', weight: 1 },
      {
        id: 'opensLocation',
        text: 'Price relative to the midnight and 8:30 opens',
        weight: 4,
        type: 'select',
        options: ['Above both', 'In between', 'Below both'],
        hint: 'Scores when it agrees with your bias: above both for bullish, below both for bearish.',
      },
      {
        id: 'pdTier',
        text: 'Where is price trading?',
        weight: 4,
        type: 'select',
        options: ['Premium', 'Equilibrium', 'Discount'],
        hint: 'Scores when the tier agrees with your bias: discount for bullish, premium for bearish.',
      },
      {
        id: 'ltfCisdDirection',
        text: 'Current change in state of delivery',
        weight: 4,
        type: 'select',
        options: ['Bullish', 'Bearish'],
        hint: 'Scores only when it matches your daily bias.',
      },
      {
        id: 'entryCisd',
        text: 'CISD confirmed on the entry timeframe?',
        weight: 8,
        mandatory: true,
        dynamic: true,
      },
      { id: 'entryMss', text: 'Market structure shift on the entry timeframe?', weight: 2, dynamic: true },
      { id: 'entryFvg', text: 'Is there an FVG near the latest CISD?', weight: 2 },
      {
        id: 'pdArrays',
        text: 'Which PD arrays are present after the CISD?',
        weight: 2,
        type: 'multi',
        options: ['FVG', 'Inversion FVG', 'Breaker', 'Order block', 'Volume imbalance', 'Rejection block'],
        hint: 'You mark them on your chart — this records what you have. 3 or more earns a bonus.',
      },
      { id: 'breakerMarked', text: 'Breaker block marked out?', weight: 0, modifier: '+3%' },
      { id: 'cisdWickOnly', text: 'Is the entry CISD wick-only rather than a body close?', weight: 0, modifier: '-20%' },
      {
        id: 'esNqAgree',
        text: 'NQ and ES showing the same CISD right now?',
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
      {
        id: 'oteAtPdArray',
        text: 'Is the OTE sitting at those PD arrays?',
        weight: 4,
        mandatory: true,
        hint: '62–79% retracement overlapping the arrays you listed.',
      },
      { id: 'rr2', text: 'R:R ≥ 2R to the next draw on liquidity?', weight: 4, mandatory: true },
      {
        id: 'entryOn',
        text: 'Which timeframe are you taking the entry on?',
        weight: 0,
        type: 'select',
        options: ENTRY_TIMEFRAMES,
        hint: 'Pick the 3M and the 1M page stops counting — the score re-weights around where you actually enter.',
      },
    ],
  },
  {
    id: 'm1',
    timeframe: '1M',
    title: 'Precision refinement',
    subtitle: 'Only if you enter on the 1M',
    total: 8,
    skipWhen: (answers) => answers.entryOn === '3M',
    questions: [
      { id: 'm1Cisd', text: 'CISD confirmed on the 1M?', weight: 4 },
      {
        id: 'm1Precision',
        text: 'Is the 1M offering a tighter entry inside the same PD array?',
        weight: 4,
        hint: 'A 1M refinement inside the array your 3M CISD created — tighter stop, same target.',
      },
    ],
  },
]

/**
 * Live invalidations the trader flips while the trade is running. They only ever
 * subtract, so the probability re-rates the moment delivery turns.
 */
export const LIVE_FLAGS = [
  { id: 'liveCisd1H', text: 'CISD flipped against me on the 1H', value: 14 },
  { id: 'liveCisd15M', text: 'CISD flipped against me on the 15M', value: 10 },
  { id: 'liveCisd5M', text: 'CISD flipped against me on the 5M', value: 7 },
  { id: 'liveCisd3M', text: 'CISD flipped against me on the 3M', value: 5 },
  { id: 'liveCisd1M', text: 'CISD flipped against me on the 1M', value: 4 },
  { id: 'liveSweptStop', text: 'Price took out my protected swing', value: 15 },
  { id: 'liveDrawDelivered', text: 'Draw on liquidity already delivered', value: 10 },
]

export const ALL_QUESTIONS = STAGES.flatMap((stage) =>
  stage.questions.map((question) => ({
    ...question,
    stageId: stage.id,
    stageTitle: stage.title,
    timeframe: stage.timeframe,
  })),
)

export const QUESTIONS_BY_ID = Object.fromEntries(ALL_QUESTIONS.map((question) => [question.id, question]))

export const MANDATORY_IDS = ALL_QUESTIONS.filter((question) => question.mandatory).map((question) => question.id)

/** Closure questions, highest timeframe first — the highest YES picks the entry timeframe. */
export const CLOSURE_QUESTIONS = [
  { id: 'h1Closure', timeframe: '1H', entryTf: '5M', label: 'C3 continuation of the 1H' },
  { id: 'm30Closure', timeframe: '30M', entryTf: '5M', label: 'C3 continuation of the 30M' },
  { id: 'm15Closure', timeframe: '15M', entryTf: '3M', label: 'C3 continuation of the 15M' },
]

/** The highest closure carries the most authority and picks the confirmation timeframe. */
export function deriveEntry(answers = {}) {
  const closures = CLOSURE_QUESTIONS.filter((item) => answers[item.id] === 'yes')
  const primary = closures[0]
  const timeframes = closures.map((item) => item.timeframe)
  if (!primary) return { closures: timeframes, primary: null, entryTf: null, label: null }
  return { closures: timeframes, primary: primary.timeframe, entryTf: primary.entryTf, label: primary.label }
}

export function questionText(question, answers) {
  if (!question.dynamic) return question.text
  const { entryTf } = deriveEntry(answers)
  return entryTf ? question.text.replace('the entry timeframe', `the ${entryTf}`) : question.text
}

/** A stage the trader has opted out of (entering on the 3M skips the 1M refinement). */
export function stageSkipped(stage, answers = {}) {
  return Boolean(stage.skipWhen?.(answers))
}

/** Questions that count right now, given the entry timeframe the trader picked. */
export function activeQuestions(answers = {}) {
  const skipped = new Set(STAGES.filter((stage) => stageSkipped(stage, answers)).map((stage) => stage.id))
  return ALL_QUESTIONS.filter((question) => !skipped.has(question.stageId))
}

export function isStageComplete(stage, answers, isAnswered) {
  return stage.questions.every((question) => isAnswered(question, answers))
}

export function isPrepComplete(answers = {}) {
  return (
    PREP_ITEMS.every((item) => answers[item.id] === true) && PREP_SELECTS.every((item) => Boolean(answers[item.id]))
  )
}
