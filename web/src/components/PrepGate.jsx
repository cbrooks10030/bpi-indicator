import { motion } from 'framer-motion'
import { PREP_ITEMS, PREP_SELECTS } from '../lib/model'

export default function PrepGate({ answers, onChange, complete, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 shadow-2xl shadow-black/40 sm:p-7"
    >
      <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-rose-300">
        Required before any trade
      </span>
      <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">Daily prep</h2>

      <ul className="mt-6 space-y-3">
        {PREP_ITEMS.map((item) => {
          const done = answers[item.id] === true
          return (
            <li key={item.id}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => onChange(item.id, !done)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  done
                    ? 'border-emerald-400/50 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5 hover:border-[#6d4aff]/60'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-sm font-black ${
                    done ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-white/25 text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span className="font-bold text-slate-100">{item.text}</span>
              </motion.button>
            </li>
          )
        })}
      </ul>

      {PREP_SELECTS.map((item) => (
        <div key={item.id} className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{item.text}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {item.options.map((option) => {
              const active = answers[item.id] === option
              return (
                <motion.button
                  key={option}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onChange(item.id, option)}
                  className={`rounded-2xl border px-4 py-3 text-base font-bold transition-colors ${
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
        </div>
      ))}

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        disabled={!complete}
        className="mt-8 w-full rounded-2xl bg-[#6d4aff] px-5 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-[#6d4aff]/30 disabled:bg-white/10 disabled:text-slate-500 disabled:shadow-none"
      >
        {complete ? 'Prep done — start the checklist' : 'Complete every item to unlock'}
      </motion.button>
    </motion.div>
  )
}
