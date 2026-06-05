import { getOfflineDB, addSyncOperation, setLocalCache, getLocalCache } from '@/lib/offline/db'
import { openDB } from 'idb'

jest.mock('idb', () => ({
  openDB: jest.fn()
}))

describe('Category 1: Offline Cache & Queue Database', () => {
  const mockDb = {
    put: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    getAllFromIndex: jest.fn(),
    objectStoreNames: {
      contains: jest.fn().mockReturnValue(true)
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(openDB as jest.Mock).mockResolvedValue(mockDb)
  })

  it('Test 1: should initialize database connection correctly', async () => {
    const db = await getOfflineDB()
    expect(openDB).toHaveBeenCalledWith('internet-bank-offline-db', 1, expect.any(Object))
    expect(db).toBe(mockDb)
  })

  it('Test 2: should add a sync operation to the queue', async () => {
    const action = 'ADD_TRANSACTION'
    const payload = { amount: 100, account: '123' }
    
    const op = await addSyncOperation(action, payload)
    
    expect(mockDb.put).toHaveBeenCalledWith('sync_queue', expect.objectContaining({
      action,
      payload,
      status: 'pending'
    }))
    expect(op?.id).toBeDefined()
  })

  it('Test 3: should handle local cache read/write and evict stale TTL entries', async () => {
    const cacheKey = 'user_accounts'
    const cacheData = [{ id: '1', balance: 50 }]
    
    // Test write
    await setLocalCache(cacheKey, cacheData, 1)
    expect(mockDb.put).toHaveBeenCalledWith('cache_store', expect.objectContaining({
      key: cacheKey,
      data: cacheData,
      ttl: expect.any(Number)
    }))

    // Test read valid cache
    mockDb.get.mockResolvedValue({
      key: cacheKey,
      data: cacheData,
      updatedAt: Date.now(),
      ttl: Date.now() + 100000
    })
    const cachedVal = await getLocalCache(cacheKey)
    expect(cachedVal).toEqual(cacheData)

    // Test read expired cache (should delete and return null)
    mockDb.get.mockResolvedValue({
      key: cacheKey,
      data: cacheData,
      updatedAt: Date.now() - 200000,
      ttl: Date.now() - 10000
    })
    const expiredVal = await getLocalCache(cacheKey)
    expect(expiredVal).toBeNull()
    expect(mockDb.delete).toHaveBeenCalledWith('cache_store', cacheKey)
  })
})
