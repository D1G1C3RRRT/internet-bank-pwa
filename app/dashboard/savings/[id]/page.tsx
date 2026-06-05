import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Landmark } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import type { Language } from '@/lib/i18n'
import { getSavingsGoal } from '@/app/actions/savings'
import { DashboardHeader } from '@/components/dashboard-header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { SavingsGoalCard } from '@/components/savings-goal-card'
import { SavingsTransferForm } from '@/components/savings-transfer-form'
import { accountLast4 } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function SavingsGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const lang = ((await cookies()).get('lang')?.value as Language) || 'sk'
  const { id } = await params
  const result = await getSavingsGoal(id)
  if (!result) notFound()

  const { goal, movements } = result
  const money = new Intl.NumberFormat(lang === 'sk' ? 'sk-SK' : 'en-US', {
    style: 'currency',
    currency: goal.currency,
  })

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground md:pb-10">
      <DashboardHeader user={user} />
      <main className="min-h-screen pt-20 md:pl-64 md:pt-8">
        <div className="mx-auto max-w-5xl space-y-7 px-4 py-6 sm:px-6">
          <Link href="/dashboard/savings" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {lang === 'sk' ? 'Späť na sporenie' : 'Back to savings'}
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
            <section className="space-y-6">
              <SavingsGoalCard {...goal} lang={lang} />

              <div className="rounded-[1.5rem] border border-zinc-200 p-5 dark:border-zinc-800">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Landmark className="h-4 w-4" />
                  <span className="text-xs font-extrabold uppercase tracking-widest">{lang === 'sk' ? 'Zdrojový účet' : 'Source account'}</span>
                </div>
                <p className="mt-3 font-black">•••• {accountLast4(goal.accountNumber)}</p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">
                  {lang === 'sk' ? 'Dostupné' : 'Available'}: {money.format(Number(goal.accountBalance))}
                </p>
              </div>

              <div className="rounded-[2rem] border border-zinc-200 p-6 dark:border-zinc-800">
                <h2 className="text-lg font-black">{lang === 'sk' ? 'História pohybov' : 'Movement history'}</h2>
                {movements.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">{lang === 'sk' ? 'Zatiaľ žiadne pohyby.' : 'No movements yet.'}</p>
                ) : (
                  <ol className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
                    {movements.map((movement) => (
                      <li key={movement.id} className="flex items-center justify-between gap-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${movement.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            {movement.type === 'deposit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold capitalize">{movement.type}</p>
                            <time className="text-xs text-muted-foreground">
                              {new Intl.DateTimeFormat(lang === 'sk' ? 'sk-SK' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(movement.createdAt)}
                            </time>
                          </div>
                        </div>
                        <p className={`font-black ${movement.type === 'deposit' ? 'text-emerald-500' : 'text-orange-500'}`}>
                          {movement.type === 'deposit' ? '+' : '-'}{money.format(Number(movement.amount))}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>

            <aside className="h-fit rounded-[2rem] border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-950/70 lg:sticky lg:top-8">
              <h2 className="text-lg font-black">{lang === 'sk' ? 'Presun peňazí' : 'Move money'}</h2>
              <p className="mb-6 mt-2 text-sm leading-6 text-muted-foreground">
                {lang === 'sk' ? 'Účet, cieľ aj história sa aktualizujú atomicky.' : 'The account, goal, and history update atomically.'}
              </p>
              <SavingsTransferForm goalId={goal.id} currency={goal.currency} lang={lang} />
            </aside>
          </div>
        </div>
      </main>
      <MobileBottomNav active="savings" lang={lang} />
    </div>
  )
}
