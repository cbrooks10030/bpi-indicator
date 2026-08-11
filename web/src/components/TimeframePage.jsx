import { motion } from 'framer-motion'
import AttachButton from './AttachButton'
import { questionText } from '../lib/model'

function YesNo({ value, onChange }) {
  return (
    <div className="flex shrink-0 gap-2">
      {[
        { key: 'yes', label: 'YES', active: 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200' },
        { key: 'no', label: 'NO', active: 'border-rose-400/70 bg-rose-500/20 text-rose-200' },
      ].map((option) => (
        <motion.button
          key={option.key}
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => onChange(option.key)}
          className={`w-16 rounded-xl border px-3 py-2 text-xs font-black tracking-widest transition-colors ${
            value === option.key ? option.active : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          {option.label}
        </motion.button>
      ))}
    </div>
  )
}

function Options({ options, isActive, onPick, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <motion.button
          key={option}
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => onPick(option)}
          className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
            isActive(option)
              ? 'border-[#6d4aff] bg-[#6d4aff]/25 text-white'
              : 'border-white/10 bg-white/5 text-slate-300 hover:border-[#6d4aff]/60'
          }`}
        >
          {option}
        </motion.button>
      ))}
    </div>
  )
}

function QuestionRow({ question, answers, value, onChange, focused }) {
  const isChoice = question.type === 'multi' || question.type === 'select'
  const values = Array.isArray(value) ? value : []

  return (
    <li
      className={`rounded-2xl border p-4 transition-colors ${
        focused ? 'border-[#6d4aff] bg-[#6d4aff]/15 shadow-lg shadow-[#6d4aff]/20' : 'border-white/10 bg-white/[0.04]'
      }`}
    >
      <div className={`flex gap-4 ${isChoice ? 'flex-col' : 'items-center justify-between'}`}>
        <div className="min-w-0">
          <p className="font-bold text-slate-100">{questionText(question, answers)}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {question.mandatory && (
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-300">
                Required
              </span>
            )}
            {question.weight > 0 && (
              <span className="rounded-full bg-[#6d4aff]/25 px-2 py-0.5 text-[10px] font-black tracking-widest text-[#c3b4ff]">
                {question.weight}%
              </span>
            )}
            {question.modifier && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black tracking-widest ${
                  question.modifier.startsWith('+')
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {question.modifier}
              </span>
            )}
          </div>
          {question.hint && <p className="mt-2 text-xs leading-relaxed text-slate-400">{question.hint}</p>}
          <AttachButton questionId={question.id} label={`Attach the chart behind "${question.text}"`} />
        </div>

        {question.type === 'multi' ? (
          <Options
            options={question.options}
            isActive={(option) => values.includes(option)}
            onPick={(option) =>
              onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option])
            }
          />
        ) : question.type === 'select' ? (
          <Options options={question.options} isActive={(option) => value === option} onPick={onChange} />
        ) : (
          <YesNo value={value} onChange={onChange} />
        )}
      </div>
    </li>
  )
}

/** The bias chosen on the daily, pinned to the top of every timeframe page. */
function BiasPill({ bias }) {
  if (!bias) return null
  const bullish = bias === 'Bullish'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-widest ${
        bullish ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300' : 'border-rose-400/50 bg-rose-500/15 text-rose-300'
      }`}
    >
      <span aria-hidden>{bullish ? '🐂' : '🐻'}</span>
      {bullish ? '▲' : '▼'} {bias} only
    </span>
  )
}

export default function TimeframePage({ stage, answers, onChange, pageNumber, pageCount, bias, focusId }) {
  return (
    <motion.section
      key={stage.id}
      initial={{ opacity: 0, x: 60, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -60, filter: 'blur(8px)' }}
      transition={{ type: 'spring', stiffness: 210, damping: 26 }}
      className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 shadow-2xl shadow-black/40 sm:p-7"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#a48bff]">Answering on the</p>
          <h2 className="text-4xl font-black leading-none tracking-tight text-white sm:text-6xl">{stage.timeframe}</h2>
          <p className="mt-2 text-sm font-semibold text-slate-300">
            {stage.title}
            <span className="text-slate-500"> · {stage.subtitle}</span>
          </p>
          <div className="mt-3">
            <BiasPill bias={bias} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] uppercase tracking-widest text-slate-500">
            Step {pageNumber}/{pageCount}
          </p>
          <p className="mt-1 text-lg font-black text-slate-200">{stage.total}%</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">of the score</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          The whole {stage.timeframe} chart
        </p>
        <AttachButton questionId={`stage:${stage.id}`} label={`Attach your ${stage.timeframe} chart`} />
      </div>

      <ul className="mt-6 space-y-3">
        {stage.questions.map((question, position) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + position * 0.04 }}
          >
            <QuestionRow
              question={question}
              answers={answers}
              value={answers[question.id]}
              onChange={(next) => onChange(question.id, next)}
              focused={focusId === question.id}
            />
          </motion.div>
        ))}
      </ul>
    </motion.section>
  )
}
