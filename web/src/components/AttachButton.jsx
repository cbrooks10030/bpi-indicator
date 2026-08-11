import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ACCEPTED_TYPES,
  deleteAttachment,
  formatSize,
  isRenderable,
  listAttachments,
  saveAttachment,
} from '../lib/attachments'

/** A paperclip beside a question: drop the screenshot that made you answer that way. */
export default function AttachButton({ questionId, label = 'Attach a screenshot' }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const input = useRef(null)

  // Each file carries its own object URL, revoked when this card unmounts.
  const withUrl = (item) => ({ ...item, url: URL.createObjectURL(item.blob) })

  useEffect(() => {
    let live = true
    listAttachments(questionId)
      .then((found) => {
        if (live) setItems(found.map(withUrl))
      })
      .catch(() => {
        if (live) setError('Screenshots cannot be stored in this browser.')
      })
    return () => {
      live = false
    }
  }, [questionId])

  useEffect(
    () => () => {
      for (const item of items) URL.revokeObjectURL(item.url)
    },
    [items],
  )

  const onPick = async (event) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return
    setBusy(true)
    setError('')
    try {
      const saved = []
      for (const file of files) saved.push(withUrl(await saveAttachment(questionId, file)))
      setItems((list) => [...list, ...saved])
      setOpen(true)
    } catch {
      setError('That file could not be saved — the device may be out of space.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    await deleteAttachment(id)
    setItems((list) => list.filter((item) => item.id !== id))
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          title={label}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 transition hover:border-white/25 hover:text-slate-100 disabled:opacity-50"
        >
          {busy ? 'Saving…' : '+ Screenshot'}
        </button>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-200"
          >
            {items.length} attached {open ? '▲' : '▼'}
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          onChange={onPick}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1 text-[11px] text-rose-300">{error}</p>}
      <AnimatePresence initial={false}>
        {open && items.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex flex-wrap gap-2 overflow-hidden"
          >
            {items.map((item) => (
              <li key={item.id} className="relative">
                <a href={item.url} target="_blank" rel="noreferrer" title={item.name}>
                  {isRenderable(item.type, item.name) ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="h-16 w-24 rounded-lg border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-24 flex-col justify-center rounded-lg border border-white/10 bg-white/5 px-2 text-[9px] text-slate-300">
                      <span className="truncate font-bold">{item.name}</span>
                      <span className="text-slate-500">{formatSize(item.size)}</span>
                    </div>
                  )}
                </a>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  title="Remove this screenshot"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full border border-white/20 bg-slate-900 text-[10px] text-slate-300 hover:text-rose-300"
                >
                  ×
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
