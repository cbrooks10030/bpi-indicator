const STORAGE_KEY = 'teg.checklists.v1'
const DRAFT_KEY = 'teg.draft.v1'

let memoryFallback = {}
let warnedUnavailable = false

function storage() {
  try {
    const probe = '__teg_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    if (!warnedUnavailable) {
      warnedUnavailable = true
      console.warn('localStorage unavailable (private mode or blocked) — using in-memory storage for this session.')
    }
    return null
  }
}

export function isPersistent() {
  return storage() !== null
}

function readKey(key, fallback) {
  const store = storage()
  const raw = store ? store.getItem(key) : memoryFallback[key]
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    console.warn(`Corrupt data at ${key} — resetting.`)
    writeKey(key, fallback)
    return fallback
  }
}

function writeKey(key, value) {
  const raw = JSON.stringify(value)
  const store = storage()
  if (store) {
    try {
      store.setItem(key, raw)
      return true
    } catch {
      console.warn('localStorage write failed (quota or blocked) — keeping data in memory only.')
    }
  }
  memoryFallback[key] = raw
  return false
}

export function loadChecklists() {
  const list = readKey(STORAGE_KEY, [])
  return Array.isArray(list) ? list : []
}

export function saveChecklist(entry) {
  const list = loadChecklists()
  const record = {
    id: entry.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    symbol: entry.symbol || 'UNKNOWN',
    answers: entry.answers ?? {},
    score: entry.score ?? 0,
    decision: entry.decision ?? 'WAIT',
    notes: entry.notes ?? '',
    outcome: entry.outcome ?? '',
    pnl: entry.pnl ?? '',
    trade: entry.trade ?? null,
  }
  writeKey(STORAGE_KEY, [record, ...list])
  return record
}

export function updateChecklist(id, patch) {
  const list = loadChecklists().map((item) => (item.id === id ? { ...item, ...patch } : item))
  writeKey(STORAGE_KEY, list)
  return list
}

export function deleteChecklist(id) {
  const list = loadChecklists().filter((item) => item.id !== id)
  writeKey(STORAGE_KEY, list)
  return list
}

export function clearAllData() {
  writeKey(STORAGE_KEY, [])
  writeKey(DRAFT_KEY, null)
  memoryFallback = {}
  return []
}

export function loadDraft() {
  return readKey(DRAFT_KEY, null)
}

export function saveDraft(draft) {
  return writeKey(DRAFT_KEY, draft)
}

export function computeStats(list) {
  const total = list.length
  const avgScore = total ? Math.round(list.reduce((sum, item) => sum + (item.score || 0), 0) / total) : 0
  const graded = list.filter((item) => item.outcome === 'WIN' || item.outcome === 'LOSS')
  const wins = graded.filter((item) => item.outcome === 'WIN').length
  const winRate = graded.length ? Math.round((wins / graded.length) * 100) : null
  const netPnl = list.reduce((sum, item) => {
    const value = Number.parseFloat(item.pnl)
    return Number.isFinite(value) ? sum + value : sum
  }, 0)
  const executed = list.filter((item) => item.decision === 'EXECUTE').length
  return { total, avgScore, winRate, gradedCount: graded.length, netPnl, executed }
}

const CSV_COLUMNS = ['id', 'timestamp', 'symbol', 'score', 'decision', 'outcome', 'pnl', 'notes', 'trade', 'answers']

function csvCell(value) {
  const text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function toCsv(list) {
  const rows = [CSV_COLUMNS.join(',')]
  for (const item of list) {
    rows.push(CSV_COLUMNS.map((column) => csvCell(item[column])).join(','))
  }
  return rows.join('\n')
}

export function downloadCsv(list, filename = 'trading-entry-checklists.csv') {
  const blob = new Blob([toCsv(list)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
