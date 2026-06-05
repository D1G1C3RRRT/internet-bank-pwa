import { TrendingDown, TrendingUp } from 'lucide-react'
import type { StockQuote } from '@/lib/market/stocks'

export function StockPositionCard({
  symbol,
  quantity,
  averagePrice,
  quote,
  lang,
}: {
  symbol: string
  quantity: string
  averagePrice: string
  quote: StockQuote | null
  lang: 'en' | 'sk'
}) {
  const quantityNumber = Number(quantity)
  const average = Number(averagePrice)
  const currentPrice = quote?.price ?? average
  const value = quantityNumber * currentPrice
  const gain = value - quantityNumber * average
  const gainPercent = average > 0 ? ((currentPrice - average) / average) * 100 : 0
  const positive = gain >= 0
  const formatter = new Intl.NumberFormat(lang === 'sk' ? 'sk-SK' : 'en-US', {
    style: 'currency',
    currency: quote?.currency ?? 'USD',
  })

  return (
    <article className="rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-blue-500/10 via-background to-violet-500/10 p-6 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-black">{symbol}</p>
          <p className="mt-1 text-xs text-muted-foreground">{quote?.name ?? symbol}</p>
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${positive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {gainPercent.toFixed(2)}%
        </div>
      </div>
      <p className="mt-7 text-2xl font-black">{formatter.format(value)}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{quantityNumber.toLocaleString(undefined, { maximumFractionDigits: 6 })} {lang === 'sk' ? 'ks' : 'shares'}</span>
        <span className={positive ? 'text-emerald-500' : 'text-red-500'}>
          {positive ? '+' : ''}{formatter.format(gain)}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {lang === 'sk' ? 'Priemerná cena' : 'Average price'}: {formatter.format(average)}
      </p>
    </article>
  )
}
