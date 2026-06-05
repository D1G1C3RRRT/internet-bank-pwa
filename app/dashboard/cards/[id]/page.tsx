import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock3, Landmark } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import type { Language } from '@/lib/i18n'
import { getCard } from '@/app/actions/cards'
import { DashboardHeader } from '@/components/dashboard-header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { CardVisual } from '@/components/card-visual'
import { CardControls } from '@/components/card-controls'
import { accountLast4 } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const lang = ((await cookies()).get('lang')?.value as Language) || 'sk'
  const { id } = await params
  const result = await getCard(id)

  if (!result) notFound()

  const { card, activity } = result
  const amount = new Intl.NumberFormat(lang === 'sk' ? 'sk-SK' : 'en-US', {
    style: 'currency',
    currency: card.currency,
  }).format(Number(card.dailyLimit))

  const monthlyAmount = new Intl.NumberFormat(lang === 'sk' ? 'sk-SK' : 'en-US', {
    style: 'currency',
    currency: card.currency,
  }).format(Number(card.monthlyLimit))

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground md:pb-10">
      <DashboardHeader user={user} />

      <main className="min-h-screen pt-20 md:pl-64 md:pt-8">
        <div className="mx-auto max-w-5xl space-y-7 px-4 py-6 sm:px-6">
          <Link href="/dashboard/cards" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {lang === 'sk' ? 'Späť na karty' : 'Back to cards'}
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
            <section className="space-y-6">
              <CardVisual {...card} />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-zinc-200 p-5 dark:border-zinc-800">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Landmark className="h-4 w-4" />
                    <span className="text-xs font-extrabold uppercase tracking-widest">
                      {lang === 'sk' ? 'Prepojený účet' : 'Linked account'}
                    </span>
                  </div>
                  <p className="mt-3 font-black">•••• {accountLast4(card.accountNumber)}</p>
                  <p className="mt-1 text-xs font-bold text-muted-foreground">{card.currency}</p>
                </div>

                <div className="rounded-[1.5rem] border border-zinc-200 p-5 dark:border-zinc-800">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    {lang === 'sk' ? 'Denný limit' : 'Daily limit'}
                  </p>
                  <p className="mt-3 text-2xl font-black">{amount}</p>
                </div>

                <div className="rounded-[1.5rem] border border-zinc-200 p-5 dark:border-zinc-800">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    {lang === 'sk' ? 'Mesačný limit' : 'Monthly limit'}
                  </p>
                  <p className="mt-3 text-2xl font-black">{monthlyAmount}</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-zinc-200 p-6 dark:border-zinc-800">
                <div className="mb-5 flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-black">
                    {lang === 'sk' ? 'História operácií' : 'Activity history'}
                  </h2>
                </div>

                {activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {lang === 'sk' ? 'Žiadna aktivita.' : 'No activity yet.'}
                  </p>
                ) : (
                  <ol className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {activity.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold">{item.description}</p>
                          <p className="mt-1 text-xs capitalize text-muted-foreground">{item.action.replace('_', ' ')}</p>
                        </div>
                        <time className="shrink-0 text-xs font-semibold text-muted-foreground">
                          {new Intl.DateTimeFormat(lang === 'sk' ? 'sk-SK' : 'en-GB', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(item.createdAt)}
                        </time>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>

            <aside className="h-fit rounded-[2rem] border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-950/70 lg:sticky lg:top-8">
              <h2 className="text-lg font-black">
                {lang === 'sk' ? 'Ovládanie karty' : 'Card controls'}
              </h2>
              <p className="mb-6 mt-2 text-sm leading-6 text-muted-foreground">
                {lang === 'sk'
                  ? 'Zmrazenie je okamžité. Zmenu limitu zaznamenáme do histórie.'
                  : 'Freezing is immediate. Limit changes are recorded in the activity history.'}
              </p>
              <CardControls
                cardId={card.id}
                status={card.status}
                dailyLimit={card.dailyLimit}
                monthlyLimit={card.monthlyLimit}
                allowContactless={card.allowContactless}
                allowOnlinePayments={card.allowOnlinePayments}
                allowInternational={card.allowInternational}
                currency={card.currency}
                lang={lang}
              />
            </aside>
          </div>
        </div>
      </main>

      <MobileBottomNav active="cards" lang={lang} />
    </div>
  )
}
