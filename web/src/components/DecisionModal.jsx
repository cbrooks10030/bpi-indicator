import { motion } from 'framer-motion'

const BAND_STYLES = {
  green: 'from-emerald-600 to-emerald-900 border-emerald-400/60',
  yellow: 'from-amber-500 to-amber-800 border-amber-300/60',
  red: 'from-rose-600 to-rose-900 border-rose-400/60',
}

function List({ title, items, tone }) {
  if (!items.length) return null
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest text-white/70">{title}</h4>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={tone}>•</span>
            <span className="text-white/90">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DecisionModal({ result, symbol, notes, onNotesChange, onSave, saved, onClose, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className={`my-6 w-full max-w-2xl rounded-3xl border bg-gradient-to-b p-6 shadow-2xl sm:p-8 ${BAND_STYLES[result.band]}`}
      >
        <div className="text-center">
          <div className="text-6xl">{result.decision.emoji}</div>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{result.decision.label}</h2>
          <p className="mt-2 text-5xl font-black tabular-nums">{result.finalScore}%</p>
          <p className="mt-1 text-sm text-white/80">
            {symbol || 'UNKNOWN'} · base {result.baseScore}% · bonus +{result.appliedBonus}% · penalty −
            {result.appliedPenalty}%
          </p>
          {result.mandatoryCapped && (
            <p className="mt-2 rounded-xl bg-black/30 px-3 py-2 text-sm font-semibold text-white">
              Capped at 50% — mandatory condition failed: {result.failedMandatory.join(', ')}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-5">
          <List title="Reasons to execute" items={result.yesReasons} tone="text-emerald-200" />
          <List title="Reasons for caution" items={result.noReasons} tone="text-rose-200" />
          <List title="Applied bonuses" items={result.bonuses.map((b) => `${b.label} (+${b.value}%)`)} tone="text-emerald-200" />
          <List title="Applied penalties" items={result.penalties.map((p) => `${p.label} (−${p.value}%)`)} tone="text-rose-200" />
          <List title="Framework read" items={result.reasons} tone="text-white" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/70">Suggested entry zone</h4>
            <p className="mt-2 text-sm text-white/90">{result.entryZone}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/70">Trader notes</h4>
            <textarea
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              rows={3}
              placeholder="Context, session, emotions, what you're watching..."
              className="mt-2 w-full rounded-xl border border-white/20 bg-black/25 p-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/60"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onSave}
            disabled={saved}
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-bold uppercase tracking-widest text-slate-900 disabled:opacity-70"
          >
            {saved ? 'Saved to local storage' : 'Save checklist'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-2xl border border-white/40 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white"
          >
            New checklist
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white/80"
          >
            Review answers
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
