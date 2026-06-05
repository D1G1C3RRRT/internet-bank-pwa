'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { toggleStockWatchlist } from '@/app/actions/stocks'
import type { StockQuote } from '@/lib/market/stocks'

export function StockMarketList({
  quotes,
  watchlist,
  lang,
}: {
  quotes: StockQuote[]
  watchlist: string[]
  lang: 'en' | 'sk'
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)
  const watched = new Set(watchlist)

  function toggle(symbol: string) {
    setFeedback(null)
    startTransition(async () => {
      const result = await toggleStockWatchlist(symbol)
      setFeedback(result.message)
      if (result.ok) router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {quotes.map((quote) => {
        const positive = quote.changePercent >= 0
        const isWatched = watched.has(quote.symbol)
        return (
          <div key={quote.symbol} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-background p-4 dark:border-zinc-800">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="font-black">{quote.symbol}</p>
                <p className="truncate text-xs text-muted-foreground">{quote.name}</p>
              </div>
              <p className={`mt-1 text-xs font-bold ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
                {positive ? '+' : ''}{quote.changePercent.toFixed(2)}%
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-black">${quote.price.toFixed(2)}</p>
              <button
                type="button"
                disabled={isPending}
                onClick={() => toggle(quote.symbol)}
                aria-label={`${isWatched ? 'Remove' : 'Add'} ${quote.symbol} ${isWatched ? 'from' : 'to'} watchlist`}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isWatched ? 'bg-amber-500/15 text-amber-500' : 'bg-zinc-100 text-zinc-400 hover:text-amber-500 dark:bg-zinc-900'}`}
              >
                <Star className="h-4 w-4" fill={isWatched ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        )
      })}
      {feedback && <p role="status" className="text-xs font-semibold text-muted-foreground">{feedback}</p>}
      <p className="text-[11px] leading-5 text-muted-foreground">
        {lang === 'sk' ? 'Ceny sú mockované a nepredstavujú živé trhové dáta.' : 'Prices are mocked and do not represent live market data.'}
      </p>
    </div>
  )
}
