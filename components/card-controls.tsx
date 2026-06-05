'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  setCardFrozen,
  updateCardDailyLimit,
  updateCardMonthlyLimit,
  toggleCardContactless,
  toggleCardOnlinePayments,
  toggleCardInternational,
} from '@/app/actions/cards'

export function CardControls({
  cardId,
  status,
  dailyLimit,
  monthlyLimit,
  allowContactless,
  allowOnlinePayments,
  allowInternational,
  currency,
  lang,
}: {
  cardId: string
  status: string
  dailyLimit: string
  monthlyLimit: string
  allowContactless: boolean
  allowOnlinePayments: boolean
  allowInternational: boolean
  currency: string
  lang: 'en' | 'sk'
}) {
  const router = useRouter()
  const [dLimit, setDLimit] = useState(dailyLimit)
  const [mLimit, setMLimit] = useState(monthlyLimit)
  const [contactless, setContactless] = useState(allowContactless)
  const [onlinePayments, setOnlinePayments] = useState(allowOnlinePayments)
  const [international, setInternational] = useState(allowInternational)
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const isFrozen = status === 'frozen'

  function changeFrozenState() {
    setFeedback(null)
    startTransition(async () => {
      const result = await setCardFrozen({ cardId, frozen: !isFrozen })
      setFeedback(result)
      if (result.ok) router.refresh()
    })
  }

  function changeDailyLimit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    startTransition(async () => {
      const result = await updateCardDailyLimit({ cardId, dailyLimit: Number(dLimit) })
      setFeedback(result)
      if (result.ok) router.refresh()
    })
  }

  function changeMonthlyLimit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    startTransition(async () => {
      const result = await updateCardMonthlyLimit({ cardId, monthlyLimit: Number(mLimit) })
      setFeedback(result)
      if (result.ok) router.refresh()
    })
  }

  function handleToggleContactless(checked: boolean) {
    setContactless(checked)
    setFeedback(null)
    startTransition(async () => {
      const result = await toggleCardContactless({ cardId, allowed: checked })
      setFeedback(result)
      if (result.ok) router.refresh()
      else setContactless(!checked)
    })
  }

  function handleToggleOnlinePayments(checked: boolean) {
    setOnlinePayments(checked)
    setFeedback(null)
    startTransition(async () => {
      const result = await toggleCardOnlinePayments({ cardId, allowed: checked })
      setFeedback(result)
      if (result.ok) router.refresh()
      else setOnlinePayments(!checked)
    })
  }

  function handleToggleInternational(checked: boolean) {
    setInternational(checked)
    setFeedback(null)
    startTransition(async () => {
      const result = await toggleCardInternational({ cardId, allowed: checked })
      setFeedback(result)
      if (result.ok) router.refresh()
      else setInternational(!checked)
    })
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={changeFrozenState}
        disabled={isPending || status === 'closed'}
        className={`h-12 w-full rounded-2xl px-5 text-sm font-extrabold text-white transition disabled:opacity-50 ${
          isFrozen ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'
        }`}
      >
        {isFrozen
          ? (lang === 'sk' ? 'Odblokovať kartu' : 'Unfreeze card')
          : (lang === 'sk' ? 'Zmraziť kartu' : 'Freeze card')}
      </button>

      {/* Daily limit form */}
      <form onSubmit={changeDailyLimit} className="space-y-3">
        <label htmlFor="daily-limit" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {lang === 'sk' ? 'Denný limit' : 'Daily limit'}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="daily-limit"
              type="number"
              inputMode="decimal"
              min="10"
              max="50000"
              step="0.01"
              value={dLimit}
              onChange={(event) => setDLimit(event.target.value)}
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 pr-12 text-sm font-bold outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
              {currency}
            </span>
          </div>
          <button
            type="submit"
            disabled={isPending || status === 'closed'}
            className="rounded-2xl bg-zinc-900 px-5 text-sm font-extrabold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {lang === 'sk' ? 'Uložiť' : 'Save'}
          </button>
        </div>
      </form>

      {/* Monthly limit form */}
      <form onSubmit={changeMonthlyLimit} className="space-y-3">
        <label htmlFor="monthly-limit" className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {lang === 'sk' ? 'Mesačný limit' : 'Monthly limit'}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="monthly-limit"
              type="number"
              inputMode="decimal"
              min="10"
              max="50000"
              step="0.01"
              value={mLimit}
              onChange={(event) => setMLimit(event.target.value)}
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 pr-12 text-sm font-bold outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
              {currency}
            </span>
          </div>
          <button
            type="submit"
            disabled={isPending || status === 'closed'}
            className="rounded-2xl bg-zinc-900 px-5 text-sm font-extrabold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {lang === 'sk' ? 'Uložiť' : 'Save'}
          </button>
        </div>
      </form>

      {/* Feature Switches */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {lang === 'sk' ? 'Zabezpečenie a funkcie' : 'Security & Features'}
        </span>
        
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">
                {lang === 'sk' ? 'Bezkontaktné platby' : 'Contactless payments'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {lang === 'sk' ? 'Platby priložením karty / mobilu' : 'Pay by tapping card or phone'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={contactless}
                disabled={isPending || status === 'closed' || isFrozen}
                onChange={(e) => handleToggleContactless(e.target.checked)}
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-[#670884] transition-all"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900/40 pt-4">
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">
                {lang === 'sk' ? 'Online platby' : 'Online payments'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {lang === 'sk' ? 'Platby na internete a e-shopoch' : 'Card usage for online shopping'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={onlinePayments}
                disabled={isPending || status === 'closed' || isFrozen}
                onChange={(e) => handleToggleOnlinePayments(e.target.checked)}
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-[#670884] transition-all"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900/40 pt-4">
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">
                {lang === 'sk' ? 'Platby v zahraničí' : 'International payments'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {lang === 'sk' ? 'Umožniť platby mimo územia SR' : 'Card usage outside home country'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={international}
                disabled={isPending || status === 'closed' || isFrozen}
                onChange={(e) => handleToggleInternational(e.target.checked)}
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-[#670884] transition-all"></div>
            </label>
          </div>
        </div>
      </div>

      {feedback && (
        <p role="status" className={`text-sm font-semibold ${feedback.ok ? 'text-emerald-500' : 'text-red-500'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  )
}
