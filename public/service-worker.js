const CACHE_NAME = 'internet-bank-v1'
const URLS_TO_CACHE = [
  '/',
  '/sign-in',
  '/sign-up',
  '/offline.html',
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Handle GET requests
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request).then((response) => {
            return response || caches.match('/offline.html')
          })
        })
    )
  }
})

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data.tag || 'notification',
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Internet Bank', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

// --- Offline First Sync Engine ---
importScripts('https://cdn.jsdelivr.net/npm/idb@8/build/umd.js')
importScripts('https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js')

async function processSyncQueue() {
  const db = await idb.openDB('internet-bank-offline-db', 1)
  if (!db.objectStoreNames.contains('sync_queue')) return
  
  const tx = db.transaction('sync_queue', 'readwrite')
  const store = tx.objectStore('sync_queue')
  const operations = await store.getAll()
  
  if (operations.length === 0) return
  
  try {
    // Compress payload to save bandwidth
    const payloadStr = JSON.stringify(operations)
    const compressed = LZString.compressToEncodedURIComponent(payloadStr)
    
    // In production, this would point to the actual domain or use relative paths
    // We send it to our new API route
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${compressed}`
    })
    
    if (response.ok) {
      // Clear synced items
      const deleteTx = db.transaction('sync_queue', 'readwrite')
      const delStore = deleteTx.objectStore('sync_queue')
      for (const op of operations) {
        await delStore.delete(op.id)
      }
      
      // Notify user if background sync
      self.registration.showNotification('Sync Complete', {
        body: `Successfully synced ${operations.length} offline actions.`,
        icon: '/icon-192x192.png'
      })
      
      // Notify clients to refresh their state
      const clientsList = await self.clients.matchAll()
      clientsList.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }))
    } else {
      throw new Error('Server rejected sync payload')
    }
  } catch (err) {
    console.error('[SW] Sync failed, will retry later:', err)
    // Increment retry counts
    const updateTx = db.transaction('sync_queue', 'readwrite')
    const updateStore = updateTx.objectStore('sync_queue')
    for (const op of operations) {
      op.retryCount = (op.retryCount || 0) + 1
      if (op.retryCount > 5) op.status = 'failed'
      await updateStore.put(op)
    }
    throw err // Throwing tells the browser to schedule another sync
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-operations') {
    event.waitUntil(processSyncQueue())
  }
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_NOW') {
    processSyncQueue()
  }
})

