export {}

if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder
  if (typeof window !== 'undefined') {
    (window as any).TextEncoder = TextEncoder;
    (window as any).TextDecoder = TextDecoder;
  }
}

if (typeof Request === 'undefined') {
  class MockRequest {
    public url: string = ''
    public method: string = 'GET'
    public headers: any = new Map()
    constructor(input: any, _init: any = {}) {}
  }
  class MockResponse {
    constructor(body: any, _init: any = {}) {}
  }
  class MockHeaders {
    constructor(_init: any = {}) {}
  }
  global.Request = MockRequest as any
  global.Response = MockResponse as any
  global.Headers = MockHeaders as any
}

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({
    get: jest.fn()
  })
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn()
  }
}))

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn()
    }
  }
}))

const { getBankAccounts, createTransaction, depositFunds } = require('@/app/actions/banking')
const { db } = require('@/lib/db')
const { auth } = require('@/lib/auth')

describe('Category 5: Banking Server Actions', () => {
  const mockUserId = 'user_123'
  let mockSelectChain: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock user session
    ;(auth.api.getSession as any).mockResolvedValue({
      user: { id: mockUserId }
    })

    // Mock Drizzle SELECT query chain
    mockSelectChain = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis()
    }
    ;(db.select as jest.Mock).mockReturnValue(mockSelectChain)
  })

  it('Test 1: should seed default accounts if user has no accounts yet', async () => {
    // Return empty list of accounts on first select
    mockSelectChain.orderBy.mockResolvedValueOnce([]) // First select in getBankAccounts
    
    // Mock INSERT query chain
    const mockInsertChain = {
      values: jest.fn().mockResolvedValue(true)
    }
    ;(db.insert as jest.Mock).mockReturnValue(mockInsertChain)

    // Return seeded accounts on second select
    const seededAccounts = [{ id: 'acc_1', userId: mockUserId, balance: '0.00' }]
    mockSelectChain.orderBy.mockResolvedValueOnce(seededAccounts)

    const result = await getBankAccounts()
    
    expect(db.insert).toHaveBeenCalled() // Defaults seeded
    expect(result).toEqual(seededAccounts)
  })

  it('Test 2: should throw an error if checking account has insufficient funds for transfer', async () => {
    // Mock select returning account with 50 EUR balance
    const sourceAccount = { id: 'from_acc', userId: mockUserId, balance: '50.00' }
    mockSelectChain.limit.mockResolvedValue([sourceAccount])

    // Try to transfer 100 EUR (should fail)
    await expect(
      createTransaction('from_acc', 'to_acc', '100.00', 'transfer', 'Insufficient Test')
    ).rejects.toThrow('Insufficient funds')
  })

  it('Test 3: should deposit funds, increasing the account balance and adding a transaction record', async () => {
    // Mock select returning account with 10 EUR balance
    const account = { id: 'acc_1', userId: mockUserId, balance: '10.00' }
    mockSelectChain.limit.mockResolvedValue([account])

    // Mock insert/update
    const mockInsertChain = { values: jest.fn().mockResolvedValue(true) }
    const mockUpdateChain = { set: jest.fn().mockReturnThis(), where: jest.fn().mockResolvedValue(true) }
    ;(db.insert as jest.Mock).mockReturnValue(mockInsertChain)
    ;(db.update as jest.Mock).mockReturnValue(mockUpdateChain)

    await depositFunds('acc_1', '15.00', 'Deposit test')

    // Expect INSERT for transaction
    expect(db.insert).toHaveBeenCalled()
    // Expect UPDATE balance to new balance 10.00 + 15.00 = 25.00
    expect(db.update).toHaveBeenCalled()
    expect(mockUpdateChain.set).toHaveBeenCalledWith({ balance: '25.00' })
  })
})
