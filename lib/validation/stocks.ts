import { z } from 'zod'
import { STOCK_SYMBOLS } from '@/lib/market/stocks'

export const stockSymbolSchema = z.enum(STOCK_SYMBOLS)

export const stockTradeSchema = z.object({
  symbol: stockSymbolSchema,
  type: z.enum(['buy', 'sell']),
  quantity: z.coerce
    .number()
    .finite()
    .min(0.000001, 'Quantity must be at least 0.000001')
    .max(1_000_000, 'Quantity is too high'),
})

export type StockTradeInput = z.input<typeof stockTradeSchema>
