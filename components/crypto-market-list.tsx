import { TrendingDown, TrendingUp } from 'lucide-react'
import type { CryptoQuote } from '@/lib/market/crypto'

export function CryptoMarketList({ quotes }: { quotes: CryptoQuote[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {quotes.map((quote) => {
        const positive = quote.changePercent >= 0
        return (
          <div key={quote.symbol} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-background p-4 dark:border-zinc-800">
            <div>
              <div className="flex items-baseline gap-2">
                <p className="font-black">{quote.symbol}</p>
                <p className="text-xs text-muted-foreground">{quote.name}</p>
              </div>
              <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
                {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {positive ? '+' : ''}{quote.changePercent.toFixed(2)}%
              </div>
            </div>
            <p className="text-sm font-black">
              ${quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )
      })}
    </div>
  )
}
