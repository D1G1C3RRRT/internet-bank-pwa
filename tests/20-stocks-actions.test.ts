export {}

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/auth/require-user', () => ({ requireUserId: jest.fn() }))
jest.mock('@/lib/db', () => ({
  db: {
    transaction: jest.fn(),
  },
}))

const { executeDemoStockTrade } = require('@/app/actions/stocks')
const { requireUserId } = require('@/lib/auth/require-user')
const { db } = require('@/lib/db')

describe('Stock server actions', () => {
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

  it('rejects unsupported symbols before opening a transaction', async () => {
    await expect(executeDemoStockTrade({
      symbol: 'FAKE',
      type: 'buy',
      quantity: '1',
    })).resolves.toEqual(expect.objectContaining({ ok: false }))
    expect(db.transaction).not.toHaveBeenCalled()
  })

  it('rejects a sale larger than the current user position', async () => {
    const tx = {
      execute: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnValue(selectChain([{
        id: 'position_1',
        quantity: '0.500000',
        averagePrice: '150.0000',
      }])),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    db.transaction.mockImplementation(async (callback: (value: typeof tx) => Promise<void>) => callback(tx))

    await expect(executeDemoStockTrade({
      symbol: 'AAPL',
      type: 'sell',
      quantity: '1',
    })).resolves.toEqual({
      ok: false,
      message: 'You do not own enough shares for this demo sale',
    })
    expect(tx.execute).toHaveBeenCalledTimes(1)
    expect(tx.insert).not.toHaveBeenCalled()
  })

  it('creates a user-scoped position and trade atomically', async () => {
    const positionValues = jest.fn().mockResolvedValue(undefined)
    const tradeValues = jest.fn().mockResolvedValue(undefined)
    const tx = {
      execute: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnValue(selectChain([])),
      insert: jest
        .fn()
        .mockReturnValueOnce({ values: positionValues })
        .mockReturnValueOnce({ values: tradeValues }),
      update: jest.fn(),
      delete: jest.fn(),
    }
    db.transaction.mockImplementation(async (callback: (value: typeof tx) => Promise<void>) => callback(tx))

    const result = await executeDemoStockTrade({
      symbol: 'NVDA',
      type: 'buy',
      quantity: '2',
    })

    expect(result.ok).toBe(true)
    expect(positionValues).toHaveBeenCalledWith(expect.objectContaining({
      userId,
      symbol: 'NVDA',
      quantity: '2.000000',
    }))
    expect(tradeValues).toHaveBeenCalledWith(expect.objectContaining({
      userId,
      symbol: 'NVDA',
      type: 'buy',
      quantity: '2.000000',
    }))
  })
})
