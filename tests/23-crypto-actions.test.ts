export {}

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/auth/require-user', () => ({ requireUserId: jest.fn() }))
jest.mock('@/lib/db', () => ({
  db: {
    transaction: jest.fn(),
  },
}))

const { executeDemoCryptoTrade } = require('@/app/actions/crypto')
const { requireUserId } = require('@/lib/auth/require-user')
const { db } = require('@/lib/db')

describe('Crypto server actions', () => {
  const userId = 'user_123'

  function selectChain(result: unknown) {
    return {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(result),
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    requireUserId.mockResolvedValue(userId)
  })

  it('rejects a demo trade below one cent before opening a transaction', async () => {
    await expect(executeDemoCryptoTrade({
      symbol: 'ADA',
      type: 'buy',
      quantity: '0.00000001',
    })).resolves.toEqual({ ok: false, message: 'Demo trade value must be at least $0.01' })
    expect(db.transaction).not.toHaveBeenCalled()
  })

  it('prevents selling more crypto than the current user owns', async () => {
    const tx = {
      execute: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnValue(selectChain([{
        id: 'holding_1',
        quantity: '0.100000000000',
        averagePrice: '100000.00000000',
      }])),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    db.transaction.mockImplementation(async (callback: (value: typeof tx) => Promise<void>) => callback(tx))

    await expect(executeDemoCryptoTrade({
      symbol: 'BTC',
      type: 'sell',
      quantity: '0.2',
    })).resolves.toEqual({
      ok: false,
      message: 'You do not own enough crypto for this demo sale',
    })
    expect(tx.execute).toHaveBeenCalledTimes(1)
    expect(tx.insert).not.toHaveBeenCalled()
  })

  it('creates a user-scoped holding and history record atomically', async () => {
    const holdingValues = jest.fn().mockResolvedValue(undefined)
    const tradeValues = jest.fn().mockResolvedValue(undefined)
    const tx = {
      execute: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnValue(selectChain([])),
      insert: jest
        .fn()
        .mockReturnValueOnce({ values: holdingValues })
        .mockReturnValueOnce({ values: tradeValues }),
      update: jest.fn(),
      delete: jest.fn(),
    }
    db.transaction.mockImplementation(async (callback: (value: typeof tx) => Promise<void>) => callback(tx))

    const result = await executeDemoCryptoTrade({
      symbol: 'ETH',
      type: 'buy',
      quantity: '1.5',
    })

    expect(result.ok).toBe(true)
    expect(holdingValues).toHaveBeenCalledWith(expect.objectContaining({
      userId,
      symbol: 'ETH',
      quantity: '1.500000000000',
    }))
    expect(tradeValues).toHaveBeenCalledWith(expect.objectContaining({
      userId,
      symbol: 'ETH',
      type: 'buy',
      quantity: '1.500000000000',
    }))
  })
})
