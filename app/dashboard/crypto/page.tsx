import { cookies } from 'next/headers'
import { Bitcoin, KeyRound, ShieldCheck } from 'lucide-react'
import { getCryptoOverview } from '@/app/actions/crypto'
import { CryptoHoldingCard } from '@/components/crypto-holding-card'
import { CryptoMarketList } from '@/components/crypto-market-list'
import { CryptoTradeForm } from '@/components/crypto-trade-form'
import { DashboardHeader } from '@/components/dashboard-header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { requireUser } from '@/lib/auth/require-user'
import type { Language } from '@/lib/i18n'

export const metadata = {
  title: 'Demo Crypto - Internet Bank',
  description: 'Explore a mock crypto portfolio without real assets',
}

export const dynamic = 'force-dynamic'

export default async function CryptoPage() {
  const user = await requireUser()
  const lang = ((await cookies()).get('lang')?.value as Language) || 'sk'
  const overview = await getCryptoOverview()
  const totalValue = overview.holdings.reduce((sum, holding) => {
    const price = holding.quote?.price ?? Number(holding.averagePrice)
    return sum + Number(holding.quantity) * price
  }, 0)

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground md:pb-10">
      <DashboardHeader user={user} />
      <main className="min-h-screen pt-20 md:pl-64 md:pt-8">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/15 text-orange-500">
                  <Bitcoin className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Crypto</h1>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {lang === 'sk' ? 'Demo peňaženka s mockovanými cenami bez reálnych aktív.' : 'A demo wallet with mocked prices and no real assets.'}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 px-5 py-3 dark:border-zinc-800">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {lang === 'sk' ? 'Demo hodnota' : 'Demo value'}
              </p>
              <p className="mt-1 text-xl font-black">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </header>

          <div role="note" className="grid gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <div>
                <p className="font-black">Demo crypto – nejde o reálny nákup ani peňaženku</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {lang === 'sk' ? 'Obchody nemenia bankový zostatok a neodosielajú objednávky.' : 'Trades do not change bank balances or submit orders.'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <p className="text-xs leading-5 text-muted-foreground">
                {lang === 'sk' ? 'Aplikácia nevytvára ani neukladá private keys, seed frázy alebo blockchain adresy.' : 'The app does not create or store private keys, seed phrases, or blockchain addresses.'}
              </p>
            </div>
          </div>

          <section aria-labelledby="crypto-market-title">
            <h2 id="crypto-market-title" className="mb-4 text-lg font-black">{lang === 'sk' ? 'Mockovaný trh' : 'Mock market'}</h2>
            <CryptoMarketList quotes={overview.quotes} />
            <p className="mt-3 text-[11px] text-muted-foreground">
              {lang === 'sk' ? 'Zoznam podporovaných demo mien je konfigurovateľný na strane providera.' : 'Supported demo assets are configurable in the provider.'}
            </p>
          </section>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(310px,0.75fr)]">
            <div className="space-y-8">
              <section aria-labelledby="holdings-title">
                <div className="mb-4 flex items-center justify-between">
                  <h2 id="holdings-title" className="text-lg font-black">{lang === 'sk' ? 'Demo portfólio' : 'Demo portfolio'}</h2>
                  <span className="text-xs font-bold text-muted-foreground">{overview.holdings.length}</span>
                </div>
                {overview.holdings.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-800">
                    <Bitcoin className="mx-auto h-9 w-9 text-orange-500" />
                    <h3 className="mt-4 font-black">{lang === 'sk' ? 'Peňaženka je prázdna' : 'Wallet is empty'}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{lang === 'sk' ? 'Vyskúšajte prvý demo nákup.' : 'Try your first demo purchase.'}</p>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {overview.holdings.map((holding) => (
                      <CryptoHoldingCard key={holding.id} {...holding} lang={lang} />
                    ))}
                  </div>
                )}
              </section>

              <section aria-labelledby="crypto-history-title">
                <h2 id="crypto-history-title" className="mb-4 text-lg font-black">{lang === 'sk' ? 'História demo obchodov' : 'Demo trade history'}</h2>
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
                          <p className="mt-1 text-xs text-muted-foreground">{Number(trade.quantity).toLocaleString(undefined, { maximumFractionDigits: 12 })} @ ${Number(trade.price).toLocaleString('en-US', { maximumFractionDigits: 8 })}</p>
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
                {lang === 'sk' ? 'Nevykonáva sa platba, blockchain prevod ani skutočná objednávka.' : 'No payment, blockchain transfer, or real order is executed.'}
              </p>
              <CryptoTradeForm quotes={overview.quotes} lang={lang} />
            </aside>
          </div>
        </div>
      </main>
      <MobileBottomNav active="crypto" lang={lang} />
    </div>
  )
}
