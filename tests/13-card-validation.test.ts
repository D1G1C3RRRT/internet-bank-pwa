import {
  cardLimitSchema,
  cardStatusSchema,
  createVirtualCardSchema,
} from '@/lib/validation/cards'

describe('Cards input validation', () => {
  const cardId = '8ef7cf52-226f-4d3e-8ae8-28e0e87a70b7'
  const bankAccountId = '52d9e4ca-8ac8-42e9-83f0-66b48221da3b'

  it('accepts a safe virtual card request', () => {
    expect(createVirtualCardSchema.parse({ bankAccountId, label: 'Travel card' })).toEqual({
      bankAccountId,
      label: 'Travel card',
    })
  })

  it('rejects malformed identifiers and oversized labels', () => {
    expect(createVirtualCardSchema.safeParse({ bankAccountId: 'other-user-account', label: 'x'.repeat(33) }).success).toBe(false)
    expect(cardStatusSchema.safeParse({ cardId: 'not-a-card-id', frozen: true }).success).toBe(false)
  })

  it('coerces and bounds the daily limit', () => {
    expect(cardLimitSchema.parse({ cardId, dailyLimit: '1250.50' }).dailyLimit).toBe(1250.5)
    expect(cardLimitSchema.safeParse({ cardId, dailyLimit: '9.99' }).success).toBe(false)
    expect(cardLimitSchema.safeParse({ cardId, dailyLimit: '50000.01' }).success).toBe(false)
  })
})
