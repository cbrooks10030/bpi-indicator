import { useState } from 'react'
import { motion } from 'framer-motion'
import AttachButton from './AttachButton'
import {
  LOSS_REASONS,
  MANAGEMENT_QUESTIONS,
  WIN_REASONS,
  isReviewComplete,
  timingOf,
} from '../lib/review'
import { outcomeOf } from '../lib/trade'

/** Asked once, the moment the trade closes, while the chart is still on the screen. */
export default function TradeDebrief({ trade, onSave, onSkip }) {
  const [review, setReview] = useState({})
  const [note, setNote] = useState('')
  const outcome = outcomeOf(trade.pnl)
  const timing = timingOf(trade.startedAt)
  const reasons = outcome === 'LOSS' ? LOSS_REASONS : WIN_REASONS
  const set = (key, value) => setReview((current) => ({ ...current, [key]: value }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="my-8 w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#a48bff]">Trade closed</p>
        <h2 className="mt-1 text-2xl font-black text-white">
          {outcome === 'WIN' ? 'Winner' : outcome === 'LOSS' ? 'Loser' : 'Scratch'} ·{' '}
          <span className={trade.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
            {trade.pnl >= 0 ? '+' : '−'}${Math.abs(Math.round(trade.pnl))}
          </span>{' '}
          <span className="text-slate-400">{trade.r === null ? '' : `${trade.r.toFixed(2)}R`}</span>
        </h2>

        <p
          className={`mt-3 rounded-2xl px-4 py-3 text-xs font-bold ${
            timing.inWindow ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'
          }`}
        >
          {timing.label}
        </p>

        <div className="mt-5">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            {outcome === 'LOSS' ? 'Why did it lose?' : 'Why did it work?'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => set('reason', reason)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                  review.reason === reason
                    ? 'border-[#6d4aff] bg-[#6d4aff]/25 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-[#6d4aff]/60'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          {MANAGEMENT_QUESTIONS.map((question) => (
            <li
              key={question.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <span className="text-sm font-bold text-slate-100">{question.text}</span>
              <div className="flex shrink-0 gap-2">
                {['yes', 'no'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set(question.id, value)}
                    className={`w-14 rounded-xl border py-2 text-[11px] font-black uppercase tracking-widest ${
                      review[question.id] === value
                        ? value === 'yes'
                          ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200'
                          : 'border-rose-400/70 bg-rose-500/20 text-rose-200'
                        : 'border-white/10 bg-white/5 text-slate-400'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">What did you see?</p>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Where you thought price was going, what the higher timeframe arrays were doing, what you would do again."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#6d4aff]"
          />
          <AttachButton questionId={`trade:${trade.startedAt}`} label="Attach the closed chart" />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-2xl border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400"
          >
            Skip
          </button>
          <button
            type="button"
            disabled={!isReviewComplete(review)}
            onClick={() =>
              onSave({
                ...review,
                note,
                inWindow: timing.inWindow,
                macro: timing.macro,
                enteredAt: timing.time,
              })
            }
            className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-950 disabled:bg-white/10 disabled:text-slate-500"
          >
            Save to the journal
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
