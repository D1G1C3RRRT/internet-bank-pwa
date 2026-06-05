import { createSavingsGoalSchema, savingsMovementSchema } from '@/lib/validation/savings'

describe('Savings input validation', () => {
  const id = '52d9e4ca-8ac8-42e9-83f0-66b48221da3b'

  it('accepts valid goals and movements', () => {
    expect(createSavingsGoalSchema.parse({
      bankAccountId: id,
      name: 'Emergency fund',
      targetAmount: '5000',
      targetDate: '2030-01-01',
    }).targetAmount).toBe(5000)

    expect(savingsMovementSchema.parse({ goalId: id, type: 'deposit', amount: '25.50' }).amount).toBe(25.5)
  })

  it('rejects invalid amounts, identifiers, and movement types', () => {
    expect(createSavingsGoalSchema.safeParse({ bankAccountId: 'other', name: 'x', targetAmount: 0 }).success).toBe(false)
    expect(savingsMovementSchema.safeParse({ goalId: id, type: 'transfer', amount: 10 }).success).toBe(false)
    expect(savingsMovementSchema.safeParse({ goalId: id, type: 'withdrawal', amount: 0 }).success).toBe(false)
  })
})
