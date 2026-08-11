import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DEFAULT_CONTRACTS,
  DEFAULT_R,
  closeTrade,
  dollarsAt,
  elapsedLabel,
  newTrade,
  pointValue,
  rMultiple,
  riskPoints,
  targetPrice,
} from '../lib/trade'

const CONTRACT_CHOICES = [1, 2, 3, 4, 5]

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm font-bold tabular-nums text-white outline-none focus:border-[#6d4aff]"
      />
    </label>
  )
}

function Line({ label, value, tone = 'text-slate-200' }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      <span className={`text-sm font-black tabular-nums ${tone}`}>{value}</span>
    </div>
  )
}

const round = (value, places = 2) =>
  value === null || value === undefined ? '—' : Number(value).toFixed(places)

/**
 * The in-trade ticket: one button to say you are in — late is fine, the clock starts
 * where you start it — then contracts, stop, the 2R target it implies, and the exit
 * that writes the journal entry.
 */
export default function TradeTicket({ symbol, bias, trade, onStart, onUpdate, onClose, now }) {
  const [contracts, setContracts] = useState(DEFAULT_CONTRACTS)
  const [entry, setEntry] = useState('')
  const [stop, setStop] = useState('')
  const [mark, setMark] = useState('')

  if (!trade) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Trade ticket</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Field label={`Entry (${symbol})`} value={entry} onChange={setEntry} placeholder="0.00" />
          <Field label="Stop" value={stop} onChange={setStop} placeholder="0.00" />
        </div>
        <div className="mt-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contracts</p>
          <div className="mt-1.5 flex gap-1.5">
            {CONTRACT_CHOICES.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setContracts(count)}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-black ${
                  contracts === count
                    ? 'border-[#6d4aff] bg-[#6d4aff]/25 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            onStart(
              newTrade({
                symbol,
                direction: bias === 'Bearish' ? 'Bearish' : 'Bullish',
                contracts,
                entry,
                stop,
              }),
            )
          }
          className="mt-3 w-full rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-950"
        >
          I&apos;m in a trade right now
        </motion.button>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          Prices are yours to type — this page has no market feed. Fill them in late if you had to; the clock
          starts when you press the button.
        </p>
      </div>
    )
  }

  const risk = riskPoints(trade)
  const target = targetPrice(trade, DEFAULT_R)
  const open = mark !== '' ? dollarsAt(trade, mark) : null
  const openR = mark !== '' ? rMultiple(trade, mark) : null

  return (
    <div className="rounded-3xl border border-emerald-400/40 bg-emerald-500/[0.07] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-300">In a trade</p>
        <span className="font-mono text-sm font-black tabular-nums text-emerald-200">
          {elapsedLabel(trade.startedAt, now)}
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <Line label="Direction" value={`${trade.direction} · ${trade.symbol}`} />
        <Line label="Entry" value={round(trade.entry)} />
        <Line label="Contracts" value={trade.contracts} />
        <Line label="Stop" value={round(trade.stop)} />
        <Line label="Risk" value={risk === null ? '—' : `${round(risk)} pts · $${round(risk * pointValue(trade.symbol) * trade.contracts, 0)}`} />
        <Line label={`${DEFAULT_R}R target`} value={round(target)} tone="text-emerald-300" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onUpdate({ stop: trade.entry, stopMovedToBreakEven: true })}
          className={`rounded-lg border py-1.5 text-[10px] font-black uppercase tracking-widest ${
            trade.stopMovedToBreakEven
              ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
              : 'border-white/10 bg-white/5 text-slate-300'
          }`}
        >
          Stop to BE
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ contracts: trade.contracts + 1 })}
          className="rounded-lg border border-white/10 bg-white/5 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300"
        >
          + Contract
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ tp1Hit: !trade.tp1Hit })}
          className={`rounded-lg border py-1.5 text-[10px] font-black uppercase tracking-widest ${
            trade.tp1Hit ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-300'
          }`}
        >
          TP1 hit
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ tp2Hit: !trade.tp2Hit })}
          className={`rounded-lg border py-1.5 text-[10px] font-black uppercase tracking-widest ${
            trade.tp2Hit ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-300'
          }`}
        >
          TP2 hit
        </button>
      </div>

      <div className="mt-3">
        <Field label="Price now / exit" value={mark} onChange={setMark} placeholder="0.00" />
        {open !== null && (
          <p
            className={`mt-1.5 text-xs font-black tabular-nums ${open >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}
          >
            {open >= 0 ? '+' : '−'}${round(Math.abs(open), 0)} · {round(openR, 2)}R
          </p>
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={mark === ''}
        onClick={() => onClose(closeTrade(trade, { exit: mark }))}
        className="mt-3 w-full rounded-2xl bg-rose-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-white disabled:bg-white/10 disabled:text-slate-500"
      >
        I&apos;m out — write the journal
      </motion.button>
    </div>
  )
}
