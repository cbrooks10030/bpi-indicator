import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Dashboard from './components/Dashboard'
import LivePanel from './components/LivePanel'
import PrepGate from './components/PrepGate'
import ResultPage from './components/ResultPage'
import ScoreRail from './components/ScoreRail'
import TimeframePage from './components/TimeframePage'
import { celebrate } from './lib/celebrate'
import { nyClock } from './lib/clock'
import { STAGES, isPrepComplete, isStageComplete, stageSkipped } from './lib/model'
import { calculateScore, isAnswered } from './lib/scoring'
import { loadChecklists, loadDraft, saveChecklist, saveDraft } from './lib/storage'

const TABS = [
  { id: 'checklist', label: 'Checklist' },
  { id: 'dashboard', label: 'Dashboard' },
]

/** Reopening a saved draft picks up on the first timeframe still missing an answer. */
function firstUnanswered(answers) {
  if (!isPrepComplete(answers)) return 0
  const stages = STAGES.filter((stage) => !stageSkipped(stage, answers))
  const position = stages.findIndex((stage) => !isStageComplete(stage, answers, isAnswered))
  return position === -1 ? stages.length + 1 : position + 1
}

export default function App() {
  const [tab, setTab] = useState('checklist')
  const [answers, setAnswers] = useState(() => loadDraft()?.answers ?? {})
  const [symbol, setSymbol] = useState(() => loadDraft()?.symbol ?? 'MNQ')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [checklists, setChecklists] = useState(() => loadChecklists())
  const [now, setNow] = useState(() => new Date())
  const [step, setStep] = useState(() => firstUnanswered(loadDraft()?.answers ?? {}))
  // Furthest timeframe reached — the top bars walk back to any of these, never forward.
  const [reached, setReached] = useState(step)
  // Set while the trader detours to fix an earlier answer, so they can hop back.
  const [detour, setDetour] = useState(null)
  const [focusId, setFocusId] = useState(null)
  const lastBand = useRef('red')

  // The clock is part of the score, so it ticks to the second.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const clock = useMemo(() => nyClock(now), [now])
  const result = useMemo(() => calculateScore(answers, { nowMinutes: clock.minutes }), [answers, clock.minutes])

  // Prep, then a page per timeframe the trader has not opted out of, then the verdict.
  const steps = useMemo(() => {
    const stages = STAGES.filter((stage) => !stageSkipped(stage, answers)).map((stage) => ({
      kind: 'stage',
      stage,
      key: stage.id,
      timeframe: stage.timeframe,
    }))
    return [
      { kind: 'prep', key: 'prep', timeframe: 'Daily' },
      ...stages,
      { kind: 'live', key: 'live', timeframe: 'Live' },
      { kind: 'result', key: 'result', timeframe: 'Verdict' },
    ]
  }, [answers])

  const index = Math.min(step, steps.length - 1)
  const current = steps[index]

  /** Walking to a timeframe unlocks its bar in the header for the rest of the run. */
  const goTo = (position) => {
    const target = Math.max(0, Math.min(position, steps.length - 1))
    setStep(target)
    setReached((value) => Math.max(value, target))
  }

  const complete =
    current.kind === 'prep'
      ? isPrepComplete(answers)
      : current.kind === 'stage'
        ? isStageComplete(current.stage, answers, isAnswered)
        : true

  useEffect(() => {
    saveDraft({ answers, symbol })
  }, [answers, symbol])

  useEffect(() => {
    const order = { red: 0, yellow: 1, green: 2 }
    if (order[result.band] > order[lastBand.current]) celebrate(result.band)
    lastBand.current = result.band
  }, [result.band])

  const advance = () => goTo(index + 1)

  /** Answering the last question on a page carries the trader to the next timeframe. */
  const setAnswer = (id, value) => {
    const next = { ...answers, [id]: value }
    setAnswers(next)
    setSaved(false)
    const filled =
      current.kind === 'prep'
        ? isPrepComplete(next)
        : current.kind === 'stage'
          ? isStageComplete(current.stage, next, isAnswered)
          : false
    // On a detour the trader goes back the way they came, not onward.
    if (filled && !detour) window.setTimeout(() => goTo(index + 1), 450)
  }

  /** Only timeframes already walked are reachable — the rail never skips ahead. */
  const jumpState = (stageId) => {
    const target = steps.findIndex((item) => item.key === stageId)
    if (target < 0) return { ok: false, reason: 'Nothing to open for this one' }
    if (target === index) return { ok: false, reason: 'You are already on this timeframe' }
    if (target > reached) return { ok: false, reason: 'You have not reached that timeframe yet' }
    return { ok: true, reason: `Go and change this on the ${steps[target].timeframe}` }
  }

  /** Rail items walk the trader back to the answer behind them, remembering the way home. */
  const jumpTo = (stageId, questionId = null) => {
    const target = steps.findIndex((item) => item.key === stageId)
    if (!jumpState(stageId).ok) return
    setDetour({ index, timeframe: current.timeframe })
    setFocusId(questionId)
    goTo(target)
  }

  const returnFromDetour = () => {
    if (!detour) return
    goTo(detour.index)
    setDetour(null)
    setFocusId(null)
  }

  const reset = () => {
    setAnswers({})
    setNotes('')
    setSaved(false)
    setStep(0)
    setReached(0)
    setDetour(null)
    setFocusId(null)
    lastBand.current = 'red'
  }

  const persist = () => {
    saveChecklist({ symbol, answers, score: result.finalScore, decision: result.decision.key, notes })
    setChecklists(loadChecklists())
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,rgba(109,74,255,0.18),transparent_55%)] pb-16">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-black tracking-tight text-white">Entry Decision</span>
            <span className="font-mono text-xs font-bold tabular-nums text-slate-400">NY {clock.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xl font-black tabular-nums ${
                result.band === 'green'
                  ? 'text-emerald-300'
                  : result.band === 'yellow'
                    ? 'text-amber-300'
                    : 'text-rose-300'
              }`}
            >
              {result.finalScore}%
            </span>
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition-colors ${
                  tab === item.id ? 'bg-[#6d4aff] text-white' : 'bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1.5 px-4 pb-3">
          {steps.map((item, position) => {
            const unlocked = position <= reached
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => unlocked && goTo(position)}
                disabled={!unlocked}
                title={unlocked ? `Back to ${item.timeframe}` : `Answer the questions in front of you first`}
                className={`group flex-1 rounded-md pt-1 ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <span
                  className={`block h-1.5 rounded-full transition-colors ${
                    position === index
                      ? 'bg-[#a48bff]'
                      : unlocked
                        ? 'bg-[#6d4aff] group-hover:bg-[#a48bff]'
                        : 'bg-white/10'
                  }`}
                />
                <span
                  className={`mt-1 hidden text-center text-[9px] font-black uppercase tracking-widest sm:block ${
                    position === index
                      ? 'text-[#c3b4ff]'
                      : unlocked
                        ? 'text-slate-400 group-hover:text-[#c3b4ff]'
                        : 'text-slate-600'
                  }`}
                >
                  {item.timeframe}
                </span>
              </button>
            )
          })}
        </nav>
      </header>

      {tab === 'dashboard' ? (
        <Dashboard checklists={checklists} onChange={setChecklists} />
      ) : (
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
            <AnimatePresence mode="wait">
              {current.kind === 'prep' ? (
                <motion.div
                  key="prep"
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
                  transition={{ duration: 0.35 }}
                >
                  <PrepGate answers={answers} onChange={setAnswer} complete={complete} focusId={focusId} />
                </motion.div>
              ) : current.kind === 'stage' ? (
                <TimeframePage
                  key={current.stage.id}
                  stage={current.stage}
                  answers={answers}
                  onChange={setAnswer}
                  pageNumber={index + 1}
                  pageCount={steps.length}
                  bias={result.bias}
                  focusId={focusId}
                />
              ) : current.kind === 'live' ? (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
                  transition={{ duration: 0.35 }}
                >
                  <LivePanel answers={answers} onChange={setAnswer} inFavour={result.inFavour} />
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
                  transition={{ duration: 0.35 }}
                >
                  <ResultPage
                    result={result}
                    symbol={symbol}
                    notes={notes}
                    onNotesChange={setNotes}
                    onSave={persist}
                    saved={saved}
                    onReset={reset}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {detour && detour.index !== index && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={returnFromDetour}
                className="mt-4 w-full rounded-2xl border border-[#6d4aff]/50 bg-[#6d4aff]/15 px-5 py-3 text-sm font-black uppercase tracking-widest text-[#c3b4ff]"
              >
                ↩ Back to {detour.timeframe} where you were
              </motion.button>
            )}

            {current.kind !== 'result' && (
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  disabled={index === 0}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-widest text-slate-300 disabled:text-slate-600"
                >
                  Back
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={advance}
                  disabled={!complete}
                  className="flex-1 rounded-2xl bg-[#6d4aff] px-5 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[#6d4aff]/30 disabled:bg-white/10 disabled:text-slate-500 disabled:shadow-none"
                >
                  {complete ? `Continue — ${steps[index + 1]?.timeframe ?? 'verdict'}` : 'Answer every question to continue'}
                </motion.button>
              </div>
            )}
          </main>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <ScoreRail
              result={result}
              clock={clock}
              symbol={symbol}
              onSymbolChange={setSymbol}
              onJump={jumpTo}
              jumpState={jumpState}
            />
          </aside>
        </div>
      )}
    </div>
  )
}
