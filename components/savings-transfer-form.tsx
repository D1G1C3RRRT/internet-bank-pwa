'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { moveSavings } from '@/app/actions/savings'

export function SavingsTransferForm({
  goalId,
  currency,
  lang,
}: {
  goalId: string
  currency: string
  lang: 'en' | 'sk'
}) {
  const router = useRouter()
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit')
  const [amount, setAmount] = useState('')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    startTransition(async () => {
      const result = await moveSavings({ goalId, type, amount })
      setFeedback(result)
      if (result.ok) {
        setAmount('')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">
        {(['deposit', 'withdrawal'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            className={`h-10 rounded-xl text-xs font-extrabold transition ${
              type === option
                ? 'bg-white text-foreground shadow-sm dark:bg-zinc-800'
                : 'text-muted-foreground'
            }`}
          >
            {option === 'deposit'
              ? (lang === 'sk' ? 'Vklad' : 'Deposit')
              : (lang === 'sk' ? 'Výber' : 'Withdraw')}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="savings-amount" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {lang === 'sk' ? 'Suma' : 'Amount'}
        </label>
        <div className="relative">
          <input
            id="savings-amount"
            type="number"
            min="0.01"
            max="10000000"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 pr-14 text-sm font-bold outline-none focus:border-pink-500 dark:border-zinc-800 dark:bg-zinc-950"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">{currency}</span>
        </div>
      </div>

      {feedback && (
        <p role="status" className={`text-sm font-semibold ${feedback.ok ? 'text-emerald-500' : 'text-red-500'}`}>
          {feedback.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-2xl bg-pink-600 px-5 text-sm font-extrabold text-white transition hover:bg-pink-500 disabled:opacity-50"
      >
        {isPending
          ? (lang === 'sk' ? 'Spracúvam…' : 'Processing…')
          : type === 'deposit'
            ? (lang === 'sk' ? 'Pridať do sporenia' : 'Add to savings')
            : (lang === 'sk' ? 'Vrátiť na účet' : 'Return to account')}
      </button>
    </form>
  )
}
