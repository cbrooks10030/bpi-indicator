import { motion } from 'framer-motion'

const BAND_STYLES = {
  green: {
    shell: 'border-emerald-400/50 from-emerald-500/25',
    text: 'text-emerald-300',
    ring: 'stroke-emerald-400',
  },
  yellow: {
    shell: 'border-amber-400/50 from-amber-500/25',
    text: 'text-amber-300',
    ring: 'stroke-amber-400',
  },
  red: {
    shell: 'border-rose-400/50 from-rose-500/25',
    text: 'text-rose-300',
    ring: 'stroke-rose-400',
  },
}

function ProbabilityDial({ score, styles }) {
  const radius = 66
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={radius} className="fill-none stroke-white/10" strokeWidth="12" />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          className={`fill-none ${styles.ring}`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-black tabular-nums ${styles.text}`}>{score}%</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">probability</span>
      </div>
    </div>
  )
}

export default function ResultPage({ result, symbol, notes, onNotesChange, onSave, saved, onReset }) {
  const styles = BAND_STYLES[result.band]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border bg-gradient-to-b to-white/[0.02] p-5 shadow-2xl shadow-black/40 sm:p-7 ${styles.shell}`}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <ProbabilityDial score={result.finalScore} styles={styles} />
        <div className="text-center sm:text-left">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{symbol} verdict</p>
          <h2 className={`mt-1 text-3xl font-black leading-tight sm:text-4xl ${styles.text}`}>
            {result.decision.emoji} {result.decision.label}
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Base {result.baseScore}% · bonus +{result.appliedBonus}% · penalty −{result.appliedPenalty}%
            {result.entry.entryTf ? ` · entry ${result.entry.entryTf}` : ''}
          </p>
          {result.hardStopped && (
            <p className="mt-2 text-sm font-bold text-rose-300">
              Hard stop: delivery never turned in your direction.
            </p>
          )}
          {!result.hardStopped && result.mandatoryCapped && (
            <p className="mt-2 text-sm font-bold text-amber-300">Capped at 50% — a required condition failed.</p>
          )}
        </div>
      </div>

      {result.cautions.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-400/50 bg-amber-500/10 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-amber-300">Why you should wait</p>
          <ul className="mt-2 space-y-1.5">
            {result.cautions.map((caution) => (
              <li key={caution.text} className="text-sm text-amber-100/90">
                {caution.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-300">Reasons to execute</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {result.yesReasons.length ? (
              result.yesReasons.map((reason) => <li key={reason}>+ {reason}</li>)
            ) : (
              <li className="text-slate-500">Nothing confirmed yet.</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-rose-300">Reasons for caution</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {result.noReasons.length ? (
              result.noReasons.map((reason) => <li key={reason}>− {reason}</li>)
            ) : (
              <li className="text-slate-500">No red flags checked.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-black uppercase tracking-widest text-[#c3b4ff]">Read on the setup</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-300">
          {result.reasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-black uppercase tracking-widest text-[#c3b4ff]">Suggested entry zone</p>
        <p className="mt-1 text-sm text-slate-300">{result.entryZone}</p>
      </div>

      <textarea
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder="Trader notes (optional)"
        rows={3}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-[#6d4aff] focus:outline-none"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          className="flex-1 rounded-2xl bg-[#6d4aff] px-5 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[#6d4aff]/30"
        >
          {saved ? 'Saved to local storage ✓' : 'Save checklist'}
        </motion.button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black uppercase tracking-widest text-slate-500"
        >
          New
        </button>
      </div>
    </motion.section>
  )
}
