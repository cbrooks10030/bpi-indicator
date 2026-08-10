import { motion } from 'framer-motion'
import Toggle from './Toggle'
import { questionText } from '../lib/model'

function WeightPill({ question }) {
  if (question.modifier) {
    const isBonus = question.modifier.startsWith('+')
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
          isBonus ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
        }`}
      >
        {question.modifier}
      </span>
    )
  }
  const tone =
    question.weight >= 10
      ? 'bg-[#6d4aff]/25 text-[#c3b5ff]'
      : question.weight >= 6
        ? 'bg-sky-500/15 text-sky-300'
        : 'bg-slate-500/20 text-slate-300'
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>{question.weight}%</span>
}

function MultiSelect({ question, value, onChange }) {
  const values = Array.isArray(value) ? value : []
  const toggle = (option) =>
    onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option])

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {question.options.map((option) => {
          const active = values.includes(option)
          return (
            <motion.button
              key={option}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => toggle(option)}
              className={`rounded-2xl border px-4 py-4 text-base font-bold transition-colors ${
                active
                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40'
              }`}
            >
              {option}
            </motion.button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange([])}
        className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 underline decoration-dotted"
      >
        None of these
      </button>
    </div>
  )
}

export default function QuestionCard({ question, answers, index, total, value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 120 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      className="w-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 shadow-2xl shadow-black/40 sm:p-7"
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-slate-400">
        <span className="rounded-full bg-[#6d4aff]/20 px-2.5 py-1 font-bold text-[#c3b5ff]">{question.stageTitle}</span>
        <span>
          Question {index + 1} of {total}
        </span>
        {question.mandatory && (
          <span className="rounded-full bg-rose-500/20 px-2.5 py-1 font-bold tracking-widest text-rose-300">
            REQUIRED
          </span>
        )}
        <WeightPill question={question} />
      </div>

      <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">{questionText(question, answers)}</h2>
      {question.hint && <p className="mt-2 text-sm text-slate-400">{question.hint}</p>}
      {question.hardStop && (
        <p className="mt-2 text-sm font-semibold text-rose-300/90">
          Answering NO stops the checklist — there is no trade until delivery turns.
        </p>
      )}
      {question.mandatory && !question.hardStop && (
        <p className="mt-2 text-sm text-rose-300/90">Mandatory — a NO caps the total score at 50%.</p>
      )}

      <div className="mt-6">
        {question.type === 'multi' ? (
          <MultiSelect question={question} value={value} onChange={onChange} />
        ) : question.type === 'select' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {question.options.map((option) => {
              const active = value === option
              return (
                <motion.button
                  key={option}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onChange(option)}
                  className={`rounded-2xl border px-4 py-4 text-base font-bold transition-colors ${
                    active
                      ? 'border-[#6d4aff] bg-[#6d4aff]/25 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-[#6d4aff]/60'
                  }`}
                >
                  {option}
                </motion.button>
              )
            })}
          </div>
        ) : (
          <Toggle value={value} onChange={onChange} />
        )}
      </div>
    </motion.div>
  )
}
