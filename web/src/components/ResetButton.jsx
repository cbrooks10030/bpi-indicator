import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Wiping a run is one tap away on every page, but never by accident — the button
 * turns into a yes/no confirmation first.
 */
export default function ResetButton({ onReset, size = 'full' }) {
  const [asking, setAsking] = useState(false)
  const compact = size === 'compact'

  const confirm = () => {
    setAsking(false)
    onReset()
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {asking ? (
        <motion.div
          key="asking"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className={`flex items-center gap-2 rounded-2xl border border-rose-400/50 bg-rose-500/10 ${
            compact ? 'px-2 py-1' : 'w-full justify-center px-4 py-3'
          }`}
        >
          <span
            className={`font-black uppercase tracking-widest text-rose-200 ${
              compact ? 'text-[10px]' : 'text-xs'
            }`}
          >
            Start over — are you sure?
          </span>
          <button
            type="button"
            onClick={confirm}
            className={`rounded-lg bg-rose-500 font-black uppercase tracking-widest text-white ${
              compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setAsking(false)}
            className={`rounded-lg bg-white/10 font-black uppercase tracking-widest text-slate-200 ${
              compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
            }`}
          >
            No
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="idle"
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setAsking(true)}
          title="Clear every answer and start from the daily"
          className={`rounded-xl border border-white/10 bg-white/5 font-black uppercase tracking-widest text-slate-400 transition-colors hover:border-rose-400/50 hover:text-rose-200 ${
            compact ? 'px-3 py-1.5 text-[11px]' : 'w-full rounded-2xl px-5 py-3 text-xs'
          }`}
        >
          Reset
        </motion.button>
      )}
    </AnimatePresence>
  )
}
