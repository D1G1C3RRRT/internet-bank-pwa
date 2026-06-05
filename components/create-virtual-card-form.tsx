'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createVirtualCard } from '@/app/actions/cards'
import { accountLast4 } from '@/lib/utils'

type AccountOption = {
  id: string
  accountNumber: string
  currency: string
}

export function CreateVirtualCardForm({
  accounts,
  lang,
}: {
  accounts: AccountOption[]
  lang: 'en' | 'sk'
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [label, setLabel] = useState(lang === 'sk' ? 'Virtuálna karta' : 'Virtual card')
  const [bankAccountId, setBankAccountId] = useState(accounts[0]?.id ?? '')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    startTransition(async () => {
      const result = await createVirtualCard({ bankAccountId, label })
      setFeedback(result)

      if (result.ok) {
        setLabel(lang === 'sk' ? 'Virtuálna karta' : 'Virtual card')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="card-label" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {lang === 'sk' ? 'Názov karty' : 'Card name'}
        </label>
        <input
          id="card-label"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          minLength={2}
          maxLength={32}
          required
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="card-account" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {lang === 'sk' ? 'Prepojený účet' : 'Linked account'}
        </label>
        <select
          id="card-account"
          value={bankAccountId}
          onChange={(event) => setBankAccountId(event.target.value)}
          required
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              •••• {accountLast4(account.accountNumber)} · {account.currency}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        {lang === 'sk'
          ? 'Ukladáme iba posledné 4 číslice. Číslo karty, CVV ani PIN sa v tejto aplikácii negenerujú ani neukladajú.'
          : 'Only the last 4 digits are stored. This app never generates or stores a card number, CVV, or PIN.'}
      </p>

      {feedback && (
        <p role="status" className={`text-sm font-semibold ${feedback.ok ? 'text-emerald-500' : 'text-red-500'}`}>
          {feedback.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || accounts.length === 0}
        className="h-12 w-full rounded-2xl bg-blue-600 px-5 text-sm font-extrabold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? (lang === 'sk' ? 'Vytváram…' : 'Creating…')
          : (lang === 'sk' ? 'Vytvoriť virtuálnu kartu' : 'Create virtual card')}
      </button>
    </form>
  )
}
