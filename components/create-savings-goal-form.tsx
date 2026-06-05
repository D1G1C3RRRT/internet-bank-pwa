'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSavingsGoal } from '@/app/actions/savings'
import { accountLast4 } from '@/lib/utils'

type AccountOption = {
  id: string
  accountNumber: string
  currency: string
}

export function CreateSavingsGoalForm({
  accounts,
  lang,
}: {
  accounts: AccountOption[]
  lang: 'en' | 'sk'
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [bankAccountId, setBankAccountId] = useState(accounts[0]?.id ?? '')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    startTransition(async () => {
      const result = await createSavingsGoal({ bankAccountId, name, targetAmount, targetDate })
      setFeedback(result)
      if (result.ok) {
        setName('')
        setTargetAmount('')
        setTargetDate('')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="goal-name" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {lang === 'sk' ? 'Názov cieľa' : 'Goal name'}
        </label>
        <input
          id="goal-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={48}
          placeholder={lang === 'sk' ? 'Napr. Nové auto' : 'e.g. New car'}
          required
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none focus:border-pink-500 dark:border-zinc-800 dark:bg-zinc-950"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="goal-amount" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
            {lang === 'sk' ? 'Cieľová suma' : 'Target'}
          </label>
          <input
            id="goal-amount"
            type="number"
            min="1"
            step="0.01"
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
            required
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none focus:border-pink-500 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="goal-date" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
            {lang === 'sk' ? 'Termín' : 'Date'}
          </label>
          <input
            id="goal-date"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-semibold outline-none focus:border-pink-500 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="goal-account" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {lang === 'sk' ? 'Zdrojový účet' : 'Source account'}
        </label>
        <select
          id="goal-account"
          value={bankAccountId}
          onChange={(event) => setBankAccountId(event.target.value)}
          required
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none focus:border-pink-500 dark:border-zinc-800 dark:bg-zinc-950"
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              •••• {accountLast4(account.accountNumber)} · {account.currency}
            </option>
          ))}
        </select>
      </div>

      {feedback && (
        <p role="status" className={`text-sm font-semibold ${feedback.ok ? 'text-emerald-500' : 'text-red-500'}`}>
          {feedback.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || accounts.length === 0}
        className="h-12 w-full rounded-2xl bg-pink-600 px-5 text-sm font-extrabold text-white transition hover:bg-pink-500 disabled:opacity-50"
      >
        {isPending
          ? (lang === 'sk' ? 'Vytváram…' : 'Creating…')
          : (lang === 'sk' ? 'Vytvoriť cieľ' : 'Create goal')}
      </button>
    </form>
  )
}
