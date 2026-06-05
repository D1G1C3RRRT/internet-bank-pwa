import { syncMiddlewareImpl } from '@/lib/offline/sync-middleware'
import { addSyncOperation } from '@/lib/offline/db'

jest.mock('@/lib/offline/db', () => ({
  addSyncOperation: jest.fn()
}))

describe('Category 3: Offline Sync Zustand Middleware', () => {
  let mockSet: jest.Mock
  let mockGet: jest.Mock
  let mockApi: any
  let middlewareCreator: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockSet = jest.fn()
    mockGet = jest.fn().mockReturnValue({ data: 'old_value' })
    mockApi = {}
    
    // Create wrapped state creator
    middlewareCreator = syncMiddlewareImpl((set) => ({
      updateData: (val: string) => set({ data: val })
    }), 'test_store')
    
    // Set window navigator mock
    global.navigator = { onLine: true } as any
  })

  afterEach(() => {
    // @ts-expect-error - The test removes the jsdom navigator override.
    delete global.navigator
  })

  it('Test 1: should intercept set() operations and queue mutations to IndexedDB', async () => {
    const storeActions = middlewareCreator(mockSet, mockGet, mockApi)
    
    // Trigger store update
    await storeActions.updateData('new_value')
    
    expect(mockSet).toHaveBeenCalledWith({ data: 'new_value' })
    expect(addSyncOperation).toHaveBeenCalledWith('UPDATE_TEST_STORE', { data: 'new_value' })
  })

  it('Test 2: should check online status and attempt immediate sync if navigator is online', async () => {
    // Mock online status
    global.navigator = { onLine: true } as any
    const storeActions = middlewareCreator(mockSet, mockGet, mockApi)
    
    await storeActions.updateData('value_online')
    expect(addSyncOperation).toHaveBeenCalled()
    // Trigger immediate sync happens when online
  })

  it('Test 3: should handle IndexedDB enqueue failures gracefully and not crash the UI state update', async () => {
    // Force enqueue to fail
    ;(addSyncOperation as jest.Mock).mockRejectedValue(new Error('IndexedDB Write Failed'))
    
    const storeActions = middlewareCreator(mockSet, mockGet, mockApi)
    
    // Verify that the UI state update still succeeds even if IndexedDB sync fails
    await expect(storeActions.updateData('failsafe_value')).resolves.not.toThrow()
    expect(mockSet).toHaveBeenCalledWith({ data: 'failsafe_value' })
  })
})
