import { cookies } from 'next/headers'
import { FlaskConical, Star, TrendingUp } from 'lucide-react'
import { getStocksOverview } from '@/app/actions/stocks'
import { DashboardHeader } from '@/components/dashboard-header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { StockMarketList } from '@/components/stock-market-list'
import { StockPositionCard } from '@/components/stock-position-card'
import { StockTradeForm } from '@/components/stock-trade-form'
import { requireUser } from '@/lib/auth/require-user'
import type { Language } from '@/lib/i18n'
import { roundMoney } from '@/lib/utils'

export const metadata = {
  title: 'Demo Stocks - Internet Bank',
  description: 'Explore a mock investment portfolio without real trading',
}

export const dynamic = 'force-dynamic'

export default async function StocksPage() {
  const user = await requireUser()
  const lang = ((await cookies()).get('lang')?.value as Language) || 'sk'
  const overview = await getStocksOverview()

  const totalValue = overview.positions.reduce((sum, position) => {
    const price = position.quote?.price ?? Number(position.averagePrice)
    return sum + Number(position.quantity) * price
  }, 0)
  const totalFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground md:pb-10">
      <DashboardHeader user={user} />
      <main className="min-h-screen pt-20 md:pl-64 md:pt-8">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/15 text-blue-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">{lang === 'sk' ? 'Akcie' : 'Stocks'}</h1>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {lang === 'sk' ? 'Sledujte mockované ceny a skúšajte obchody bez reálnych peňazí.' : 'Follow mocked prices and explore trades without real money.'}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 px-5 py-3 dark:border-zinc-800">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {lang === 'sk' ? 'Demo portfólio' : 'Demo portfolio'}
              </p>
              <p className="mt-1 text-xl font-black">{totalFormatter.format(roundMoney(totalValue))}</p>
            </div>
          </header>

          <div role="note" className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-black">Demo trading – nejde o reálne investovanie</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {lang === 'sk' ? 'Obchody nemenia bankový zostatok a ceny nie sú živé trhové dáta.' : 'Trades do not change your bank balance and prices are not live market data.'}
              </p>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(310px,0.75fr)]">
            <div className="space-y-8">
              <section aria-labelledby="positions-title">
                <div className="mb-4 flex items-center justify-between">
                  <h2 id="positions-title" className="text-lg font-black">{lang === 'sk' ? 'Vaše demo pozície' : 'Your demo positions'}</h2>
                  <span className="text-xs font-bold text-muted-foreground">{overview.positions.length}</span>
                </div>
                {overview.positions.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-800">
                    <TrendingUp className="mx-auto h-9 w-9 text-blue-500" />
                    <h3 className="mt-4 font-black">{lang === 'sk' ? 'Zatiaľ žiadne pozície' : 'No positions yet'}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{lang === 'sk' ? 'Vyskúšajte prvý demo nákup.' : 'Try your first demo purchase.'}</p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {overview.positions.map((position) => (
                      <StockPositionCard key={position.id} {...position} lang={lang} />
                    ))}
                  </div>
                )}
              </section>

              <section aria-labelledby="market-title">
                <div className="mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <h2 id="market-title" className="text-lg font-black">{lang === 'sk' ? 'Trh a watchlist' : 'Market and watchlist'}</h2>
                </div>
                <StockMarketList quotes={overview.quotes} watchlist={overview.watchlist} lang={lang} />
              </section>

              <section aria-labelledby="stock-history-title">
                <h2 id="stock-history-title" className="mb-4 text-lg font-black">{lang === 'sk' ? 'História demo obchodov' : 'Demo trade history'}</h2>
                {overview.trades.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-muted-foreground dark:border-zinc-800">
                    {lang === 'sk' ? 'História je zatiaľ prázdna.' : 'Trade history is empty.'}
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    {overview.trades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-3 last:border-b-0 dark:border-zinc-800">
                        <div>
                          <p className="text-sm font-black">{trade.symbol} · {trade.type === 'buy' ? (lang === 'sk' ? 'Nákup' : 'Buy') : (lang === 'sk' ? 'Predaj' : 'Sell')}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{Number(trade.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })} @ ${Number(trade.price).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black">${Number(trade.total).toFixed(2)}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{new Intl.DateTimeFormat(lang === 'sk' ? 'sk-SK' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(trade.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="h-fit rounded-[2rem] border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-950/70 xl:sticky xl:top-8">
              <h2 className="font-black">{lang === 'sk' ? 'Nový demo obchod' : 'New demo trade'}</h2>
              <p className="mb-5 mt-2 text-xs leading-5 text-muted-foreground">
                {lang === 'sk' ? 'Nevykonáva sa žiadna platba ani skutočná objednávka.' : 'No payment or real market order is executed.'}
              </p>
              <StockTradeForm quotes={overview.quotes} lang={lang} />
            </aside>
          </div>
        </div>
      </main>
      <MobileBottomNav active="stocks" lang={lang} />
    </div>
  )
}
