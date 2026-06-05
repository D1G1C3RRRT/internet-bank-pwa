export const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA'] as const

export type CryptoSymbol = (typeof CRYPTO_SYMBOLS)[number]

export type CryptoQuote = {
  symbol: CryptoSymbol
  name: string
  price: number
  changePercent: number
  currency: 'USD'
}

export interface CryptoQuoteProvider {
  getQuotes(): Promise<CryptoQuote[]>
  getQuote(symbol: CryptoSymbol): Promise<CryptoQuote>
}

// Extend this record and CRYPTO_SYMBOLS to configure more demo assets.
const quotes: Record<CryptoSymbol, CryptoQuote> = {
  BTC: { symbol: 'BTC', name: 'Bitcoin', price: 104250.25, changePercent: 1.84, currency: 'USD' },
  ETH: { symbol: 'ETH', name: 'Ethereum', price: 3150.1, changePercent: 2.42, currency: 'USD' },
  SOL: { symbol: 'SOL', name: 'Solana', price: 162.42, changePercent: -0.76, currency: 'USD' },
  ADA: { symbol: 'ADA', name: 'Cardano', price: 0.72, changePercent: 0.35, currency: 'USD' },
}

export const mockCryptoQuoteProvider: CryptoQuoteProvider = {
  async getQuotes() {
    return CRYPTO_SYMBOLS.map((symbol) => quotes[symbol])
  },
  async getQuote(symbol) {
    return quotes[symbol]
  },
}
