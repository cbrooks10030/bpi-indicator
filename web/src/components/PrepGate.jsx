import { motion } from 'framer-motion'
import { PREP_ITEMS, PREP_SELECTS } from '../lib/model'

export default function PrepGate({ answers, onChange, complete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 shadow-2xl shadow-black/40 sm:p-7"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#a48bff]">Answering on the</p>
          <h2 className="text-4xl font-black leading-none tracking-tight text-white sm:text-6xl">DAILY</h2>
          <p className="mt-2 text-sm font-semibold text-slate-300">
            Prep<span className="text-slate-500"> · mark these before anything else</span>
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-rose-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-300">
          Required
        </span>
      </div>

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

      <p
        className={`mt-8 rounded-2xl px-5 py-4 text-center text-sm font-black uppercase tracking-widest ${
          complete ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-slate-500'
        }`}
      >
        {complete ? 'Prep done — walk it down' : 'Complete every item to unlock'}
      </p>
    </motion.div>
  )
}
