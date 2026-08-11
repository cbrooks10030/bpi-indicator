import { motion } from 'framer-motion'
import { SYMBOLS } from '../lib/model'
import SessionClock from './SessionClock'

const BANDS = {
  green: { text: 'text-emerald-300', ring: 'stroke-emerald-400', border: 'border-emerald-400/40' },
  yellow: { text: 'text-amber-300', ring: 'stroke-amber-400', border: 'border-amber-400/40' },
  red: { text: 'text-rose-300', ring: 'stroke-rose-400', border: 'border-rose-400/40' },
}

function Dial({ score, band }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
        <circle cx="66" cy="66" r={radius} className="fill-none stroke-white/10" strokeWidth="10" />
        <motion.circle
          cx="66"
          cy="66"
          r={radius}
          className={`fill-none ${BANDS[band].ring}`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ type: 'spring', stiffness: 70, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-black tabular-nums ${BANDS[band].text}`}>{score}%</span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">probability</span>
      </div>
    </div>
  )
}

/** The always-visible column: probability, clock, cautions, and what is still in your favour. */
export default function ScoreRail({ result, clock, symbol, onSymbolChange, onJump }) {
  const band = BANDS[result.band]

  return (
    <div className="space-y-4">
      <div className={`rounded-3xl border bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 ${band.border}`}>
        <div className="flex gap-1.5">
          {SYMBOLS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSymbolChange(item)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-black tracking-widest transition-colors ${
                symbol === item ? 'bg-[#6d4aff] text-white' : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <Dial score={result.finalScore} band={result.band} />

        <p className={`text-center text-sm font-black uppercase tracking-widest ${band.text}`}>
          {result.decision.emoji} {result.decision.label}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
          {[
            ['Base', `${result.baseScore}%`],
            ['Answered', `${result.answeredCount}/${result.totalCount}`],
            ['Bonus', `+${result.appliedBonus}%`],
            ['Penalty', `−${result.appliedPenalty}%`],
            ['Entry TF', result.entry.entryTf ?? '—'],
            ['Bias', result.prepComplete ? '✓ set' : '—'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
              <dt className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</dt>
              <dd className="text-sm font-black text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <SessionClock clock={clock} session={result.session} />

      <div
        className={`rounded-2xl border p-4 ${
          result.cautions.length ? 'border-amber-400/50 bg-amber-500/10' : 'border-white/10 bg-white/5'
        }`}
      >
        <p
          className={`text-[11px] font-black uppercase tracking-widest ${
            result.cautions.length ? 'text-amber-300' : 'text-slate-500'
          }`}
        >
          {result.cautions.length ? `⚠ ${result.cautions.length} reason${
            result.cautions.length > 1 ? 's' : ''
          } to wait` : 'No cautions'}
        </p>
        <ul className="mt-2 space-y-2">
          {result.cautions.length ? (
            result.cautions.map((caution) => (
              <li key={caution.text}>
                <button
                  type="button"
                  onClick={() => onJump(caution.stageId)}
                  className="text-left text-xs leading-relaxed text-amber-100/90 underline-offset-2 hover:underline"
                >
                  {caution.text}
                </button>
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-500">Nothing is blocking the trade right now.</li>
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-300">In your favour</p>
        <ul className="mt-2 space-y-1">
          {result.inFavour.length ? (
            result.inFavour.map((item) => (
              <li key={item} className="text-xs text-slate-300">
                + {item}
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-500">Nothing confirmed yet.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
