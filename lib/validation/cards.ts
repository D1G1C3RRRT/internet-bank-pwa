import { z } from 'zod'

const idSchema = z.string().uuid('Invalid identifier')

export const createVirtualCardSchema = z.object({
  bankAccountId: idSchema,
  label: z
    .string()
    .trim()
    .min(2, 'Card name must have at least 2 characters')
    .max(32, 'Card name cannot exceed 32 characters'),
})

export const cardStatusSchema = z.object({
  cardId: idSchema,
  frozen: z.boolean(),
})

export const cardLimitSchema = z.object({
  cardId: idSchema,
  dailyLimit: z.coerce
    .number()
    .finite()
    .min(10, 'Daily limit must be at least 10')
    .max(50_000, 'Daily limit cannot exceed 50,000'),
})

export const cardIdSchema = idSchema

export type CreateVirtualCardInput = z.infer<typeof createVirtualCardSchema>
export type CardStatusInput = z.infer<typeof cardStatusSchema>
export type CardLimitInput = z.input<typeof cardLimitSchema>
