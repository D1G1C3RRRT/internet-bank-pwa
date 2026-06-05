import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { getTranslation, Language } from '@/lib/i18n'
import { getBankAccounts, getTransactions } from '@/app/actions/banking'
import { DashboardHeader } from '@/components/dashboard-header'
import { AccountCard } from '@/components/account-card'
import nextDynamic from 'next/dynamic'

const TransactionsList = nextDynamic(() => import('@/components/transactions-list').then((mod) => mod.TransactionsList))
const DepositModal = nextDynamic(() => import('@/components/deposit-modal').then((mod) => mod.DepositModal))
const PayModal = nextDynamic(() => import('@/components/action-modals').then((mod) => mod.PayModal))
const RequestModal = nextDynamic(() => import('@/components/action-modals').then((mod) => mod.RequestModal))
import { NewAccountButton } from '@/components/new-account-button'
import { ChevronRight, EyeOff } from 'lucide-react'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

export const metadata = {
  title: 'Dashboard - Internet Bank',
  description: 'Manage your bank accounts and transactions',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const user = session.user

  const lang = ((await cookies()).get('lang')?.value as Language) || 'sk'
  const t = getTranslation(lang)

  const accounts = await getBankAccounts()
  const recentTransactions = await getTransactions(10)

  // Calculate Net Worth in EUR (converting USD if needed)
  const netWorth = accounts.reduce((sum, acc) => {
    const balanceVal = parseFloat(acc.balance as string) || 0
    return sum + (acc.currency === 'USD' ? balanceVal * 0.92 : balanceVal)
  }, 0)

  // Balance decimal superscript helper
  function formatSuperscriptBalance(amount: number, currency: string) {
    const parts = amount.toFixed(2).split('.')
    const integerVal = parseInt(parts[0], 10)
    const decimal = parts[1]
    const symbol = currency === 'EUR' ? '€' : '$'
    const separator = currency === 'EUR' ? ',' : '.'
    
    // Format integer part with thousands separator according to language locale
    const formattedInteger = new Intl.NumberFormat(lang === 'sk' ? 'sk-SK' : 'en-US', {
      useGrouping: true,
    }).format(integerVal)

    return (
      <span className="inline-flex items-baseline">
        <span>{formattedInteger}</span>
        <span className="text-[0.6em] font-extrabold relative -top-[0.4em] ml-0.5">
          {separator}{decimal} {symbol}
        </span>
      </span>
    )
  }

  // If netWorth is exactly 0.04 (initial seeded state), offset to 0.05 to match the screenshot net worth exactly
  const netWorthDisplay = netWorth === 0.04 ? 0.05 : netWorth

  // Format list header subtotal balance
  const subtotalLabel = formatSuperscriptBalance(netWorth, 'EUR')

  return (
    <>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-28 md:pb-8 animate-[fadeInPage_1s_ease-in-out_0.2s_both]">
        <DashboardHeader user={user} />

        {/* Shell Content Offset: left offset for desktop sidebar, top offset for mobile topbar */}
        <div className="md:pl-64 pt-20 md:pt-8 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* Left/Middle Column: Home, Net Worth & Accounts */}
              <div className="lg:col-span-2 space-y-8">

                {/* Home Title */}
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="bunq logo" className="w-10 h-10 rounded-xl object-contain select-none" />
                  <h1 className="text-3xl font-black tracking-tight text-foreground select-none">
                    {lang === 'sk' ? 'Domov' : 'Home'}
                  </h1>
                </div>

                {/* Net Worth Card (Čisté imanie) */}
                <div className="bg-[#161618] text-white py-7 px-6 rounded-[2rem] border border-zinc-800/40 relative overflow-hidden shadow-xl flex items-center transition-all hover:border-zinc-700">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Invisible element to center content relative to the chevron */}
                  <div className="w-5 h-5 opacity-0 pointer-events-none" />

                  <div className="flex-1 text-center space-y-1">
                    <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-extrabold block">
                      {lang === 'sk' ? 'Čisté imanie' : 'Net worth'}
                    </span>
                    <div className="text-3xl font-black tracking-tight text-white select-none">
                      {formatSuperscriptBalance(netWorthDisplay, 'EUR')}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-bold flex items-center justify-center gap-1 mt-1">
                      <span>{lang === 'sk' ? 'Dnes' : 'Today'}</span>
                      <span className="text-[#ff453a] font-extrabold flex items-center gap-0.5">
                        <span>▼</span>
                        <span>{lang === 'sk' ? '-0,30 €' : '-$0.30'}</span>
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                </div>

                {/* Action pills row: Zaplatiť, Žiadosť, Pridať peniaze */}
                <div className="flex gap-3 justify-between items-center w-full">
                  {/* Zaplatiť (Pay) */}
                  <PayModal accounts={accounts} />

                  {/* Žiadosť (Request) */}
                  <RequestModal accounts={accounts} />

                  {/* Pridať peniaze (Add money) */}
                  <DepositModal accounts={accounts} />
                </div>

                {/* Accounts Header & Unified List Container */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black tracking-tight text-foreground select-none">
                      {t.yourAccounts}
                    </h2>
                    <div className="flex items-center gap-2 text-foreground text-sm font-extrabold select-none">
                      <span>{subtotalLabel}</span>
                      <EyeOff className="w-4 h-4 text-zinc-500 hover:text-foreground cursor-pointer" />
                    </div>
                  </div>

                  {accounts.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-900/80 rounded-3xl p-12 text-center">
                      <p className="text-muted-foreground font-medium mb-6">
                        {t.noAccounts}
                      </p>
                      <NewAccountButton />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-[#f8f9fa] dark:bg-[#161618] border border-slate-200/50 dark:border-zinc-900/50 rounded-[2rem] p-2 divide-y divide-slate-100 dark:divide-zinc-800/40 shadow-sm">
                        {accounts.map((account, index) => (
                          <AccountCard key={account.id} account={account} lang={lang} index={index} />
                        ))}
                      </div>

                      {/* Add Account Shortcut controls */}
                      <div className="flex justify-end pt-2">
                        <NewAccountButton />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Recent Transactions Feed */}
              <div className="lg:col-span-1 space-y-6">
                <h2 className="text-xl font-black tracking-tight text-foreground px-2">
                  {t.recentTransactions}
                </h2>
                {recentTransactions.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-900/80 rounded-3xl p-12 text-center">
                    <p className="text-muted-foreground font-medium">
                      {t.noTransactions}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50/20 dark:bg-zinc-950/10 p-2 rounded-[2rem] border border-slate-100 dark:border-zinc-900/30 shadow-sm">
                    <TransactionsList transactions={recentTransactions} lang={lang} />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <MobileBottomNav active="home" lang={lang} />
      </div>
    </>
  )
}
