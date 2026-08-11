import { motion } from 'framer-motion'
import { LIVE_FLAGS } from '../lib/model'

/**
 * Trade management. Flip anything here while the trade runs and the probability
 * re-rates immediately, with what is still in your favour listed in the rail.
 */
export default function LivePanel({ answers, onChange, inFavour }) {
  return (
    <section id="stage-live" className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 sm:p-7">
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#a48bff]">While the trade is running</p>
      <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Live management</h2>
      <p className="mt-2 text-sm text-slate-400">
        Delivery turns against you — tap it here and the probability drops on the spot.
      </p>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {LIVE_FLAGS.map((flag) => {
          const active = answers[flag.id] === true
          return (
            <li key={flag.id}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange(flag.id, !active)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  active
                    ? 'border-rose-400/60 bg-rose-500/15 text-rose-100'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-rose-400/40'
                }`}
              >
                <span className="text-sm font-bold">{flag.text}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black tracking-widest ${
                    active ? 'bg-rose-500/30 text-rose-200' : 'bg-white/5 text-slate-500'
                  }`}
                >
                  −{flag.value}%
                </span>
              </motion.button>
            </li>
          )
        })}
      </ul>

      <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-300">Still on your side</p>
        <p className="mt-1.5 text-sm text-emerald-100/90">
          {inFavour.length ? inFavour.join(' · ') : 'Nothing confirmed yet — there is nothing holding this trade up.'}
        </p>
      </div>
    </section>
  )
}
