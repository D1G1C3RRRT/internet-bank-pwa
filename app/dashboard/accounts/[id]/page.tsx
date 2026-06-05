import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { getTranslation, Language } from '@/lib/i18n'
import { getAccountTransactions, getBankAccounts } from '@/app/actions/banking'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TransactionsList } from '@/components/transactions-list'
import { TransferForm } from '@/components/transfer-form'
import { DashboardHeader } from '@/components/dashboard-header'
import { ChevronLeft, CreditCard } from 'lucide-react'

export const metadata = {
  title: 'Account Details - Internet Bank',
  description: 'View account details and manage transfers',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AccountDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const user = session.user

  const lang = ((await cookies()).get('lang')?.value as Language) || 'sk'
  const t = getTranslation(lang)

  const accounts = await getBankAccounts()
  const account = accounts.find((acc) => acc.id === id)

  if (!account) {
    redirect('/dashboard')
  }

  const transactions = await getAccountTransactions(id, 20)
  const displayAccountType = account.accountType === 'checking' 
    ? t.checkingAccount 
    : account.accountType === 'savings'
      ? t.savingsAccount
      : account.accountType

  const isSavings = account.accountType === 'savings'
  const cardGradient = isSavings
    ? 'bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/10'
    : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/10'

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <DashboardHeader user={user} />

      {/* Shell Content Offset: left offset for desktop sidebar, top offset for mobile topbar */}
      <div className="md:pl-64 pt-20 md:pt-8 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-6">
          
          {/* Back Button */}
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 mb-6 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900">
              <ChevronLeft className="w-4 h-4" />
              {t.backToDashboard}
            </Button>
          </Link>

          {/* Account Header Banner Tile */}
          <div className="mb-8">
            <div className={`p-8 rounded-3xl ${cardGradient} border-0 relative overflow-hidden shadow-xl`}>
              {/* Decorative background circle */}
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                    {isSavings ? (
                      <span className="text-3xl">🐷</span>
                    ) : (
                      <CreditCard className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tight capitalize">{displayAccountType}</h1>
                    <p className="text-sm text-white/80 font-mono tracking-wider mt-1">{account.accountNumber}</p>
                  </div>
                </div>

                {/* Active status pulse dot */}
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-bold tracking-wider uppercase">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    account.isActive ? 'bg-emerald-300 animate-pulse' : 'bg-red-400'
                  }`} />
                  {account.isActive ? t.active : t.inactive}
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-xs text-white/70 uppercase tracking-widest font-extrabold mb-1">{t.currentBalance}</p>
                <p className="text-5xl font-black tracking-tight">
                  {account.currency === 'EUR' ? '€' : '$'}{parseFloat(account.balance).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transfer Form */}
            <div className="lg:col-span-1">
              <TransferForm accountId={id} accounts={accounts} lang={lang} />
            </div>

            {/* Transactions */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                {t.accountTransactions}
              </h2>
              {transactions.length === 0 ? (
                <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-900/80 rounded-3xl p-12 text-center">
                  <p className="text-muted-foreground font-medium">
                    {t.noAccountTransactions}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50/20 dark:bg-zinc-950/10 p-2 rounded-3xl border border-slate-100 dark:border-zinc-900/30">
                  <TransactionsList transactions={transactions} lang={lang} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
