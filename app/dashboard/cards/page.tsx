import Link from 'next/link'
import { cookies } from 'next/headers'
import { CreditCard, Plus, ShieldCheck } from 'lucide-react'
import { requireUser } from '@/lib/auth/require-user'
import type { Language } from '@/lib/i18n'
import { getBankAccounts } from '@/app/actions/banking'
import { getCards } from '@/app/actions/cards'
import { DashboardHeader } from '@/components/dashboard-header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { CardVisual } from '@/components/card-visual'
import { CreateVirtualCardForm } from '@/components/create-virtual-card-form'
import { accountLast4 } from '@/lib/utils'

export const metadata = {
  title: 'Cards - Internet Bank',
  description: 'Manage your physical and virtual cards',
}

export const dynamic = 'force-dynamic'

export default async function CardsPage() {
  const user = await requireUser()
  const lang = ((await cookies()).get('lang')?.value as Language) || 'sk'
  const [cards, accounts] = await Promise.all([getCards(), getBankAccounts()])
  const activeCards = cards.filter((card) => card.status === 'active').length

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground md:pb-10">
      <DashboardHeader user={user} />

      <main className="min-h-screen pt-20 md:pl-64 md:pt-8">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/15 text-blue-500">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">
                  {lang === 'sk' ? 'Karty' : 'Cards'}
                </h1>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                {lang === 'sk'
                  ? 'Spravujte virtuálne a fyzické karty bez zobrazovania citlivých kartových údajov.'
                  : 'Manage virtual and physical cards without exposing sensitive card credentials.'}
              </p>
            </div>

            <div className="flex gap-3">
              <div className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  {lang === 'sk' ? 'Aktívne' : 'Active'}
                </p>
                <p className="mt-1 text-xl font-black">{activeCards}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  {lang === 'sk' ? 'Spolu' : 'Total'}
                </p>
                <p className="mt-1 text-xl font-black">{cards.length}</p>
              </div>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
            <section className="space-y-4" aria-labelledby="card-list-title">
              <div className="flex items-center justify-between">
                <h2 id="card-list-title" className="text-lg font-black">
                  {lang === 'sk' ? 'Vaše karty' : 'Your cards'}
                </h2>
                <span className="text-xs font-bold text-muted-foreground">
                  {cards.length} {lang === 'sk' ? 'kariet' : 'cards'}
                </span>
              </div>

              {cards.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-zinc-300 px-6 py-14 text-center dark:border-zinc-800">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-5 text-lg font-black">
                    {lang === 'sk' ? 'Zatiaľ nemáte žiadnu kartu' : 'No cards yet'}
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    {lang === 'sk'
                      ? 'Vytvorte si bezpečný profil virtuálnej karty pre jeden zo svojich účtov.'
                      : 'Create a secure virtual card profile linked to one of your accounts.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {cards.map((card) => (
                    <Link key={card.id} href={`/dashboard/cards/${card.id}`} className="group block">
                      <CardVisual {...card} compact />
                      <div className="mt-3 flex items-center justify-between px-1 text-xs">
                        <span className="font-bold text-muted-foreground">
                          •••• {accountLast4(card.accountNumber)} · {card.currency}
                        </span>
                        <span className="font-extrabold text-blue-500 transition group-hover:translate-x-0.5">
                          {lang === 'sk' ? 'Detail →' : 'Details →'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-950/70">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-blue-500">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-black">
                      {lang === 'sk' ? 'Nová virtuálna karta' : 'New virtual card'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {lang === 'sk' ? 'Predvolený limit 500' : 'Default limit 500'}
                    </p>
                  </div>
                </div>

                {accounts.length > 0 ? (
                  <CreateVirtualCardForm
                    lang={lang}
                    accounts={accounts.map((account) => ({
                      id: account.id,
                      accountNumber: account.accountNumber,
                      currency: account.currency,
                    }))}
                  />
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {lang === 'sk'
                      ? 'Najprv vytvorte bankový účet.'
                      : 'Create a bank account before adding a card.'}
                  </p>
                )}
              </div>

              <div className="flex gap-3 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/5 p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-xs leading-5 text-muted-foreground">
                  {lang === 'sk'
                    ? 'Aplikácia zobrazuje iba posledné štyri číslice a neukladá PAN, CVV ani PIN.'
                    : 'The app only displays the last four digits and never stores PAN, CVV, or PIN.'}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <MobileBottomNav active="cards" lang={lang} />
    </div>
  )
}
