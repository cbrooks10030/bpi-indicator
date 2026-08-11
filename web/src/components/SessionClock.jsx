import { MACROS, WINDOW } from '../lib/clock'

const PHASES = {
  window: { label: 'In window', tone: 'text-emerald-300', dot: 'bg-emerald-400' },
  pre: { label: 'Before 9:30', tone: 'text-amber-300', dot: 'bg-amber-400' },
  closed: { label: 'Window closed', tone: 'text-rose-300', dot: 'bg-rose-400' },
  unknown: { label: '—', tone: 'text-slate-400', dot: 'bg-slate-500' },
}

const asTime = (minutes) => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`

/** Live New York clock — the fractal model is timed off the exchange day, to the second. */
export default function SessionClock({ clock, session }) {
  const phase = PHASES[session.phase] ?? PHASES.unknown

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">New York</p>
          <p className="font-mono text-3xl font-black tabular-nums text-white">{clock.label}</p>
        </div>
        <span className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${phase.tone}`}>
          <span className={`h-2 w-2 animate-pulse rounded-full ${phase.dot}`} />
          {phase.label}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Trading window {asTime(WINDOW.start)}–{asTime(WINDOW.end)}
        {session.phase === 'window' && ` · ${session.minutesLeft} min left`}
        {session.phase === 'pre' && ` · opens in ${session.minutesToOpen} min`}
        {clock.weekend && ' · weekend, futures closed'}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {MACROS.map((macro) => {
          const live = session.macro?.label === macro.label
          return (
            <span
              key={macro.label}
              className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                live ? 'bg-emerald-500/25 text-emerald-200' : 'bg-white/5 text-slate-500'
              }`}
            >
              {macro.label}
              {live ? ' · live' : ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}
