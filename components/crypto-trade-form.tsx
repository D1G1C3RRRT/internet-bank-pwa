'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { executeDemoCryptoTrade } from '@/app/actions/crypto'
import type { CryptoQuote, CryptoSymbol } from '@/lib/market/crypto'

export function CryptoTradeForm({
  quotes,
  lang,
}: {
  quotes: CryptoQuote[]
  lang: 'en' | 'sk'
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [symbol, setSymbol] = useState<CryptoSymbol>(quotes[0]?.symbol ?? 'BTC')
  const [type, setType] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const quote = quotes.find((item) => item.symbol === symbol)
  const estimate = Number(quantity) > 0 && quote ? Number(quantity) * quote.price : 0

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    startTransition(async () => {
      const result = await executeDemoCryptoTrade({ symbol, type, quantity })
      setFeedback(result)
      if (result.ok) {
        setQuantity('')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">
        {(['buy', 'sell'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            className={`h-10 rounded-xl text-xs font-extrabold transition ${type === option ? 'bg-white text-foreground shadow-sm dark:bg-zinc-800' : 'text-muted-foreground'}`}
          >
            {option === 'buy' ? (lang === 'sk' ? 'Kúpiť demo' : 'Demo buy') : (lang === 'sk' ? 'Predať demo' : 'Demo sell')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="crypto-symbol" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
            {lang === 'sk' ? 'Mena' : 'Asset'}
          </label>
          <select
            id="crypto-symbol"
            value={symbol}
            onChange={(event) => setSymbol(event.target.value as CryptoSymbol)}
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
          >
            {quotes.map((item) => <option key={item.symbol} value={item.symbol}>{item.symbol}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="crypto-quantity" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
            {lang === 'sk' ? 'Množstvo' : 'Quantity'}
          </label>
          <input
            id="crypto-quantity"
            type="number"
            min="0.00000001"
            max="1000000000"
            step="0.00000001"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-zinc-100 px-4 py-3 text-xs dark:bg-zinc-900">
        <span className="text-muted-foreground">{lang === 'sk' ? 'Odhadovaná demo hodnota' : 'Estimated demo value'}</span>
        <span className="font-black">${estimate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      {feedback && (
        <p role="status" className={`text-sm font-semibold ${feedback.ok ? 'text-emerald-500' : 'text-red-500'}`}>
          {feedback.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-2xl bg-orange-600 px-5 text-sm font-extrabold text-white transition hover:bg-orange-500 disabled:opacity-50"
      >
        {isPending ? (lang === 'sk' ? 'Spracúvam…' : 'Processing…') : (lang === 'sk' ? 'Potvrdiť demo obchod' : 'Confirm demo trade')}
      </button>
    </form>
  )
}
