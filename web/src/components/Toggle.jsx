import { motion } from 'framer-motion'

export default function Toggle({ value, onChange }) {
  const isYes = value === 'yes'
  const isNo = value === 'no'

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <motion.button
        type="button"
        onClick={() => onChange('yes')}
        whileTap={{ scale: 0.96 }}
        animate={isYes ? { boxShadow: '0 0 0 3px rgba(16,185,129,0.45)' } : { boxShadow: '0 0 0 0px rgba(0,0,0,0)' }}
        className={`flex flex-1 items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${
          isYes
            ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
            : 'border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40'
        }`}
      >
        <span className="text-base font-bold tracking-wide">YES</span>
        <span
          className={`relative h-7 w-12 rounded-full transition-colors ${isYes ? 'bg-emerald-500' : 'bg-slate-700'}`}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
            style={{ left: isYes ? 26 : 4 }}
          />
        </span>
      </motion.button>

      <motion.button
        type="button"
        onClick={() => onChange('no')}
        whileTap={{ scale: 0.96 }}
        animate={isNo ? { boxShadow: '0 0 0 3px rgba(244,63,94,0.45)' } : { boxShadow: '0 0 0 0px rgba(0,0,0,0)' }}
        className={`flex flex-1 items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${
          isNo
            ? 'border-rose-400/60 bg-rose-500/15 text-rose-200'
            : 'border-white/10 bg-white/5 text-slate-300 hover:border-rose-400/40'
        }`}
      >
        <span className="text-base font-bold tracking-wide">NO</span>
        <span className={`relative h-7 w-12 rounded-full transition-colors ${isNo ? 'bg-rose-500' : 'bg-slate-700'}`}>
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
            style={{ left: isNo ? 26 : 4 }}
          />
        </span>
      </motion.button>
    </div>
  )
}
