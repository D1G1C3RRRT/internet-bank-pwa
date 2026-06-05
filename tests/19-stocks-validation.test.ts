import { stockSymbolSchema, stockTradeSchema } from '@/lib/validation/stocks'

describe('Stock validation', () => {
  it('accepts supported symbols and fractional quantities', () => {
    expect(stockTradeSchema.safeParse({ symbol: 'AAPL', type: 'buy', quantity: '0.25' }).success).toBe(true)
  })

  it('rejects unknown symbols and non-positive quantities', () => {
    expect(stockSymbolSchema.safeParse('FAKE').success).toBe(false)
    expect(stockTradeSchema.safeParse({ symbol: 'MSFT', type: 'sell', quantity: '0' }).success).toBe(false)
  })
})
