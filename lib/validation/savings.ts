import { z } from 'zod'

const idSchema = z.string().uuid('Invalid identifier')

export const createSavingsGoalSchema = z.object({
  bankAccountId: idSchema,
  name: z
    .string()
    .trim()
    .min(2, 'Goal name must have at least 2 characters')
    .max(48, 'Goal name cannot exceed 48 characters'),
  targetAmount: z.coerce
    .number()
    .finite()
    .min(1, 'Target amount must be at least 1')
    .max(1_000_000_000, 'Target amount is too high'),
  targetDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Invalid target date'),
})

export const savingsMovementSchema = z.object({
  goalId: idSchema,
  type: z.enum(['deposit', 'withdrawal']),
  amount: z.coerce
    .number()
    .finite()
    .min(0.01, 'Amount must be at least 0.01')
    .max(10_000_000, 'Amount is too high'),
})

export const savingsGoalIdSchema = idSchema

export type CreateSavingsGoalInput = z.input<typeof createSavingsGoalSchema>
export type SavingsMovementInput = z.input<typeof savingsMovementSchema>
