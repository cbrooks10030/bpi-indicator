import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Dashboard from './components/Dashboard'
import DecisionModal from './components/DecisionModal'
import PrepGate from './components/PrepGate'
import QuestionCard from './components/QuestionCard'
import ScoreHeader from './components/ScoreHeader'
import { celebrate } from './lib/celebrate'
import { ALL_QUESTIONS } from './lib/model'
import { calculateScore, isAnswered } from './lib/scoring'
import { loadChecklists, loadDraft, saveChecklist, saveDraft } from './lib/storage'

const TABS = [
  { id: 'checklist', label: 'Checklist' },
  { id: 'dashboard', label: 'Dashboard' },
]

export default function App() {
  const [tab, setTab] = useState('checklist')
  const [answers, setAnswers] = useState(() => loadDraft()?.answers ?? {})
  const [symbol, setSymbol] = useState(() => loadDraft()?.symbol ?? 'MNQ')
  const [notes, setNotes] = useState('')
  const [index, setIndex] = useState(0)
  const [inPrep, setInPrep] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [checklists, setChecklists] = useState(() => loadChecklists())
  const lastBand = useRef('red')

  const result = useMemo(() => calculateScore(answers), [answers])
  const question = ALL_QUESTIONS[index]
  const complete = ALL_QUESTIONS.every((item) => isAnswered(item, answers))

  useEffect(() => {
    saveDraft({ answers, symbol })
  }, [answers, symbol])

  useEffect(() => {
    const order = { red: 0, yellow: 1, green: 2 }
    if (order[result.band] > order[lastBand.current]) celebrate(result.band)
    lastBand.current = result.band
  }, [result.band])

  const setAnswer = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }))
    setSaved(false)
  }

  const answer = (value) => {
    setAnswer(question.id, value)
    // Multi-selects stay put so several timeframes or arrays can be ticked.
    if (question.type !== 'multi' && index < ALL_QUESTIONS.length - 1) {
      setTimeout(() => setIndex((current) => Math.min(current + 1, ALL_QUESTIONS.length - 1)), 260)
    }
  }

  const reset = () => {
    setAnswers({})
    setNotes('')
    setIndex(0)
    setInPrep(true)
    setShowModal(false)
    setSaved(false)
    lastBand.current = 'red'
  }

  const persist = () => {
    saveChecklist({
      symbol,
      answers,
      score: result.finalScore,
      decision: result.decision.key,
      notes,
    })
    setChecklists(loadChecklists())
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_top,rgba(109,74,255,0.18),transparent_55%)]">
      <ScoreHeader
        score={result.finalScore}
        band={result.band}
        answered={result.answeredCount}
        total={result.totalCount}
        symbol={symbol}
        onSymbolChange={setSymbol}
        bias={answers.dailyBias}
        entryTf={result.entry.entryTf}
      />

      <div className="mx-auto flex max-w-3xl gap-2 px-4 pt-4">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold uppercase tracking-widest transition-colors ${
              tab === item.id
                ? 'bg-[#6d4aff] text-white'
                : 'border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'checklist' ? (
        <div className="mx-auto max-w-3xl px-4 py-6">
          {inPrep ? (
            <PrepGate
              answers={answers}
              onChange={setAnswer}
              complete={result.prepComplete}
              onContinue={() => setInPrep(false)}
            />
          ) : (
            <>
              <AnimatePresence mode="wait">
                <QuestionCard
                  key={question.id}
                  question={question}
                  answers={answers}
                  index={index}
                  total={ALL_QUESTIONS.length}
                  value={answers[question.id]}
                  onChange={answer}
                />
              </AnimatePresence>

              {result.hardStopped && (
                <p className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
                  Delivery is against you — the last CISD never turned. No trade until it does.
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => (index === 0 ? setInPrep(true) : setIndex((current) => current - 1))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-widest text-slate-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((current) => Math.min(current + 1, ALL_QUESTIONS.length - 1))}
                  disabled={index === ALL_QUESTIONS.length - 1}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-widest text-slate-300 disabled:opacity-40"
                >
                  Next
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModal(true)}
                  disabled={!complete}
                  className="flex-1 rounded-2xl bg-[#6d4aff] px-5 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-[#6d4aff]/30 disabled:bg-white/10 disabled:text-slate-500 disabled:shadow-none"
                >
                  {complete ? 'Get decision' : `${result.totalCount - result.answeredCount} left`}
                </motion.button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-400 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="uppercase tracking-widest text-slate-500">Base</p>
                  <p className="mt-1 text-lg font-bold text-slate-100">{result.baseScore}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="uppercase tracking-widest text-slate-500">Bonus</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">+{result.appliedBonus}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="uppercase tracking-widest text-slate-500">Penalty</p>
                  <p className="mt-1 text-lg font-bold text-rose-400">−{result.appliedPenalty}%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="uppercase tracking-widest text-slate-500">Entry TF</p>
                  <p className="mt-1 text-lg font-bold text-slate-100">{result.entry.entryTf ?? '—'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={reset}
                className="mt-6 w-full rounded-2xl border border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Reset checklist
              </button>
            </>
          )}
        </div>
      ) : (
        <Dashboard checklists={checklists} onChange={setChecklists} />
      )}

      <AnimatePresence>
        {showModal && (
          <DecisionModal
            result={result}
            symbol={symbol}
            notes={notes}
            onNotesChange={setNotes}
            onSave={persist}
            saved={saved}
            onClose={() => setShowModal(false)}
            onReset={reset}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
