export {}

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/auth/require-user', () => ({ requireUserId: jest.fn() }))
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    transaction: jest.fn(),
  },
}))

const { createSavingsGoal, moveSavings } = require('@/app/actions/savings')
const { requireUserId } = require('@/lib/auth/require-user')
const { db } = require('@/lib/db')

describe('Savings server actions', () => {
  const userId = 'user_123'
  const accountId = '52d9e4ca-8ac8-42e9-83f0-66b48221da3b'
  const goalId = '8ef7cf52-226f-4d3e-8ae8-28e0e87a70b7'

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

  it('rejects a goal linked to an account outside the current user', async () => {
    db.select.mockReturnValue(selectChain([]))

    await expect(createSavingsGoal({
      bankAccountId: accountId,
      name: 'Emergency fund',
      targetAmount: '1000',
      targetDate: '',
    })).resolves.toEqual({ ok: false, message: 'Selected account is not available' })
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('locks the goal and account before atomically moving money', async () => {
    const goalSelect = selectChain([{
      id: goalId,
      bankAccountId: accountId,
      currentAmount: '100.00',
      targetAmount: '1000.00',
      status: 'active',
    }])
    const accountSelect = selectChain([{ id: accountId, balance: '500.00' }])
    const updateWhere = jest.fn().mockResolvedValue(undefined)
    const updateSet = jest.fn().mockReturnValue({ where: updateWhere })
    const movementValues = jest.fn().mockResolvedValue(undefined)
    const tx = {
      execute: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnValueOnce(goalSelect).mockReturnValueOnce(accountSelect),
      update: jest.fn().mockReturnValue({ set: updateSet }),
      insert: jest.fn().mockReturnValue({ values: movementValues }),
    }
    db.transaction.mockImplementation(async (callback: (value: typeof tx) => Promise<void>) => callback(tx))

    const result = await moveSavings({ goalId, type: 'deposit', amount: '50.00' })

    expect(result.ok).toBe(true)
    expect(db.transaction).toHaveBeenCalledTimes(1)
    expect(tx.execute).toHaveBeenCalledTimes(2)
    expect(tx.update).toHaveBeenCalledTimes(2)
    expect(movementValues).toHaveBeenCalledWith(expect.objectContaining({
      goalId,
      userId,
      bankAccountId: accountId,
      amount: '50.00',
      type: 'deposit',
    }))
  })

  it('rolls back before updates when the linked account lacks funds', async () => {
    const goalSelect = selectChain([{
      id: goalId,
      bankAccountId: accountId,
      currentAmount: '100.00',
      targetAmount: '1000.00',
      status: 'active',
    }])
    const accountSelect = selectChain([{ id: accountId, balance: '10.00' }])
    const tx = {
      execute: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnValueOnce(goalSelect).mockReturnValueOnce(accountSelect),
      update: jest.fn(),
      insert: jest.fn(),
    }
    db.transaction.mockImplementation(async (callback: (value: typeof tx) => Promise<void>) => callback(tx))

    await expect(moveSavings({ goalId, type: 'deposit', amount: '50.00' })).resolves.toEqual({
      ok: false,
      message: 'Insufficient account balance',
    })
    expect(tx.update).not.toHaveBeenCalled()
    expect(tx.insert).not.toHaveBeenCalled()
  })
})
