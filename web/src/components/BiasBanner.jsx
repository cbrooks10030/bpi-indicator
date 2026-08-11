import { motion } from 'framer-motion'

const BIAS = {
  Bullish: {
    animal: '🐂',
    arrow: '▲',
    word: 'Long',
    shell: 'border-emerald-400/50 bg-gradient-to-br from-emerald-500/25 to-emerald-500/5',
    text: 'text-emerald-300',
    sub: 'text-emerald-200/70',
  },
  Bearish: {
    animal: '🐻',
    arrow: '▼',
    word: 'Short',
    shell: 'border-rose-400/50 bg-gradient-to-br from-rose-500/25 to-rose-500/5',
    text: 'text-rose-300',
    sub: 'text-rose-200/70',
  },
}

/**
 * The daily bias, pinned in view on every timeframe so the walk-down never drifts
 * from the direction chosen on the daily.
 */
export default function BiasBanner({ bias, entryTf, onEdit, editable = true }) {
  const style = BIAS[bias]

  if (!style) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Bias not set</p>
        <p className="mt-1 text-xs text-slate-500">Pick bullish or bearish on the daily prep.</p>
      </div>
    )
  }

  return (
    <motion.button
      type="button"
      onClick={onEdit}
      disabled={!editable}
      title={editable ? 'Back to the daily to change your bias' : 'You are on the daily prep'}
      layout
      whileTap={{ scale: 0.98 }}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${style.shell}`}
    >
      <motion.span
        aria-hidden
        animate={{ y: bias === 'Bullish' ? [0, -4, 0] : [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        className="text-3xl leading-none"
      >
        {style.animal}
      </motion.span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daily bias</p>
        <p className={`text-lg font-black uppercase leading-tight ${style.text}`}>
          {style.arrow} {bias}
        </p>
        <p className={`text-[11px] font-bold uppercase tracking-widest ${style.sub}`}>
          {style.word} only{entryTf ? ` · entry on the ${entryTf}` : ''}
        </p>
      </div>
    </motion.button>
  )
}
