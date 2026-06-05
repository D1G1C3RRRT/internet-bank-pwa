import { cryptoSymbolSchema, cryptoTradeSchema } from '@/lib/validation/crypto'

describe('Crypto validation', () => {
  it('accepts supported assets and fractional quantities', () => {
    expect(cryptoTradeSchema.safeParse({ symbol: 'BTC', type: 'buy', quantity: '0.001' }).success).toBe(true)
  })

  it('rejects unsupported assets and invalid quantities', () => {
    expect(cryptoSymbolSchema.safeParse('DOGE').success).toBe(false)
    expect(cryptoTradeSchema.safeParse({ symbol: 'ETH', type: 'sell', quantity: '-1' }).success).toBe(false)
  })
})
