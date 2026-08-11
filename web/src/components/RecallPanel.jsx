import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatSize, isRenderable, listRunAttachments } from '../lib/attachments'
import { dismissMatch, findSimilar, missingFromWinners } from '../lib/recall'

function Shots({ runId }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    let live = true
    let made = []
    listRunAttachments(runId)
      .then((found) => {
        if (!live) return
        made = found.slice(0, 6).map((item) => ({ ...item, url: URL.createObjectURL(item.blob) }))
        setItems(made)
      })
      .catch(() => {})
    return () => {
      live = false
      for (const item of made) URL.revokeObjectURL(item.url)
    }
  }, [runId])

  if (!items.length) return null

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <a key={item.id} href={item.url} target="_blank" rel="noreferrer" title={item.name}>
          {isRenderable(item.type, item.name) ? (
            <img src={item.url} alt={item.name} className="h-12 w-16 rounded-md border border-white/10 object-cover" />
          ) : (
            <span className="flex h-12 w-16 items-center justify-center rounded-md border border-white/10 bg-white/5 px-1 text-[8px] text-slate-400">
              {formatSize(item.size)}
            </span>
          )}
        </a>
      ))}
    </div>
  )
}

/**
 * Days that looked like today, pulled up while the setup is still forming: what
 * they paid, why the losers lost, the charts you saved, and what the winners had
 * that you are still waiting on.
 */
export default function RecallPanel({ answers, score, checklists, now }) {
  const [dismissed, setDismissed] = useState([])
  const [open, setOpen] = useState(null)
  const [tick, setTick] = useState(0)

  const matches = useMemo(
    () => findSimilar(answers, score, checklists, { now }).filter((match) => !dismissed.includes(match.record.id)),
    // `tick` re-runs the match after the learner is told a match was wrong.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, score, checklists, now, dismissed, tick],
  )
  const waitingFor = useMemo(() => missingFromWinners(answers, matches), [answers, matches])

  if (!matches.length) return null

  const notTheSame = (match) => {
    dismissMatch(match.shared)
    setDismissed((list) => [...list, match.record.id])
    setTick((value) => value + 1)
  }

  return (
    <div className="rounded-3xl border border-[#6d4aff]/40 bg-[#6d4aff]/[0.08] p-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-[#c3b4ff]">You have traded this before</p>

      <ul className="mt-3 space-y-2">
        {matches.map((match) => {
          const entry = match.record
          const won = entry.outcome === 'WIN'
          const lost = entry.outcome === 'LOSS'
          const when = new Date(entry.timestamp)
          const isOpen = open === entry.id
          return (
            <li key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              <button type="button" onClick={() => setOpen(isOpen ? null : entry.id)} className="w-full text-left">
                <p className="text-xs font-bold text-slate-100">
                  {when.toLocaleDateString()} {entry.review?.enteredAt ?? ''}{' '}
                  <span
                    className={`font-black ${won ? 'text-emerald-300' : lost ? 'text-rose-300' : 'text-slate-400'}`}
                  >
                    {entry.outcome || 'no result'}
                  </span>
                  <span className="text-slate-500"> · {Math.round(match.score * 100)}% alike</span>
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {entry.symbol} · scored {entry.score}%{entry.pnl ? ` · ${entry.pnl}` : ''}
                  {entry.review?.reason ? ` · ${entry.review.reason}` : ''}
                </p>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      What matched
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {match.sharedLabels.slice(0, 8).map((label) => (
                        <li key={label} className="text-[11px] text-slate-300">
                          · {label}
                        </li>
                      ))}
                    </ul>
                    {entry.review?.note && (
                      <p className="mt-2 rounded-xl bg-white/5 p-2 text-[11px] italic text-slate-300">
                        “{entry.review.note}”
                      </p>
                    )}
                    <Shots runId={entry.id} />
                    <button
                      type="button"
                      onClick={() => notTheSame(match)}
                      className="mt-2 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-rose-400/50 hover:text-rose-300"
                    >
                      Not the same — stop matching on this
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>

      {waitingFor.length > 0 && (
        <div className="mt-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
            Every winning version also had
          </p>
          <ul className="mt-1 space-y-0.5">
            {waitingFor.map((item) => (
              <li key={item.key} className="text-[11px] text-emerald-100">
                · {item.label}
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[10px] text-emerald-200/70">
            It has not happened yet today — that is what you are waiting on.
          </p>
        </div>
      )}
    </div>
  )
}
