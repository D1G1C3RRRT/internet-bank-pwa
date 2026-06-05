export {}

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/auth/require-user', () => ({
  requireUserId: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    transaction: jest.fn(),
  },
}))

const { createVirtualCard, setCardFrozen } = require('@/app/actions/cards')
const { requireUserId } = require('@/lib/auth/require-user')
const { db } = require('@/lib/db')

describe('Cards server actions', () => {
  const userId = 'user_123'
  const bankAccountId = '52d9e4ca-8ac8-42e9-83f0-66b48221da3b'
  const cardId = '8ef7cf52-226f-4d3e-8ae8-28e0e87a70b7'

  function selectResult(result: unknown) {
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

  it('does not create a card for an account outside the current user scope', async () => {
    db.select.mockReturnValue(selectResult([]))

    const result = await createVirtualCard({ bankAccountId, label: 'Travel card' })

    expect(result).toEqual({ ok: false, message: 'Selected account is not available' })
    expect(db.transaction).not.toHaveBeenCalled()
  })

  it('creates the card and audit entry in one transaction without sensitive credentials', async () => {
    db.select.mockReturnValue(selectResult([{ id: bankAccountId }]))
    const cardValues = jest.fn().mockResolvedValue(undefined)
    const activityValues = jest.fn().mockResolvedValue(undefined)
    const tx = {
      insert: jest
        .fn()
        .mockReturnValueOnce({ values: cardValues })
        .mockReturnValueOnce({ values: activityValues }),
    }
    db.transaction.mockImplementation(async (callback: (transaction: typeof tx) => Promise<void>) => callback(tx))

    const result = await createVirtualCard({ bankAccountId, label: 'Online shopping' })

    expect(result.ok).toBe(true)
    expect(db.transaction).toHaveBeenCalledTimes(1)
    const storedCard = cardValues.mock.calls[0][0]
    expect(storedCard).toMatchObject({
      userId,
      bankAccountId,
      label: 'Online shopping',
      cardType: 'virtual',
      status: 'active',
    })
    expect(storedCard.last4).toMatch(/^\d{4}$/)
    expect(storedCard).not.toHaveProperty('cardNumber')
    expect(storedCard).not.toHaveProperty('pan')
    expect(storedCard).not.toHaveProperty('cvv')
    expect(storedCard).not.toHaveProperty('pin')
    expect(activityValues).toHaveBeenCalledWith(expect.objectContaining({ userId, action: 'created' }))
  })

  it('refuses to freeze a card not owned by the signed-in user', async () => {
    db.select.mockReturnValue(selectResult([]))

    await expect(setCardFrozen({ cardId, frozen: true })).resolves.toEqual({
      ok: false,
      message: 'Card not found',
    })
    expect(db.transaction).not.toHaveBeenCalled()
  })
})
