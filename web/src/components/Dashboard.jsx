import { useState } from 'react'
import { motion } from 'framer-motion'
import { bandFor } from '../lib/scoring'
import { clearAllData, computeStats, deleteChecklist, downloadCsv, isPersistent, updateChecklist } from '../lib/storage'

const BAND_TEXT = { green: 'text-emerald-400', yellow: 'text-amber-300', red: 'text-rose-400' }
const OUTCOMES = ['WIN', 'LOSS', 'BREAK']

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-100">{value}</p>
    </div>
  )
}

function EditModal({ entry, onClose, onSave }) {
  const [outcome, setOutcome] = useState(entry.outcome || '')
  const [pnl, setPnl] = useState(entry.pnl || '')
  const [notes, setNotes] = useState(entry.notes || '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6"
      >
        <h3 className="text-lg font-bold">
          {entry.symbol} · {entry.score}% · {entry.decision}
        </h3>
        <p className="mt-1 text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</p>

        <p className="mt-5 text-[11px] uppercase tracking-widest text-slate-500">Outcome</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {OUTCOMES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setOutcome(outcome === option ? '' : option)}
              className={`rounded-xl border px-3 py-2 text-sm font-bold ${
                outcome === option
                  ? 'border-[#6d4aff] bg-[#6d4aff]/25 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-[11px] uppercase tracking-widest text-slate-500">
          P&amp;L
          <input
            value={pnl}
            onChange={(event) => setPnl(event.target.value)}
            inputMode="decimal"
            placeholder="e.g. 450 or -120"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#6d4aff]"
          />
        </label>

        <label className="mt-4 block text-[11px] uppercase tracking-widest text-slate-500">
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#6d4aff]"
          />
        </label>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => onSave({ outcome, pnl, notes })}
            className="flex-1 rounded-2xl bg-[#6d4aff] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-bold uppercase tracking-widest text-slate-300"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Dashboard({ checklists, onChange }) {
  const [editing, setEditing] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const stats = computeStats(checklists)
  const recent = checklists.slice(0, 10)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Completed" value={stats.total} />
        <StatCard label="Avg score" value={`${stats.avgScore}%`} />
        <StatCard label="Win rate" value={stats.winRate === null ? '—' : `${stats.winRate}%`} />
        <StatCard label="Net P&L" value={stats.netPnl ? stats.netPnl.toFixed(2) : '—'} />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => downloadCsv(checklists)}
          disabled={!checklists.length}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-widest text-slate-200 disabled:opacity-40"
        >
          Export to CSV
        </button>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          disabled={!checklists.length}
          className="flex-1 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-bold uppercase tracking-widest text-rose-300 disabled:opacity-40"
        >
          Clear all data
        </button>
      </div>

      {!isPersistent() && (
        <p className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
          Browser storage is blocked (private mode?). Checklists stay in memory for this session only — export to CSV
          before closing the tab.
        </p>
      )}

      <h3 className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-500">Recent checklists</h3>
      {!recent.length ? (
        <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
          Nothing saved yet. Finish a checklist and hit “Save checklist”.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {recent.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-bold">
                  {entry.symbol}{' '}
                  <span className={`font-black tabular-nums ${BAND_TEXT[bandFor(entry.score)]}`}>{entry.score}%</span>{' '}
                  <span className="text-xs uppercase tracking-widest text-slate-400">{entry.decision}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(entry.timestamp).toLocaleString()}
                  {entry.outcome ? ` · ${entry.outcome}` : ''}
                  {entry.pnl ? ` · ${entry.pnl}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(entry)}
                  className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-200"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onChange(deleteChecklist(entry.id))}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-500"
                >
                  Del
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-center text-xs text-slate-600">
        All data stays on this device in localStorage. No cloud, no accounts, no tracking.
      </p>

      {editing && (
        <EditModal
          entry={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            onChange(updateChecklist(editing.id, patch))
            setEditing(null)
          }}
        />
      )}

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 text-center">
            <p className="text-lg font-bold">Delete every saved checklist?</p>
            <p className="mt-2 text-sm text-slate-400">This cannot be undone. Export to CSV first if you need a copy.</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  onChange(clearAllData())
                  setConfirmClear(false)
                }}
                className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white"
              >
                Delete all
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="flex-1 rounded-2xl border border-white/15 px-4 py-3 text-sm font-bold uppercase tracking-widest text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
