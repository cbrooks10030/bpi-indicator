import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CONFLUENCE_GROUPS,
  CONFLUENCE_TIMEFRAMES,
  DIRECTIONS,
  GROUPS_BY_ID,
  SMT_ASSETS,
  describeEntry,
  entryKey,
  entryValue,
  readEntries,
} from '../lib/confluence'

const EMPTY = { itemId: null, timeframe: null, direction: null, asset: null }

function Pick({ label, options, value, onPick }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value ?? option}
            type="button"
            onClick={() => onPick(option.value ?? option)}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
              value === (option.value ?? option)
                ? 'border-[#6d4aff] bg-[#6d4aff]/25 text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-[#6d4aff]/60'
            }`}
          >
            {option.label ?? option}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * The confluence row. Every tab records what is on the chart right now — array,
 * CISD, SMT, fractal leg, liquidity, or a violation — with its timeframe and
 * direction, so the score re-rates the moment the trade changes shape.
 */
export default function ConfluenceBar({ answers, onChange, bias, onJump, insight }) {
  const [openGroup, setOpenGroup] = useState(null)
  const [draft, setDraft] = useState(EMPTY)
  const shell = useRef(null)
  const entries = readEntries(answers)
  const group = openGroup ? GROUPS_BY_ID[openGroup] : null
  const needsAsset = Boolean(group?.asset)
  const ready = draft.itemId && draft.timeframe && (group?.violation || draft.direction) && (!needsAsset || draft.asset)

  // The row stays a thin strip: the picker is a dropdown that closes on Escape or a click away.
  useEffect(() => {
    if (!openGroup) return undefined
    const onPointerDown = (event) => {
      if (shell.current && !shell.current.contains(event.target)) setOpenGroup(null)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpenGroup(null)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openGroup])

  const toggleGroup = (id) => {
    setOpenGroup((value) => (value === id ? null : id))
    setDraft(EMPTY)
  }

  const add = () => {
    const entry = {
      groupId: openGroup,
      itemId: draft.itemId,
      timeframe: draft.timeframe,
      direction: group.violation ? null : draft.direction,
      asset: needsAsset ? draft.asset : null,
    }
    const rest = entries.filter((item) => entryKey(item) !== entryKey(entry))
    onChange('confluence', [...rest, entry])
    setDraft(EMPTY)
  }

  const remove = (entry) => {
    onChange(
      'confluence',
      entries.filter((item) => entryKey(item) !== entryKey(entry)),
    )
  }

  return (
    <div ref={shell} className="relative mx-auto max-w-6xl px-4 pb-2">
      <div className="flex flex-wrap gap-1.5">
        {CONFLUENCE_GROUPS.map((item) => {
          const count = entries.filter((entry) => entry.groupId === item.id).length
          const active = openGroup === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleGroup(item.id)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition-colors ${
                active
                  ? 'border-[#6d4aff] bg-[#6d4aff]/25 text-white'
                  : item.violation
                    ? 'border-white/10 bg-white/5 text-slate-400 hover:border-rose-400/50 hover:text-rose-200'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-[#6d4aff]/60 hover:text-slate-200'
              }`}
            >
              {item.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    item.violation ? 'bg-rose-500/30 text-rose-200' : 'bg-emerald-500/25 text-emerald-200'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence initial={false}>
        {group && (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-4 right-4 top-full z-30 sm:right-auto sm:w-[30rem]"
          >
            <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl border border-white/15 bg-slate-950/95 p-3 shadow-2xl shadow-black/60 backdrop-blur">
              <p className="text-xs text-slate-400">{group.hint}</p>

              <Pick
                label="What is it"
                options={group.items.map((item) => ({ value: item.id, label: item.label }))}
                value={draft.itemId}
                onPick={(value) => setDraft((state) => ({ ...state, itemId: value }))}
              />
              <Pick
                label="Timeframe"
                options={CONFLUENCE_TIMEFRAMES}
                value={draft.timeframe}
                onPick={(value) => setDraft((state) => ({ ...state, timeframe: value }))}
              />
              {!group.violation && (
                <Pick
                  label="Direction"
                  options={DIRECTIONS}
                  value={draft.direction}
                  onPick={(value) => setDraft((state) => ({ ...state, direction: value }))}
                />
              )}
              {needsAsset && (
                <Pick
                  label="Divergent against"
                  options={SMT_ASSETS}
                  value={draft.asset}
                  onPick={(value) => setDraft((state) => ({ ...state, asset: value }))}
                />
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={add}
                  disabled={!ready}
                  className="rounded-xl bg-[#6d4aff] px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white disabled:bg-white/10 disabled:text-slate-500"
                >
                  Add to the read
                </button>
                <button
                  type="button"
                  onClick={() => onJump(group.stageId)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-300"
                >
                  Open the {group.stageId === 'h4' ? '4H' : group.stageId === 'live' ? 'live' : '5M + 3M'} page
                </button>
                <button
                  type="button"
                  onClick={() => setOpenGroup(null)}
                  className="ml-auto rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entries.map((entry) => {
            const value = entryValue(entry, bias)
            return (
              <span
                key={entryKey(entry)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                  value > 0
                    ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                    : value < 0
                      ? 'border-rose-400/50 bg-rose-500/15 text-rose-200'
                      : 'border-white/10 bg-white/5 text-slate-400'
                }`}
              >
                {describeEntry(entry)}
                <span className="tabular-nums opacity-80">
                  {value > 0 ? `+${value}` : value < 0 ? value : '0'}
                </span>
                <button
                  type="button"
                  onClick={() => remove(entry)}
                  title="Take it off the read"
                  className="text-sm leading-none opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}

      {insight && (
        <p className="mt-2 rounded-2xl border border-[#6d4aff]/40 bg-[#6d4aff]/10 px-3 py-2 text-xs text-[#c3b4ff]">
          {insight}
        </p>
      )}
    </div>
  )
}
