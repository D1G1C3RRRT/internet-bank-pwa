export const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'] as const

export type StockSymbol = (typeof STOCK_SYMBOLS)[number]

export type StockQuote = {
  symbol: StockSymbol
  name: string
  price: number
  changePercent: number
  currency: 'USD'
}

export interface StockQuoteProvider {
  getQuotes(): Promise<StockQuote[]>
  getQuote(symbol: StockSymbol): Promise<StockQuote>
}

const quotes: Record<StockSymbol, StockQuote> = {
  AAPL: { symbol: 'AAPL', name: 'Apple', price: 201.45, changePercent: 1.12, currency: 'USD' },
  MSFT: { symbol: 'MSFT', name: 'Microsoft', price: 472.18, changePercent: 0.64, currency: 'USD' },
  NVDA: { symbol: 'NVDA', name: 'NVIDIA', price: 177.26, changePercent: 2.31, currency: 'USD' },
  TSLA: { symbol: 'TSLA', name: 'Tesla', price: 338.72, changePercent: -1.48, currency: 'USD' },
  AMZN: { symbol: 'AMZN', name: 'Amazon', price: 212.34, changePercent: 0.87, currency: 'USD' },
}

export const mockStockQuoteProvider: StockQuoteProvider = {
  async getQuotes() {
    return STOCK_SYMBOLS.map((symbol) => quotes[symbol])
  },
  async getQuote(symbol) {
    return quotes[symbol]
  },
}
