import { openDB, DBSchema, IDBPDatabase } from 'idb'

export interface SyncOperation {
  id: string
  action: string
  payload: any
  timestamp: number
  retryCount: number
  status: 'pending' | 'failed'
}

export interface CacheEntry {
  key: string
  data: any
  updatedAt: number
  ttl?: number
}

interface OfflineDBSchema extends DBSchema {
  sync_queue: {
    key: string
    value: SyncOperation
    indexes: {
      'by-timestamp': number
    }
  }
  cache_store: {
    key: string
    value: CacheEntry
  }
}

let dbPromise: Promise<IDBPDatabase<OfflineDBSchema>> | null = null

export function getOfflineDB() {
  if (typeof window === 'undefined') return null

  if (!dbPromise) {
    dbPromise = openDB<OfflineDBSchema>('internet-bank-offline-db', 1, {
      upgrade(db: IDBPDatabase<OfflineDBSchema>) {
        if (!db.objectStoreNames.contains('sync_queue')) {
          const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' })
          queueStore.createIndex('by-timestamp', 'timestamp')
        }

        if (!db.objectStoreNames.contains('cache_store')) {
          db.createObjectStore('cache_store', { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

export async function addSyncOperation(action: string, payload: any) {
  const db = await getOfflineDB()
  if (!db) return null

  const op: SyncOperation = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36)),
    action,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending',
  }

  await db.put('sync_queue', op)
  
  // Register background sync if supported
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      // @ts-expect-error - SyncManager is not included in every TypeScript DOM version.
      await registration.sync.register('sync-operations')
    } catch (err) {
      console.warn('Background sync could not be registered', err)
    }
  }

  return op
}

export async function getPendingOperations() {
  const db = await getOfflineDB()
  if (!db) return []
  return db.getAllFromIndex('sync_queue', 'by-timestamp')
}

export async function removeSyncOperation(id: string) {
  const db = await getOfflineDB()
  if (!db) return
  await db.delete('sync_queue', id)
}

export async function setLocalCache(key: string, data: any, ttlDays = 7) {
  const db = await getOfflineDB()
  if (!db) return

  const ttlMs = ttlDays * 24 * 60 * 60 * 1000
  await db.put('cache_store', {
    key,
    data,
    updatedAt: Date.now(),
    ttl: Date.now() + ttlMs
  })
}

export async function getLocalCache(key: string) {
  const db = await getOfflineDB()
  if (!db) return null

  const entry = await db.get('cache_store', key)
  if (!entry) return null

  if (entry.ttl && entry.ttl < Date.now()) {
    await db.delete('cache_store', key)
    return null
  }

  return entry.data
}
