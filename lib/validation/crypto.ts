import { z } from 'zod'
import { CRYPTO_SYMBOLS } from '@/lib/market/crypto'

export const cryptoSymbolSchema = z.enum(CRYPTO_SYMBOLS)

export const cryptoTradeSchema = z.object({
  symbol: cryptoSymbolSchema,
  type: z.enum(['buy', 'sell']),
  quantity: z.coerce
    .number()
    .finite()
    .min(0.00000001, 'Quantity must be at least 0.00000001')
    .max(1_000_000_000, 'Quantity is too high'),
})

export type CryptoTradeInput = z.input<typeof cryptoTradeSchema>
