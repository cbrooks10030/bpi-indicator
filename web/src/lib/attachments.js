/**
 * Chart screenshots, kept beside the answer they belong to. Files go in IndexedDB
 * rather than localStorage so a morning of full-resolution phone screenshots fits,
 * and they never leave the device.
 */

const DB_NAME = 'teg.attachments'
const STORE = 'files'
const DB_VERSION = 2

/** Anything a phone, tablet or desktop is likely to hand us. */
export const ACCEPTED_TYPES =
  'image/*,.heic,.heif,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tif,.tiff,.avif,.svg,.pdf'

/** iOS hands over HEIC, which no browser will paint — store it, show a card instead. */
export function isRenderable(type = '', name = '') {
  if (!type.startsWith('image/')) return false
  const lowered = `${type} ${name}`.toLowerCase()
  return !lowered.includes('heic') && !lowered.includes('heif')
}

export function formatSize(bytes) {
  if (!Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser has no IndexedDB, so screenshots cannot be stored.'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      const store = db.objectStoreNames.contains(STORE)
        ? request.transaction.objectStore(STORE)
        : db.createObjectStore(STORE, { keyPath: 'id' })
      if (!store.indexNames.contains('questionId')) store.createIndex('questionId', 'questionId', { unique: false })
      if (!store.indexNames.contains('runId')) store.createIndex('runId', 'runId', { unique: false })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open the attachment store.'))
  })
}

function run(mode, work) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const store = tx.objectStore(STORE)
        let output
        try {
          output = work(store)
        } catch (error) {
          reject(error)
          return
        }
        tx.oncomplete = () => {
          db.close()
          resolve(output && typeof output.then === 'function' ? output : output)
        }
        tx.onerror = () => {
          db.close()
          reject(tx.error ?? new Error('The attachment store rejected the write.'))
        }
      }),
  )
}

const request = (store, method, ...args) =>
  new Promise((resolve, reject) => {
    const req = store[method](...args)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

export async function saveAttachment(questionId, file) {
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    questionId,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    savedAt: new Date().toISOString(),
    // Untagged until the run is journalled, at which point it belongs to that day.
    runId: '',
    blob: file,
  }
  await run('readwrite', (store) => request(store, 'put', record))
  return record
}

/** Only the screenshots taken during the run in progress. */
export async function listAttachments(questionId) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const index = tx.objectStore(STORE).index('questionId')
    const req = index.getAll(questionId)
    req.onsuccess = () => {
      db.close()
      resolve((req.result ?? []).filter((item) => !item.runId))
    }
    req.onerror = () => {
      db.close()
      reject(req.error)
    }
  })
}

export async function listRunAttachments(runId) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).index('runId').getAll(runId)
    req.onsuccess = () => {
      db.close()
      resolve(req.result ?? [])
    }
    req.onerror = () => {
      db.close()
      reject(req.error)
    }
  })
}

/** Saving or resetting a run files everything shot during it under that run. */
export async function tagRun(runId) {
  const all = await listAllAttachments()
  const loose = all.filter((item) => !item.runId)
  if (!loose.length) return 0
  await run('readwrite', (store) => {
    for (const item of loose) store.put({ ...item, runId })
  })
  return loose.length
}

export async function listAllAttachments() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      db.close()
      resolve(req.result ?? [])
    }
    req.onerror = () => {
      db.close()
      reject(req.error)
    }
  })
}

export async function deleteAttachment(id) {
  await run('readwrite', (store) => request(store, 'delete', id))
}

export async function clearAttachments() {
  await run('readwrite', (store) => request(store, 'clear'))
}
