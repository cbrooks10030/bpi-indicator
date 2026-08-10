import { motion } from 'framer-motion'
import { SYMBOLS } from '../lib/model'

const BAND_STYLES = {
  red: { bar: 'bg-rose-500', text: 'text-rose-400', glow: 'shadow-rose-500/30' },
  yellow: { bar: 'bg-amber-400', text: 'text-amber-300', glow: 'shadow-amber-400/30' },
  green: { bar: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
}

export default function ScoreHeader({ score, band, answered, total, symbol, onSymbolChange, bias, entryTf }) {
  const styles = BAND_STYLES[band]

  return (
    <div className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/85 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <motion.span
              key={score}
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className={`text-3xl font-black tabular-nums ${styles.text}`}
            >
              {score}%
            </motion.span>
            <span className="text-xs uppercase tracking-widest text-slate-500">live score</span>
          </div>
          <div className="flex gap-1.5">
            {SYMBOLS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSymbolChange(option)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold tracking-wider transition-colors ${
                  symbol === option
                    ? 'bg-[#6d4aff] text-white'
                    : 'border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className={`h-3 w-full overflow-hidden rounded-full bg-white/5 shadow-inner ${styles.glow}`}>
          <motion.div
            className={`h-full rounded-full ${styles.bar}`}
            initial={false}
            animate={{ width: `${score}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>

        <div className="flex flex-wrap justify-between gap-x-3 text-[11px] uppercase tracking-widest text-slate-500">
          <span>
            {answered}/{total} answered
            {bias ? ` · ${bias}` : ''}
            {entryTf ? ` · entry ${entryTf}` : ''}
          </span>
          <span>50% watch · 80% execute</span>
        </div>
      </div>
    </div>
  )
}
