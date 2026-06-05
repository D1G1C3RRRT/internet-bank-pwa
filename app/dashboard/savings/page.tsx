import Link from 'next/link'
import { cookies } from 'next/headers'
import { PiggyBank, Plus } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import type { Language } from '@/lib/i18n'
import { getBankAccounts } from '@/app/actions/banking'
import { getSavingsGoals } from '@/app/actions/savings'
import { DashboardHeader } from '@/components/dashboard-header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { SavingsGoalCard } from '@/components/savings-goal-card'
import { CreateSavingsGoalForm } from '@/components/create-savings-goal-form'

export const metadata = {
  title: 'Savings - Internet Bank',
  description: 'Create and manage savings goals',
}

export const dynamic = 'force-dynamic'

export default async function SavingsPage() {
  const user = await requireUser()
  const lang = ((await cookies()).get('lang')?.value as Language) || 'sk'
  const [goals, accounts] = await Promise.all([getSavingsGoals(), getBankAccounts()])
  const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0)

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground md:pb-10">
      <DashboardHeader user={user} />
      <main className="min-h-screen pt-20 md:pl-64 md:pt-8">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-500/15 text-pink-500">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">{lang === 'sk' ? 'Sporenie' : 'Savings'}</h1>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {lang === 'sk' ? 'Vytvorte cieľ a presúvajte peniaze bezpečne v jednej transakcii.' : 'Create goals and move money safely in a single transaction.'}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 px-5 py-3 dark:border-zinc-800">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {lang === 'sk' ? 'Nasporené celkom' : 'Total saved'}
              </p>
              <p className="mt-1 text-xl font-black">€{totalSaved.toFixed(2)}</p>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
            <section className="space-y-4" aria-labelledby="savings-list-title">
              <div className="flex items-center justify-between">
                <h2 id="savings-list-title" className="text-lg font-black">{lang === 'sk' ? 'Vaše ciele' : 'Your goals'}</h2>
                <span className="text-xs font-bold text-muted-foreground">{goals.length}</span>
              </div>

              {goals.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-zinc-300 px-6 py-14 text-center dark:border-zinc-800">
                  <PiggyBank className="mx-auto h-10 w-10 text-pink-500" />
                  <h3 className="mt-5 text-lg font-black">{lang === 'sk' ? 'Začnite prvým cieľom' : 'Start your first goal'}</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    {lang === 'sk' ? 'Peniaze zostávajú viazané na váš účet a každý pohyb sa zaznamená.' : 'Money stays linked to your account and every movement is recorded.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {goals.map((goal) => (
                    <Link key={goal.id} href={`/dashboard/savings/${goal.id}`}>
                      <SavingsGoalCard {...goal} lang={lang} />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <aside className="rounded-[2rem] border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-950/70">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/15 text-pink-500">
                  <Plus className="h-5 w-5" />
                </div>
                <h2 className="font-black">{lang === 'sk' ? 'Nový cieľ' : 'New goal'}</h2>
              </div>
              <CreateSavingsGoalForm
                lang={lang}
                accounts={accounts.map((account) => ({
                  id: account.id,
                  accountNumber: account.accountNumber,
                  currency: account.currency,
                }))}
              />
            </aside>
          </div>
        </div>
      </main>
      <MobileBottomNav active="savings" lang={lang} />
    </div>
  )
}
